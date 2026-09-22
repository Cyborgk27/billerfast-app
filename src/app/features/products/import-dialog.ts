import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductsService } from '../../core/services/products.service';

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

  private readonly dialogRef = inject(MatDialogRef<ImportDialog>);
  private readonly productsService = inject(ProductsService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile.set(file ?? null);
  }

  submit(): void {
    const file = this.selectedFile();
    if (!file || this.uploading()) return;
    this.uploading.set(true);
    this.productsService.importProducts(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.dialogRef.close(true);
      },
      error: () => this.uploading.set(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}