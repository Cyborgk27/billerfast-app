export interface NotificationSettings {
  email_habilitado: boolean;
  smtp_host: string;
  smtp_puerto: number;
  smtp_usuario: string;
  smtp_contrasena: string;
  smtp_remitente: string;
  smtp_ssl: boolean;
  modo_demo: boolean;
}

export interface IssuerInfo {
  slug: string;
  nombre: string;
  ruc?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  color_factura?: string;
  color_factura_2?: string;
}