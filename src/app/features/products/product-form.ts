import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { ProductsService } from '../../core/services/products.service';
import { imageUrl } from '../../core/utils/media-url';
import { PageHeader } from '../../shared/components/page-header';
import type { CreateOrUpdateProductDto } from '../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [
    PageHeader,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  styleUrl: './product-form.css',
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
  protected readonly form: FormGroup;
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly loading = signal(false);
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly currentImageId = signal<string | null>(null);
  protected readonly imagePreviewUrl = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedImage.set(file ?? null);
    if (file) {
      const old = this.imagePreviewUrl();
      if (old) URL.revokeObjectURL(old);
      this.imagePreviewUrl.set(URL.createObjectURL(file));
    } else {
      this.imagePreviewUrl.set(null);
    }
  }

  currentImageUrl(): string | null {
    return this.currentImageId() ? imageUrl(`/api/images/product/${this.currentImageId()}`) : null;
  }
  private editingId = '';

  constructor() {
    this.form = this.fb.group({
      code: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      presentacion: ['Unidad', Validators.required],
      precio_venta: [
        null,
        [Validators.required, Validators.min(0.01), Validators.max(1000000)],
      ],
      precio_costo: [null, [Validators.min(0), Validators.max(1000000)]],
      cantidad_por_paca: [1, [Validators.min(1), Validators.max(2147483647)]],
      stock: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit.set(true);
        this.editingId = params['id'];
        this.loadProduct(params['id']);
      }
    });
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.currentImageId.set(product.id);
        this.form.patchValue({
          code: product.codigo ?? '',
          nombre: product.nombre,
          presentacion: product.presentacion,
          precio_venta: product.precio_venta,
          precio_costo: product.precio_costo,
          cantidad_por_paca: product.cantidad_por_paca,
          stock: product.stock,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.form.value;
    const dto: CreateOrUpdateProductDto = {
      code: v.code ?? '',
      nombre: v.nombre,
      presentacion: v.presentacion,
      precio_venta: v.precio_venta,
      precio_costo: v.precio_costo ?? undefined,
      cantidad_por_paca: v.cantidad_por_paca ?? 1,
    };
    const stock: number = v.stock ?? 0;
    const imageFile = this.selectedImage();
    const request: Observable<unknown> = this.isEdit()
      ? this.productsService.updateProduct(this.editingId, dto)
      : this.productsService.createProduct(dto);

    request
      .pipe(
        switchMap((id) => {
          const targetId = this.isEdit() ? this.editingId : (id as string);
          return this.productsService.updateStock(targetId, stock).pipe(
            switchMap(() =>
              imageFile
                ? this.productsService.updateImage(targetId, imageFile)
                : of(undefined),
            ),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/productos']);
        },
        error: () => this.saving.set(false),
      });
  }

  cancel(): void {
    this.router.navigate(['/productos']);
  }
}