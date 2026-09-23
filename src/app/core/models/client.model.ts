export interface CreateOrUpdateClientDto {
  identificacion: string;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface ImportClientDto extends CreateOrUpdateClientDto {
  foto_base64?: string;
}

export interface ImportClientsResultDto {
  creados: number;
  omitidos: number;
  omitidos_detalle: string[];
  total_procesados: number;
}

export interface ClientDto extends CreateOrUpdateClientDto {
  id: string;
}