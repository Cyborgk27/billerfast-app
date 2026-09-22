import type { Presentation } from './presentation';
import type { LoginResponse } from './auth.model';

export interface PublicIssuerDto {
  slug: string;
  nombre: string;
  ruc?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

export interface PublicProductDto {
  id_publico: string;
  codigo: string;
  nombre: string;
  presentacion: string;
  precio_venta: number;
  cantidad_por_paca: number;
  stock: number;
}

export interface CreateOrderDto {
  nombre: string;
  correo: string;
  telefono: string;
  identificacion?: string;
  detalles: { producto_id_publico: string; presentacion: Presentation; cantidad: number }[];
}

export interface OrderResultDto {
  id_publico: string;
  numero_factura: string;
  total: number;
  estado: string;
}

export interface CustomerRegisterDto {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  identificacion?: string;
}

export interface CustomerLoginDto {
  identificador: string;
  contrasena: string;
}

export type CustomerAuthResponse = LoginResponse;

export interface CustomerProfileDto {
  nombre: string;
  correo: string;
  telefono: string;
  identificacion: string;
  cliente_id_publico: string;
}

export interface CustomerOrderDto {
  id_publico: string;
  numero_factura: string;
  fecha_emision: string;
  total: number;
  pagado: number;
  saldo_pendiente: number;
  estado: string;
}