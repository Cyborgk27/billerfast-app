import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminService } from '../../core/services/admin.service';
import type { ActivityLogItemDto, UserAdminDto } from '../../core/models/admin.model';
import type { PagedResult } from '../../core/models/paged-result.model';
import { actionMeta, actionList } from './action-meta';

@Component({
  selector: 'app-activity-logs',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './activity-logs.html',
  styleUrl: './activity-logs.css',
})
export class ActivityLogs implements OnInit {
  protected readonly logs = signal<ActivityLogItemDto[]>([]);
  protected readonly users = signal<UserAdminDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(1);
  protected readonly pageSize = 30;
  protected readonly total = signal(0);
  protected readonly actions = actionList();

  protected readonly userFilter = signal('');
  protected readonly actionFilter = signal('');
  protected readonly desde = signal<Date | null>(null);
  protected readonly hasta = signal<Date | null>(null);

  protected readonly totalPages = signal(1);

  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => undefined,
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminService
      .getActivityLogs({
        page: this.page(),
        pageSize: this.pageSize,
        usuarioId: this.userFilter() || undefined,
        accion: this.actionFilter() || undefined,
        desde: this.desde()?.toISOString(),
        hasta: this.hasta()?.toISOString(),
      })
      .subscribe({
        next: (result: PagedResult<ActivityLogItemDto>) => {
          this.logs.set(result.items);
          this.total.set(result.totalRecords);
          this.totalPages.set(Math.max(1, result.totalPages));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  previous(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  meta(accion: string) {
    return actionMeta(accion);
  }

  avatarUrl(id?: string | null): string {
    return id ? `/api/images/user/${id}` : '';
  }
}