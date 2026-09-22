import { Component, OnInit, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvoicesService } from '../../core/services/invoices.service';
import { EstadoBadge } from '../../shared/components/estado-badge';
import type { InvoiceSummaryDto } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoices',
  imports: [
    EstadoBadge,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
  ],
  styleUrl: './invoices.css',
  templateUrl: './invoices.html',
})
export class Invoices implements OnInit {
  protected readonly invoices = signal<InvoiceSummaryDto[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly page = signal(1);
  protected readonly pageSize = 20;
  protected readonly totalRecords = signal(0);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / this.pageSize)),
  );
  protected readonly hasNext = computed(
    () => this.page() < this.totalPages(),
  );

  constructor(private readonly invoicesService: InvoicesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.invoicesService
      .getInvoices(this.page(), this.pageSize, this.query() || undefined)
      .subscribe({
        next: (result) => {
          this.invoices.set(result.items);
          this.totalRecords.set(result.totalRecords);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  search(value: string): void {
    this.query.set(value);
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
    if (this.hasNext()) {
      this.page.update((p) => p + 1);
      this.load();
    }
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
}