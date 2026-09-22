export interface RegisterRequest {
  apodo: string;
  correo: string;
  contrasena: string;
  razon_social?: string;
  ruc?: string;
  codigo_establecimiento?: string;
}

export interface LoginRequest {
  identificador: string;
  contrasena: string;
}

export interface UserInfo {
  id_publico: string;
  apodo: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expira_en: string;
  usuario: UserInfo;
}