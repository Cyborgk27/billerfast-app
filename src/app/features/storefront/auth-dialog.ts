import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorefrontService } from '../../core/services/storefront.service';
import { CustomerAuthService } from '../../core/services/customer-auth.service';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressBarModule,
  ],
  styleUrl: './auth-dialog.css',
  templateUrl: './auth-dialog.html',
})
export class AuthDialog {
  protected readonly loginForm: FormGroup;
  protected readonly registerForm: FormGroup;
  protected readonly busy = signal(false);

  private readonly fb = inject(FormBuilder);
  protected readonly dialogRef = inject(MatDialogRef<AuthDialog>);
  private readonly data = inject<{ slug: string }>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);
  private readonly storefrontService = inject(StorefrontService);
  private readonly customerAuthService = inject(CustomerAuthService);

  constructor() {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
    });
  }

  login(): void {
    if (this.loginForm.invalid || this.busy()) return;
    this.busy.set(true);
    this.storefrontService.login(this.data.slug, this.loginForm.value).subscribe({
      next: (res) => {
        this.busy.set(false);
        this.customerAuthService.setSession(res.token, res.usuario);
        this.snackBar.open(`Hola ${res.usuario.apodo}.`, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => this.busy.set(false),
    });
  }

  register(): void {
    if (this.registerForm.invalid || this.busy()) return;
    this.busy.set(true);
    const v = this.registerForm.value;
    this.storefrontService
      .register(this.data.slug, {
        nombre: v.nombre,
        correo: v.correo,
        contrasena: v.contrasena,
        telefono: v.telefono || undefined,
      })
      .subscribe({
        next: (res) => {
          this.busy.set(false);
          this.customerAuthService.setSession(res.token, res.usuario);
          this.snackBar.open('Cuenta creada. ¡Bienvenido!', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => this.busy.set(false),
      });
  }
}