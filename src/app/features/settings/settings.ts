import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import type { NotificationSettings } from '../../core/models/settings.model';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDividerModule,
    RouterLink,
  ],
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  protected readonly form: FormGroup;
  protected readonly issuerForm: FormGroup;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly testing = signal(false);
  protected readonly logoBusy = signal(false);
  protected readonly storeSlug = signal<string | null>(null);
  protected readonly storeName = signal<string | null>(null);
  protected readonly logoPreviewUrl = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly settingsService = inject(SettingsService);

  constructor() {
    this.form = this.fb.group({
      email_habilitado: [false],
      smtp_host: [''],
      smtp_puerto: [587, Validators.min(1)],
      smtp_usuario: [''],
      smtp_contrasena: [''],
      smtp_remitente: ['', Validators.email],
      smtp_ssl: [true],
      modo_demo: [true],
    });
    this.issuerForm = this.fb.group({
      nombre: ['', Validators.required],
      ruc: [''],
      correo: ['', Validators.email],
      telefono: [''],
      direccion: [''],
      color_factura: ['#3867d6'],
      color_factura_2: ['#0f172a'],
    });
  }

  ngOnInit(): void {
    this.settingsService.getNotifications().subscribe({
      next: (s) => {
        this.form.patchValue(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.settingsService.getIssuer().subscribe({
      next: (issuer) => {
        this.storeSlug.set(issuer.slug);
        this.storeName.set(issuer.nombre);
        this.issuerForm.patchValue({
          nombre: issuer.nombre,
          ruc: issuer.ruc ?? '',
          correo: issuer.correo ?? '',
          telefono: issuer.telefono ?? '',
          direccion: issuer.direccion ?? '',
          color_factura: issuer.color_factura ? '#' + issuer.color_factura : '#3867d6',
          color_factura_2: issuer.color_factura_2 ? '#' + issuer.color_factura_2 : '#0f172a',
        });
      },
    });
  }

  logoUrl(): string {
    return this.storeSlug() ? `/api/images/issuer/${this.storeSlug()}` : '';
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const old = this.logoPreviewUrl();
    if (old) URL.revokeObjectURL(old);
    this.logoPreviewUrl.set(URL.createObjectURL(file));
    this.logoBusy.set(true);
    this.settingsService.uploadLogo(file).subscribe({
      next: () => {
        this.logoBusy.set(false);
        this.snackBar.open('Logo actualizado.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.logoBusy.set(false),
    });
  }

  saveIssuer(): void {
    if (this.issuerForm.invalid) return;
    this.settingsService.updateIssuer(this.issuerForm.value).subscribe({
      next: () => {
        this.storeName.set(this.issuerForm.value.nombre);
        this.snackBar.open('Perfil actualizado.', 'Cerrar', { duration: 3000 });
      },
    });
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.settingsService.updateNotifications(this.form.value as NotificationSettings).subscribe({
      next: (s) => {
        this.saving.set(false);
        this.form.patchValue(s);
        this.snackBar.open('Ajustes guardados.', 'Cerrar', { duration: 3000 });
      },
      error: () => this.saving.set(false),
    });
  }

  test(): void {
    if (this.testing()) return;
    this.testing.set(true);
    const v = this.form.value;
    this.settingsService
      .testNotification(v.smtp_remitente || undefined, undefined)
      .subscribe({
        next: () => {
          this.testing.set(false);
          this.snackBar.open('Notificación de prueba enviada.', 'Cerrar', { duration: 3000 });
        },
        error: () => this.testing.set(false),
      });
  }
}