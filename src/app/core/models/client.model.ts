export interface CreateOrUpdateClientDto {
  identificacion: string;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface ClientDto extends CreateOrUpdateClientDto {
  id: string;
}