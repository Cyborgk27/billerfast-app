import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientsService } from '../../core/services/clients.service';
import type { ClientDto } from '../../core/models/client.model';

@Component({
  selector: 'app-client-quick-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './client-quick-dialog.html',
})
export class ClientQuickDialog {
  protected readonly form: FormGroup;
  protected readonly saving = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ClientQuickDialog>);
  private readonly clientsService = inject(ClientsService);

  constructor() {
    this.form = this.fb.group({
      identificacion: [
        '',
        [Validators.minLength(10), Validators.maxLength(13), Validators.pattern(/^\d+$/)],
      ],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      correo: ['', [Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]],
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.form.value;
    this.clientsService.createClient(v).subscribe({
      next: (id) => {
        this.saving.set(false);
        const client: ClientDto = { id, ...v };
        this.dialogRef.close(client);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}