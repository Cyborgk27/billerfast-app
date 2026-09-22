import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-profile-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
  ],
  styleUrl: './profile-dialog.css',
  templateUrl: './profile-dialog.html',
})
export class ProfileDialog implements OnInit {
  protected readonly user = inject(AuthService).user;
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly profileForm: FormGroup;
  protected readonly passwordForm: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProfileDialog>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);

  constructor() {
    this.profileForm = this.fb.group({
      apodo: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
    });
    this.passwordForm = this.fb.group({
      contrasena_actual: ['', Validators.required],
      contrasena_nueva: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.profileForm.patchValue({ apodo: u.apodo, correo: u.correo });
    }
  }

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

  saveAvatar(): void {
    const file = this.selectedImage();
    if (!file || this.uploading()) return;
    this.uploading.set(true);
    this.settingsService.uploadAvatar(file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.snackBar.open('Foto actualizada.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.uploading.set(false),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) return;
    this.savingProfile.set(true);
    const v = this.profileForm.value;
    this.authService.updateMe({ apodo: v.apodo, correo: v.correo }).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.snackBar.open('Datos guardados.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.savingProfile.set(false),
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) return;
    this.savingPassword.set(true);
    const v = this.passwordForm.value;
    this.authService.changePassword({ contrasena_actual: v.contrasena_actual, contrasena_nueva: v.contrasena_nueva }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Contraseña actualizada.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.savingPassword.set(false),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}