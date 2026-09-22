import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AdminService } from '../../core/services/admin.service';
import type { ActivityLogDto, UserAdminDto } from '../../core/models/admin.model';
import { actionMeta, actionList } from './action-meta';

export interface LogsDialogData {
  user: UserAdminDto;
}

@Component({
  selector: 'app-logs-dialog',
  imports: [
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './logs-dialog.html',
  styles: [
    `
      .user-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;

        img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          background: var(--mat-sys-surface-container-high);
        }

        .meta {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
        }

        .email {
          font-size: 13px;
          color: var(--mat-sys-on-surface-variant);
        }
      }

      .filters {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 10px 0 6px;

        .count {
          font-size: 13px;
          color: var(--mat-sys-on-surface-variant);
          white-space: nowrap;
        }

        mat-form-field {
          flex: 1;
        }
      }

      .logs {
        max-height: 340px;
        overflow-y: auto;
        margin-top: 4px;
      }

      .log-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--mat-sys-outline-variant);

        &:last-child {
          border-bottom: none;
        }

        .icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;

          &.ok { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
          &.warn { background: #fff3cd; color: #856404; }
          &.danger { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
          &.info { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
          &.muted { background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant); }
        }

        .body {
          flex: 1;
          min-width: 0;
        }

        .action {
          font-weight: 600;
          font-size: 13px;
        }

        .detail {
          font-size: 13px;
          color: var(--mat-sys-on-surface-variant);
          word-break: break-word;
        }

        .date {
          font-size: 11px;
          color: var(--mat-sys-on-surface-variant);
          white-space: nowrap;
        }
      }

      .empty {
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
        padding: 20px 0;
      }
    `,
  ],
})
export class LogsDialog implements OnInit {
  protected readonly user: UserAdminDto = inject(MAT_DIALOG_DATA).user;
  protected readonly allLogs = signal<ActivityLogDto[]>([]);
  protected readonly filteredLogs = signal<ActivityLogDto[]>([]);
  protected readonly actionFilter = signal('');
  protected readonly actions = actionList();
  protected readonly loading = signal(true);

  private readonly adminService = inject(AdminService);
  private readonly dialogRef = inject(MatDialogRef<LogsDialog>);

  ngOnInit(): void {
    this.adminService.getUserLogs(this.user.id_publico).subscribe({
      next: (logs) => {
        this.allLogs.set(logs);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(): void {
    const action = this.actionFilter();
    const logs = this.allLogs();
    this.filteredLogs.set(action ? logs.filter((l) => l.accion === action) : logs);
  }

  meta(accion: string) {
    return actionMeta(accion);
  }

  avatarUrl(): string {
    return `/api/images/user/${this.user.id_publico}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}