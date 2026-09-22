import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type { PagedResult } from '../models/paged-result.model';
import type { ActivityLogDto, ActivityLogItemDto, AdminOverviewDto, UserAdminDto } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/api/Users`;
  private readonly logsUrl = `${environment.apiUrl}/api/ActivityLogs`;

  constructor(private readonly http: HttpClient) {}

  getUsers(rol?: string): Observable<UserAdminDto[]> {
    const params = rol ? new HttpParams().set('rol', rol) : undefined;
    return this.http
      .get<ApiResponse<UserAdminDto[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getOverview(): Observable<AdminOverviewDto> {
    return this.http
      .get<ApiResponse<AdminOverviewDto>>(`${this.baseUrl}/overview`)
      .pipe(map((res) => res.data));
  }

  getUserLogs(publicId: string, accion?: string): Observable<ActivityLogDto[]> {
    const params = accion ? new HttpParams().set('accion', accion) : undefined;
    return this.http
      .get<ApiResponse<ActivityLogDto[]>>(`${this.baseUrl}/${publicId}/logs`, { params })
      .pipe(map((res) => res.data));
  }

  getActivityLogs(params: {
    page: number;
    pageSize: number;
    usuarioId?: string;
    accion?: string;
    desde?: string;
    hasta?: string;
  }): Observable<PagedResult<ActivityLogItemDto>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);
    if (params.usuarioId) httpParams = httpParams.set('usuarioId', params.usuarioId);
    if (params.accion) httpParams = httpParams.set('accion', params.accion);
    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    return this.http
      .get<ApiResponse<PagedResult<ActivityLogItemDto>>>(this.logsUrl, { params: httpParams })
      .pipe(map((res) => res.data));
  }

  approve(publicId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${publicId}/approve`, null)
      .pipe(map(() => undefined));
  }

  deactivate(publicId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${publicId}/deactivate`, null)
      .pipe(map(() => undefined));
  }

  unlock(publicId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${publicId}/unlock`, null)
      .pipe(map(() => undefined));
  }
}