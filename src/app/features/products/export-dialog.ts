import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-export-dialog',
  imports: [MatDialogModule, MatButtonModule],
  styleUrl: './export-dialog.css',
  templateUrl: './export-dialog.html',
})
export class ExportDialog {
  protected readonly dialogRef = inject(MatDialogRef<ExportDialog>);

  exportExcel(): void {
    this.dialogRef.close('excel');
  }

  exportJson(): void {
    this.dialogRef.close('json');
  }

  cancel(): void {
    this.dialogRef.close();
  }
}