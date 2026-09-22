import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-install-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './install-dialog.html',
})
export class InstallDialog {
  protected readonly dialogRef = inject(MatDialogRef<InstallDialog>);

  close(): void {
    this.dialogRef.close();
  }
}