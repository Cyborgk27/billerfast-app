import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { AuthDialog } from './auth-dialog';
import { OrdersDialog } from './orders-dialog';
import type { PublicIssuerDto, PublicProductDto } from '../../core/models/storefront.model';
import { imageUrl } from '../../core/utils/media-url';

interface CartItem {
  product: PublicProductDto;
  presentacion: 'Unit' | 'Box';
  cantidad: number;
}

@Component({
  selector: 'app-storefront',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyPipe,
  ],
  styleUrl: './storefront.css',
  templateUrl: './storefront.html',
})
export class Storefront implements OnInit {
  protected readonly issuer = signal<PublicIssuerDto | null>(null);
  protected readonly products = signal<PublicProductDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly cart = signal<CartItem[]>([]);
  protected readonly ordering = signal(false);
  protected readonly orderResult = signal<{ numero_factura: string; total: number } | null>(null);
  protected readonly checkoutForm: FormGroup;

  protected readonly customer = inject(CustomerAuthService).user;
  protected readonly isCustomerAuthenticated = inject(CustomerAuthService).isAuthenticated;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly storefrontService = inject(StorefrontService);
  private readonly customerAuthService = inject(CustomerAuthService);
  private slug = '';

  protected readonly categories = computed(() => {
    const set = new Set(this.products().map((p) => p.presentacion));
    return [...set];
  });
  protected readonly featured = computed(() => this.products()[0] ?? null);
  protected readonly restProducts = computed(() => this.products().slice(1));
  protected readonly cartCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.cantidad, 0),
  );
  protected readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.product.precio_venta * item.cantidad, 0),
  );

  constructor() {
    this.checkoutForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      identificacion: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.slug = params['slug'];
      this.loadStore(this.slug);
    });
  }

  private loadStore(slug: string): void {
    this.loading.set(true);
    this.storefrontService.getIssuer(slug).subscribe({
      next: (issuer) => this.issuer.set(issuer),
      error: () => this.loading.set(false),
    });
    this.storefrontService.getProducts(slug).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  productImage(id: string): string {
    return imageUrl(`/api/images/product/${id}`);
  }

  logoUrl(): string {
    return imageUrl(`/api/images/issuer/${this.slug}`);
  }

  openAuth(): void {
    this.dialog.open(AuthDialog, { data: { slug: this.slug }, width: '460px' });
  }

  openOrders(): void {
    this.dialog.open(OrdersDialog, { data: { slug: this.slug }, width: '520px' });
  }

  logoutCustomer(): void {
    this.customerAuthService.logout();
  }

  addToCart(product: PublicProductDto): void {
    const presentacion: 'Unit' | 'Box' = product.presentacion === 'Paca' ? 'Box' : 'Unit';
    const existing = this.cart().find((i) => i.product.id_publico === product.id_publico && i.presentacion === presentacion);
    if (existing) {
      if (existing.cantidad + 1 > product.stock) {
        this.snackBar.open('Stock insuficiente.', 'Cerrar', { duration: 3000 });
        return;
      }
      this.cart.update((items) =>
        items.map((i) => (i.product.id_publico === product.id_publico && i.presentacion === presentacion ? { ...i, cantidad: i.cantidad + 1 } : i)),
      );
    } else {
      this.cart.update((items) => [...items, { product, presentacion, cantidad: 1 }]);
    }
  }

  addFeatured(): void {
    const f = this.featured();
    if (f) this.addToCart(f);
  }

  updateQuantity(index: number, cantidad: number): void {
    if (cantidad < 1) cantidad = 1;
    const item = this.cart()[index];
    if (cantidad > item.product.stock) cantidad = item.product.stock;
    this.cart.update((items) => items.map((i, idx) => (idx === index ? { ...i, cantidad } : i)));
  }

  removeFromCart(index: number): void {
    this.cart.update((items) => items.filter((_, idx) => idx !== index));
  }

  submitOrder(): void {
    if (this.cart().length === 0 || this.ordering()) return;
    if (!this.isCustomerAuthenticated() && this.checkoutForm.invalid) {
      this.snackBar.open('Completa tus datos o inicia sesión.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.ordering.set(true);
    const v = this.checkoutForm.value;
    this.storefrontService
      .createOrder(this.slug, {
        nombre: v.nombre,
        correo: v.correo,
        telefono: v.telefono,
        identificacion: v.identificacion || undefined,
        detalles: this.cart().map((item) => ({
          producto_id_publico: item.product.id_publico,
          presentacion: item.presentacion,
          cantidad: item.cantidad,
        })),
      })
      .subscribe({
        next: (order) => {
          this.ordering.set(false);
          this.orderResult.set({ numero_factura: order.numero_factura, total: order.total });
          this.cart.set([]);
        },
        error: () => this.ordering.set(false),
      });
  }
}