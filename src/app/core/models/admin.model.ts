export interface UserAdminDto {
  id_publico: string;
  apodo: string;
  correo: string;
  rol: string;
  activo: boolean;
  bloqueado: boolean;
  email_confirmado: boolean;
  ultimo_acceso?: string;
  fecha_registro: string;
}

export interface ActivityLogDto {
  id_publico: string;
  accion: string;
  detalle: string;
  fecha: string;
}