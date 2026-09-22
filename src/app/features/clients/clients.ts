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
import type { ClientDto } from '../../core/models/client.model';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';

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