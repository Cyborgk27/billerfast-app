import { Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-badge',
  template: `<span class="estado-badge" [class]="badgeClass()">{{ estado() }}</span>`,
  styles: [
    `
      .estado-badge {
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .estado-badge.ok {
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }
      .estado-badge.warn {
        background: #fff3cd;
        color: #856404;
      }
      .estado-badge.danger {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      .estado-badge.muted {
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class EstadoBadge {
  readonly estado = input<string>('Pendiente');

  protected badgeClass(): string {
    const map: Record<string, string> = {
      Pagada: 'ok',
      Parcial: 'warn',
      Vencida: 'danger',
      Pendiente: 'muted',
    };
    return map[this.estado()] ?? 'muted';
  }
}