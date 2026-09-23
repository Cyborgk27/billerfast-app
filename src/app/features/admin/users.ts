import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { imageUrl } from '../../core/utils/media-url';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import type { AdminOverviewDto, UserAdminDto } from '../../core/models/admin.model';
import { LogsDialog } from './logs-dialog';

@Component({
  selector: 'app-users',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    DatePipe,
    RouterLink,
  ],
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users implements OnInit {
  protected readonly overview = signal<AdminOverviewDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly query = signal('');
  protected readonly rolFilter = signal('');
  protected readonly estadoFilter = signal('');

  protected readonly dataSource = new MatTableDataSource<UserAdminDto>();
  protected readonly columns = ['usuario', 'correo', 'rol', 'estado', 'acceso', 'acciones'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    this.dataSource.filterPredicate = (user, filter) => {
      const f = JSON.parse(filter) as { q: string; rol: string; estado: string };
      const q = f.q.trim().toLowerCase();
      const matchesQ =
        !q ||
        user.apodo.toLowerCase().includes(q) ||
        user.correo.toLowerCase().includes(q);
      const matchesRol = !f.rol || user.rol === f.rol;
      const matchesEstado =
        !f.estado ||
        (f.estado === 'activo' && user.activo && !user.bloqueado) ||
        (f.estado === 'pendiente' && !user.activo) ||
        (f.estado === 'bloqueado' && user.bloqueado);
      return matchesQ && matchesRol && matchesEstado;
    };
    this.dataSource.sortingDataAccessor = (user, column) => {
      switch (column) {
        case 'usuario':
          return user.apodo;
        case 'correo':
          return user.correo;
        case 'rol':
          return user.rol;
        case 'acceso':
          return user.ultimo_acceso ?? '';
        default:
          return String((user as unknown as Record<string, unknown>)[column] ?? '');
      }
    };
  }

  ngOnInit(): void {
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  reload(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.adminService.getOverview().subscribe({
      next: (overview) => this.overview.set(overview),
      error: () => undefined,
    });
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      q: this.query(),
      rol: this.rolFilter(),
      estado: this.estadoFilter(),
    });
    if (this.paginator) this.paginator.firstPage();
  }

  avatarUrl(id: string): string {
    return imageUrl(`/api/images/user/${id}`);
  }

  rolClass(rol: string): string {
    const map: Record<string, string> = {
      Admin: 'admin',
      User: 'user',
      Employee: 'employee',
      Customer: 'customer',
    };
    return map[rol] ?? 'muted';
  }

  estado(user: UserAdminDto): { label: string; tone: string } {
    if (!user.activo) return { label: 'Pendiente', tone: 'danger' };
    if (user.bloqueado) return { label: 'Bloqueado', tone: 'warn' };
    return { label: 'Activo', tone: 'ok' };
  }

  openLogs(user: UserAdminDto): void {
    this.dialog.open(LogsDialog, {
      width: '640px',
      maxWidth: '95vw',
      data: { user },
    });
  }

  approve(user: UserAdminDto): void {
    this.adminService.approve(user.id_publico).subscribe(() => {
      this.snackBar.open('Usuario aprobado.', 'Cerrar', { duration: 3000 });
      this.reload();
    });
  }

  deactivate(user: UserAdminDto): void {
    this.adminService.deactivate(user.id_publico).subscribe(() => {
      this.snackBar.open('Usuario desactivado.', 'Cerrar', { duration: 3000 });
      this.reload();
    });
  }

  unlock(user: UserAdminDto): void {
    this.adminService.unlock(user.id_publico).subscribe(() => {
      this.snackBar.open('Usuario desbloqueado.', 'Cerrar', { duration: 3000 });
      this.reload();
    });
  }
}