import type { Presentation } from './presentation';

export type PaymentMethod =
  | 'Efectivo'
  | 'Transferencia'
  | 'Tarjeta'
  | 'Cheque'
  | 'Otro';

export interface CreateInvoiceDetailDto {
  producto_id_publico: string;
  presentacion: Presentation;
  cantidad: number;
}

export interface CreateInvoiceDto {
  cliente_id_publico: string;
  detalles: CreateInvoiceDetailDto[];
}

export interface InvoiceDetailDto {
  codigo_producto: string;
  presentacion: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface InvoicePaymentDto {
  id_publico: string;
  monto: number;
  metodo: PaymentMethod;
  referencia?: string;
  fecha_pago: string;
  notas?: string;
  cuota_id_publico?: string;
}

export interface CreatePaymentDto {
  monto: number;
  metodo: PaymentMethod;
  referencia?: string;
  fecha_pago?: string;
  notas?: string;
  cuota_id_publico?: string;
}

export interface InstallmentDto {
  id_publico: string;
  numero: number;
  vencimiento: string;
  monto: number;
  pagado: number;
  saldo: number;
  estado: string;
}

export interface CreatePaymentPlanDto {
  tipo: 'auto' | 'custom';
  numero_cuotas?: number;
  periodo?: 'semanal' | 'quincenal' | 'mensual';
  fecha_inicio?: string;
  cuotas?: { monto: number; vencimiento: string }[];
}

export interface InvoiceSummaryDto {
  id_publico: string;
  numero_factura: string;
  fecha_emision: string;
  identificacion_cliente: string;
  nombre_cliente: string;
  total: number;
  pagado: number;
  saldo_pendiente: number;
  estado: string;
}

export interface InvoiceDto {
  id_publico: string;
  numero_factura: string;
  fecha_emision: string;
  identificacion_cliente: string;
  nombre_cliente: string;
  correo_cliente?: string;
  telefono_cliente?: string;
  subtotal: number;
  impuesto: number;
  total: number;
  detalles: InvoiceDetailDto[];
  pagos: InvoicePaymentDto[];
  cuotas: InstallmentDto[];
  tiene_plan_cuotas: boolean;
  pagado: number;
  saldo_pendiente: number;
  estado: string;
}