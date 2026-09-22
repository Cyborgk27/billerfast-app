import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type { ActivityLogDto, UserAdminDto } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/api/Users`;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<UserAdminDto[]> {
    return this.http
      .get<ApiResponse<UserAdminDto[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getUserLogs(publicId: string): Observable<ActivityLogDto[]> {
    return this.http
      .get<ApiResponse<ActivityLogDto[]>>(`${this.baseUrl}/${publicId}/logs`)
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