import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductsService } from '../../core/services/products.service';
import type { ImportResultDto } from '../../core/models/product.model';

@Component({
  selector: 'app-import-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './import-dialog.html',
})
export class ImportDialog {
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploading = signal(false);
  protected readonly result = signal<ImportResultDto | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly dialogRef = inject(MatDialogRef<ImportDialog>);
  private readonly productsService = inject(ProductsService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile.set(file ?? null);
    this.error.set(null);
  }

  submit(): void {
    const file = this.selectedFile();
    if (!file || this.uploading()) return;
    this.uploading.set(true);
    this.error.set(null);
    this.productsService.importProducts(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.result.set(res);
      },
      error: () => {
        this.uploading.set(false);
        this.error.set('No se pudo importar el archivo. Verifica que sea .xlsx o .json con el formato del export.');
      },
    });
  }

  close(): void {
    this.dialogRef.close(this.result() !== null);
  }
}