import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { ClientsService } from '../../core/services/clients.service';
import { imageUrl } from '../../core/utils/media-url';
import type { ClientDto, ImportClientDto } from '../../core/models/client.model';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';

interface ContactInfo {
  name: string[];
  tel: string[];
  email?: string[];
  icon?: Blob[];
}

interface ContactsManagerLike {
  select(properties: string[], options?: { multiple?: boolean }): Promise<ContactInfo[]>;
}

@Component({
  selector: 'app-clients',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatDialogModule,
    RouterLink,
  ],
  styleUrl: './clients.css',
  templateUrl: './clients.html',
})
export class Clients implements OnInit {
  protected readonly clients = signal<ClientDto[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly importing = signal(false);
  protected readonly contactsSupported =
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    'ContactsManager' in window;

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.clients();
    return this.clients().filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.identificacion.includes(q) ||
        c.correo.toLowerCase().includes(q),
    );
  });

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  constructor(private readonly clientsService: ClientsService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    this.loading.set(true);
    this.clientsService.getClients().subscribe({
      next: (items) => {
        this.clients.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  clientImage(id: string): string {
    return imageUrl(`/api/images/client/${id}`);
  }

  async importFromContacts(): Promise<void> {
    if (!this.contactsSupported || this.importing()) return;

    try {
      const manager = (navigator as unknown as { contacts: ContactsManagerLike }).contacts;
      const contacts = await manager.select(['name', 'tel', 'email', 'icon'], { multiple: true });

      const existingPhones = new Set(this.clients().map((c) => normalizePhone(c.telefono)));
      const clientes: ImportClientDto[] = [];
      const skipped: string[] = [];

      for (const contact of contacts) {
        const nombre = contact.name?.[0]?.trim();
        if (!nombre) {
          skipped.push('(contacto sin nombre)');
          continue;
        }

        const phoneRaw = contact.tel?.[0] ?? '';
        const phone = normalizePhone(phoneRaw);
        if (!phone) {
          skipped.push(`${nombre}: sin teléfono válido`);
          continue;
        }

        if (existingPhones.has(phone)) {
          skipped.push(`${nombre}: teléfono ya registrado`);
          continue;
        }

        const icon = contact.icon?.[0];
        const dto: ImportClientDto = {
          identificacion: '',
          nombre,
          correo: contact.email?.[0] ?? '',
          telefono: phone,
        };

        if (icon) {
          dto.foto_base64 = await blobToDataUrl(icon);
        }

        clientes.push(dto);
        existingPhones.add(phone);
      }

      if (clientes.length === 0) {
        this.snackBar.open('No se importó ningún contacto nuevo.', 'Cerrar', { duration: 4000 });
        if (skipped.length) {
          this.snackBar.open(`Omitidos: ${skipped.join(' | ')}`, 'Cerrar', { duration: 8000 });
        }
        return;
      }

      this.importing.set(true);
      this.clientsService.importClients(clientes).subscribe({
        next: (result) => {
          this.importing.set(false);
          const messages = [
            `${result.creados} creados`,
            result.omitidos > 0 ? `${result.omitidos} omitidos` : null,
            skipped.length ? `${skipped.length} ya registrados en este dispositivo` : null,
          ].filter(Boolean);
          this.snackBar.open(`Importación completada: ${messages.join(', ')}`, 'Cerrar', { duration: 6000 });
          this.loadClients();
        },
        error: () => {
          this.importing.set(false);
          this.snackBar.open('Error al importar los contactos.', 'Cerrar', { duration: 4000 });
        },
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        this.snackBar.open('No se pudo acceder a los contactos.', 'Cerrar', { duration: 4000 });
      }
    }
  }

  deleteClient(client: ClientDto): void {
    const dialogRef = this.dialog.open(ConfirmDialog, { width: '360px' });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.clientsService.deleteClient(client.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado.', 'Cerrar', { duration: 3000 });
          this.loadClients();
        },
      });
    });
  }
}

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned) ? cleaned : '';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}