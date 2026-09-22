import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import type { RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    RouterLink,
  ],
  styleUrl: './auth.css',
  templateUrl: './register.html',
})
export class Register {
  protected readonly form: FormGroup;
  protected readonly loading = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  constructor() {
    this.form = this.fb.group({
      apodo: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      razon_social: [''],
      ruc: ['', [Validators.pattern(/^\d{13}$/)]],
      codigo_establecimiento: ['', [Validators.pattern(/^\d{3}$/)]],
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const value = this.form.value;
    const request: RegisterRequest = {
      apodo: value.apodo,
      correo: value.correo,
      contrasena: value.contrasena,
      razon_social: value.razon_social || undefined,
      ruc: value.ruc || undefined,
      codigo_establecimiento: value.codigo_establecimiento || undefined,
    };
    this.authService.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Cuenta creada. Inicia sesión.', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}