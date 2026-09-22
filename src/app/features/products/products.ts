import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import type { ProductDto } from '../../core/models/product.model';
import { ImportDialog } from './import-dialog';
import { ExportDialog } from './export-dialog';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';

@Component({
  selector: 'app-products',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    CurrencyPipe,
    RouterLink,
  ],
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products implements OnInit {
  protected readonly products = signal<ProductDto[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo?.toLowerCase() ?? '').includes(q),
    );
  });

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  constructor(private readonly productsService: ProductsService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.productsService.getProducts().subscribe({
      next: (items) => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openImport(): void {
    const dialogRef = this.dialog.open(ImportDialog, { width: '360px' });
    dialogRef.afterClosed().subscribe((imported) => {
      if (imported) this.reload();
    });
  }

  openExport(): void {
    this.dialog
      .open(ExportDialog, { width: '400px' })
      .afterClosed()
      .subscribe((formato?: 'excel' | 'json') => {
        if (formato) this.exportProducts(formato);
      });
  }

  exportProducts(formato: 'excel' | 'json'): void {
    this.productsService.exportProducts(formato).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `productos.${formato === 'excel' ? 'xlsx' : 'json'}`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  deleteProduct(product: ProductDto): void {
    const dialogRef = this.dialog.open(ConfirmDialog, { width: '360px' });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.productsService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado.', 'Cerrar', { duration: 3000 });
          this.reload();
        },
      });
    });
  }
}