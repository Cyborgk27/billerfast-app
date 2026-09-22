import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import type { ActivityLogDto, UserAdminDto } from '../../core/models/admin.model';

@Component({
  selector: 'app-users',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    DatePipe,
  ],
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users implements OnInit {
  protected readonly users = signal<UserAdminDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly logs = signal<Record<string, ActivityLogDto[]>>({});
  protected readonly openLogs = signal<Record<string, boolean>>({});

  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  avatarUrl(id: string): string {
    return `/api/images/user/${id}`;
  }

  toggleLogs(user: UserAdminDto): void {
    const open = this.openLogs();
    const next = !open[user.id_publico];
    this.openLogs.set({ ...open, [user.id_publico]: next });
    if (next && !this.logs()[user.id_publico]) {
      this.adminService.getUserLogs(user.id_publico).subscribe({
        next: (logs) => this.logs.set({ ...this.logs(), [user.id_publico]: logs }),
      });
    }
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