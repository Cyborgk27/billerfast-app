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

export interface ActivityLogItemDto extends ActivityLogDto {
  usuario_id_publico?: string | null;
  usuario_apodo?: string | null;
  usuario_correo?: string | null;
  usuario_objetivo?: string | null;
}

export interface AdminOverviewDto {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_pendientes: number;
  usuarios_bloqueados: number;
  admins: number;
  empleados: number;
  usuarios: number;
  total_logs: number;
}