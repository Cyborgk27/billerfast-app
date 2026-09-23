import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ClientsService } from '../../core/services/clients.service';
import { PageHeader } from '../../shared/components/page-header';
import type { CreateOrUpdateClientDto } from '../../core/models/client.model';

@Component({
  selector: 'app-client-form',
  imports: [
    PageHeader,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  styleUrl: './client-form.css',
  templateUrl: './client-form.html',
})
export class ClientForm implements OnInit {
  protected readonly form: FormGroup;
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly loading = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientsService = inject(ClientsService);
  private editingId = '';

  constructor() {
    this.form = this.fb.group({
      identificacion: [
        '',
        [Validators.minLength(10), Validators.maxLength(13), Validators.pattern(/^\d+$/)],
      ],
      nombre: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(150)],
      ],
      correo: ['', [Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit.set(true);
        this.editingId = params['id'];
        this.loadClient(params['id']);
      }
    });
  }

  private loadClient(id: string): void {
    this.loading.set(true);
    this.clientsService.getClient(id).subscribe({
      next: (client) => {
        this.form.patchValue({
          identificacion: client.identificacion,
          nombre: client.nombre,
          correo: client.correo,
          telefono: client.telefono,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const dto = this.form.value as CreateOrUpdateClientDto;
    const request: Observable<unknown> = this.isEdit()
      ? this.clientsService.updateClient(this.editingId, dto)
      : this.clientsService.createClient(dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/clientes']);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/clientes']);
  }
}