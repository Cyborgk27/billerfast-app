import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type {
  ClientDto,
  CreateOrUpdateClientDto,
} from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly baseUrl = `${environment.apiUrl}/api/Clients`;

  constructor(private readonly http: HttpClient) {}

  getClients(): Observable<ClientDto[]> {
    return this.http
      .get<ApiResponse<ClientDto[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getClient(id: string): Observable<ClientDto> {
    return this.http
      .get<ApiResponse<ClientDto>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createClient(dto: CreateOrUpdateClientDto): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  updateClient(id: string, dto: CreateOrUpdateClientDto): Observable<void> {
    return this.http.put(`${this.baseUrl}/${id}`, dto).pipe(map(() => undefined));
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }
}