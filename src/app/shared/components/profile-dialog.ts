import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-profile-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressBarModule],
  styleUrl: './profile-dialog.css',
  templateUrl: './profile-dialog.html',
})
export class ProfileDialog {
  protected readonly user = inject(AuthService).user;
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly uploading = signal(false);

  private readonly dialogRef = inject(MatDialogRef<ProfileDialog>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly settingsService = inject(SettingsService);

  avatarUrl(): string {
    const id = this.user()?.id_publico;
    return id ? `/api/images/user/${id}` : '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedImage.set(file);
    const old = this.previewUrl();
    if (old) URL.revokeObjectURL(old);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  save(): void {
    const file = this.selectedImage();
    if (!file || this.uploading()) return;
    this.uploading.set(true);
    this.settingsService.uploadAvatar(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.snackBar.open('Foto actualizada.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.uploading.set(false),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}