import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

const AVATAR_PRESETS = [
  { preset: 0, color: '#c94f3d', label: 'Rojo' },
  { preset: 1, color: '#c9802f', label: 'Naranja' },
  { preset: 2, color: '#8fb32b', label: 'Verde' },
  { preset: 3, color: '#2fae59', label: 'Esmeralda' },
  { preset: 4, color: '#2b8f9e', label: 'Teal' },
  { preset: 5, color: '#4a5bc4', label: 'Índigo' },
  { preset: 6, color: '#a33a9e', label: 'Púrpura' },
  { preset: 7, color: '#b23a6e', label: 'Rosa' },
];

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
    MatTooltipModule,
  ],
  styleUrl: './profile-dialog.css',
  templateUrl: './profile-dialog.html',
})
export class ProfileDialog implements OnInit {
  protected readonly user = inject(AuthService).currentUser;
  protected readonly presets = AVATAR_PRESETS;
  protected readonly selectedImage = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly avatarVersion = signal(Date.now());
  protected readonly busy = signal('');
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
    return id ? `/api/images/user/${id}?v=${this.avatarVersion()}` : '';
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
    if (!file || this.busy()) return;
    this.busy.set('avatar');
    this.settingsService.uploadAvatar(file).subscribe({
      next: () => {
        this.busy.set('');
        this.selectedImage.set(null);
        this.avatarVersion.set(Date.now());
        this.snackBar.open('Foto actualizada.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.busy.set(''),
    });
  }

  choosePreset(preset: number): void {
    if (this.busy()) return;
    this.busy.set('preset');
    this.settingsService.setAvatarPreset(preset).subscribe({
      next: () => {
        this.busy.set('');
        this.avatarVersion.set(Date.now());
        this.snackBar.open('Avatar por defecto actualizado.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.busy.set(''),
    });
  }

  resetAvatar(): void {
    if (this.busy()) return;
    this.busy.set('reset');
    this.settingsService.resetAvatar().subscribe({
      next: () => {
        this.busy.set('');
        this.avatarVersion.set(Date.now());
        this.snackBar.open('Avatar por defecto restaurado.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.busy.set(''),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.busy()) return;
    this.busy.set('profile');
    const v = this.profileForm.value;
    this.authService.updateMe({ apodo: v.apodo, correo: v.correo }).subscribe({
      next: () => {
        this.busy.set('');
        this.snackBar.open('Datos guardados.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.busy.set(''),
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.busy()) return;
    this.busy.set('password');
    const v = this.passwordForm.value;
    this.authService
      .changePassword({ contrasena_actual: v.contrasena_actual, contrasena_nueva: v.contrasena_nueva })
      .subscribe({
        next: () => {
          this.busy.set('');
          this.passwordForm.reset();
          this.snackBar.open('Contraseña actualizada.', 'Cerrar', { duration: 3000 });
        },
        error: () => this.busy.set(''),
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}