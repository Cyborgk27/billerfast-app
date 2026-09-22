import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { InvoicesService } from '../../core/services/invoices.service';
import { PageHeader } from '../../shared/components/page-header';
import { EstadoBadge } from '../../shared/components/estado-badge';
import type { CreatePaymentDto, InvoiceDto, PaymentMethod } from '../../core/models/invoice.model';

@Component({
  selector: 'app-invoice-detail',
  imports: [
    PageHeader,
    EstadoBadge,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe,
  ],
  styleUrl: './invoice-detail.css',
  templateUrl: './invoice-detail.html',
})
export class InvoiceDetail implements OnInit {
  protected readonly invoice = signal<InvoiceDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly downloading = signal(false);
  protected readonly paymentSaving = signal(false);
  protected readonly planSaving = signal(false);
  protected readonly paymentForm: FormGroup;
  protected readonly planForm: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly invoicesService = inject(InvoicesService);
  private invoiceId = '';

  protected readonly methods: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Otro'];

  constructor() {
    this.paymentForm = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0.01)]],
      metodo: ['Efectivo', Validators.required],
      referencia: [''],
      fecha_pago: [this.today(), Validators.required],
      cuota_id_publico: [null],
    });
    this.planForm = this.fb.group({
      tipo: ['auto'],
      numero_cuotas: [3, [Validators.required, Validators.min(1)]],
      periodo: ['mensual'],
      fecha_inicio: [this.today(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.invoiceId = params['id'];
        this.loadInvoice(params['id']);
      }
    });
  }

  private loadInvoice(id: string): void {
    this.loading.set(true);
    this.invoicesService.getInvoice(id).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  downloadPdf(): void {
    const invoice = this.invoice();
    if (!invoice || this.downloading()) return;
    this.downloading.set(true);
    this.invoicesService.getInvoicePdf(invoice.id_publico).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `factura-${invoice.numero_factura}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.downloading.set(false),
    });
  }

  shareWhatsApp(): void {
    const invoice = this.invoice();
    if (!invoice?.telefono_cliente) {
      this.snackBar.open('El cliente no tiene teléfono registrado.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.downloading.set(true);
    this.invoicesService.getInvoicePdf(invoice.id_publico).subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const file = new File([blob], `factura-${invoice.numero_factura}.pdf`, { type: 'application/pdf' });
        const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean; share?: (data: ShareData) => Promise<void> };

        if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
          // Móvil: abre la hoja de compartir (WhatsApp adjunta la factura)
          nav.share({
            files: [file],
            title: `Factura ${invoice.numero_factura}`,
            text: `Hola ${invoice.nombre_cliente}, aquí está tu factura ${invoice.numero_factura} por ${invoice.total} USD.`,
          }).catch(() => {});
        } else {
          // Escritorio: enlace de texto
          const phone = this.normalizePhone(invoice.telefono_cliente!);
          const message = `Hola ${invoice.nombre_cliente}, aquí está tu factura ${invoice.numero_factura} por ${invoice.total} USD. ¡Gracias por tu compra!`;
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      },
      error: () => this.downloading.set(false),
    });
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '593' + digits.slice(1);
    return digits;
  }

  registerPayment(): void {
    if (this.paymentForm.invalid || this.paymentSaving()) return;
    this.paymentSaving.set(true);
    const v = this.paymentForm.value;
    const dto: CreatePaymentDto = {
      monto: v.monto,
      metodo: v.metodo,
      referencia: v.referencia || undefined,
      fecha_pago: new Date(v.fecha_pago).toISOString(),
      cuota_id_publico: v.cuota_id_publico || undefined,
    };
    this.invoicesService.registerPayment(this.invoiceId, dto).subscribe({
      next: () => {
        this.paymentSaving.set(false);
        this.paymentForm.patchValue({ monto: null, referencia: '', cuota_id_publico: null });
        this.snackBar.open('Pago registrado.', 'Cerrar', { duration: 3000 });
        this.loadInvoice(this.invoiceId);
      },
      error: () => this.paymentSaving.set(false),
    });
  }

  payInstallment(installmentId: string, amount: number): void {
    this.paymentForm.patchValue({ monto: amount, cuota_id_publico: installmentId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createPlan(): void {
    if (this.planForm.invalid || this.planSaving()) return;
    this.planSaving.set(true);
    const v = this.planForm.value;
    this.invoicesService
      .createPaymentPlan(this.invoiceId, {
        tipo: v.tipo,
        numero_cuotas: v.tipo === 'auto' ? v.numero_cuotas : undefined,
        periodo: v.tipo === 'auto' ? v.periodo : undefined,
        fecha_inicio: v.tipo === 'auto' ? new Date(v.fecha_inicio).toISOString() : undefined,
      })
      .subscribe({
        next: () => {
          this.planSaving.set(false);
          this.snackBar.open('Plan de cuotas creado.', 'Cerrar', { duration: 3000 });
          this.loadInvoice(this.invoiceId);
        },
        error: () => this.planSaving.set(false),
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

  back(): void {
    this.router.navigate(['/facturas']);
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}