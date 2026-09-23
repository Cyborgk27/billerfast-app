export type SalePresentation = 'Paca' | 'Unidad';

export interface CreateOrUpdateProductDto {
  code?: string;
  nombre: string;
  presentacion: SalePresentation;
  precio_venta: number;
  precio_costo?: number;
  cantidad_por_paca?: number;
}

export interface ProductDto {
  id: string;
  codigo?: string;
  nombre: string;
  presentacion: string;
  precio_venta: number;
  precio_costo?: number;
  cantidad_por_paca: number;
  stock: number;
}

export interface ImportResultDto {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  skipped: string[];
  totalProcessed: number;
}