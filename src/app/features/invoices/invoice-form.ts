import { Component, OnInit, QueryList, ViewChildren, ElementRef, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ClientsService } from '../../core/services/clients.service';
import { PageHeader } from '../../shared/components/page-header';
import { ProductsService } from '../../core/services/products.service';
import { InvoicesService } from '../../core/services/invoices.service';
import { ClientQuickDialog } from '../clients/client-quick-dialog';
import type { ClientDto } from '../../core/models/client.model';
import type { ProductDto } from '../../core/models/product.model';
import type { Presentation } from '../../core/models/presentation';

@Component({
  selector: 'app-invoice-form',
  imports: [
    PageHeader,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDividerModule,
    MatDialogModule,
    CurrencyPipe,
  ],
  styleUrl: './invoice-form.css',
  templateUrl: './invoice-form.html',
})
export class InvoiceForm implements OnInit {
  protected readonly form: FormGroup;
  protected readonly clients = signal<ClientDto[]>([]);
  protected readonly products = signal<ProductDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  @ViewChildren('cant') protected cantidadInputs?: QueryList<ElementRef<HTMLInputElement>>;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly clientsService = inject(ClientsService);
  private readonly productsService = inject(ProductsService);
  private readonly invoicesService = inject(InvoicesService);

  constructor() {
    this.form = this.fb.group({
      cliente_id_publico: ['', Validators.required],
      cliente_busqueda: [''],
      detalles: this.fb.array([]),
    });
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.clientsService.getClients().subscribe({
      next: (clients) => this.clients.set(clients),
    });
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addLine(): void {
    const line = this.fb.group({
      producto_id_publico: ['', Validators.required],
      producto_busqueda: [''],
      presentacion: ['Unit' satisfies Presentation, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
    this.detalles.push(line);
  }

  removeLine(index: number): void {
    this.detalles.removeAt(index);
  }

  productOf(index: number): ProductDto | undefined {
    const productId = this.detalles.at(index).get('producto_id_publico')?.value;
    return this.products().find((p) => p.id === productId);
  }

  filteredClients(): ClientDto[] {
    const q = (this.form.get('cliente_busqueda')?.value ?? '').toString().toLowerCase().trim();
    if (!q) return this.clients();
    return this.clients().filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.identificacion.includes(q) ||
        c.correo.toLowerCase().includes(q),
    );
  }

  filteredProducts(index: number): ProductDto[] {
    const line = this.detalles.at(index);
    const q = (line.get('producto_busqueda')?.value ?? '').toString().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(
      (p) => p.nombre.toLowerCase().includes(q) || (p.codigo?.toLowerCase() ?? '').includes(q),
    );
  }

  onClientInput(): void {
    this.form.get('cliente_id_publico')?.setValue('');
  }

  onClientSelected(event: MatAutocompleteSelectedEvent): void {
    const client = this.clients().find((c) => c.id === event.option.value);
    this.form.get('cliente_id_publico')?.setValue(event.option.value);
    this.form.get('cliente_busqueda')?.setValue(client ? client.nombre : event.option.value);
  }

  onCreateClient(event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      event.source.deselect();
      this.openNewClient();
    }
  }

  onProductInput(index: number): void {
    this.detalles.at(index).get('producto_id_publico')?.setValue('');
  }

  onProductSelected(index: number, event: MatAutocompleteSelectedEvent): void {
    const product = this.products().find((p) => p.id === event.option.value);
    const line = this.detalles.at(index);
    line.get('producto_id_publico')?.setValue(event.option.value);
    line.get('producto_busqueda')?.setValue(product ? product.nombre : event.option.value);
    // La presentación de la línea se deriva del modo de venta del producto
    line.get('presentacion')?.setValue(product?.presentacion === 'Paca' ? 'Box' : 'Unit');
    // Foco en la cantidad para agilizar
    requestAnimationFrame(() => this.cantidadInputs?.get(index)?.nativeElement.focus());
  }

  productPriceHint(index: number): string {
    const product = this.productOf(index);
    if (!product) return '';
    const unit = product.presentacion === 'Paca' ? 'paca' : 'unidad';
    return `${product.precio_venta.toFixed(2)} USD / ${unit}`;
  }

  openNewClient(): void {
    this.dialog
      .open(ClientQuickDialog, { width: '440px' })
      .afterClosed()
      .subscribe((client?: ClientDto) => {
        if (!client) return;
        this.clientsService.getClients().subscribe((clients) => {
          this.clients.set(clients);
          this.form.get('cliente_id_publico')?.setValue(client.id);
          this.form.get('cliente_busqueda')?.setValue(client.nombre);
        });
      });
  }

  lineSubtotal(index: number): number {
    const line = this.detalles.at(index).value;
    const product = this.products().find(
      (p) => p.id === line.producto_id_publico,
    );
    if (!product) return 0;
    return (product.precio_venta ?? 0) * (line.cantidad ?? 0);
  }

  total(): number {
    let sum = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      sum += this.lineSubtotal(i);
    }
    return sum;
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const dto = {
      cliente_id_publico: this.form.get('cliente_id_publico')?.value,
      detalles: this.detalles.value.map((line: { producto_id_publico: string; presentacion: string; cantidad: number }) => ({
        producto_id_publico: line.producto_id_publico,
        presentacion: line.presentacion,
        cantidad: line.cantidad,
      })),
    };
    this.invoicesService.createInvoice(dto).subscribe({
      next: (id) => {
        this.saving.set(false);
        this.router.navigate(['/facturas', id]);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/facturas']);
  }
}