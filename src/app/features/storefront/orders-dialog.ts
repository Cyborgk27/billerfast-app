import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StorefrontService } from '../../core/services/storefront.service';
import { EstadoBadge } from '../../shared/components/estado-badge';
import type { CustomerOrderDto } from '../../core/models/storefront.model';

@Component({
  selector: 'app-orders-dialog',
  imports: [
    EstadoBadge,MatDialogModule, MatButtonModule, MatProgressBarModule, DatePipe, CurrencyPipe],
  styleUrl: './orders-dialog.css',
  templateUrl: './orders-dialog.html',
})
export class OrdersDialog implements OnInit {
  protected readonly orders = signal<CustomerOrderDto[]>([]);
  protected readonly loading = signal(true);

  private readonly dialogRef = inject(MatDialogRef<OrdersDialog>);
  private readonly data = inject<{ slug: string }>(MAT_DIALOG_DATA);
  private readonly storefrontService = inject(StorefrontService);

  ngOnInit(): void {
    this.storefrontService.myOrders(this.data.slug).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      Pagada: 'ok',
      Parcial: 'warn',
      Vencida: 'danger',
      Pendiente: 'muted',
    };
    return map[estado] ?? 'muted';
  }

  close(): void {
    this.dialogRef.close();
  }
}