import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type { IssuerInfo, NotificationSettings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly baseUrl = `${environment.apiUrl}/api/Settings`;

  constructor(private readonly http: HttpClient) {}

  getNotifications(): Observable<NotificationSettings> {
    return this.http
      .get<ApiResponse<NotificationSettings>>(`${this.baseUrl}/notifications`)
      .pipe(map((res) => res.data));
  }

  getIssuer(): Observable<IssuerInfo> {
    return this.http
      .get<ApiResponse<IssuerInfo>>(`${this.baseUrl}/issuer`)
      .pipe(map((res) => res.data));
  }

  updateIssuer(dto: Partial<IssuerInfo>): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/issuer`, dto)
      .pipe(map(() => undefined));
  }

  uploadLogo(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/issuer/logo`, formData)
      .pipe(map(() => undefined));
  }

  uploadAvatar(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/avatar`, formData)
      .pipe(map(() => undefined));
  }

  updateNotifications(settings: NotificationSettings): Observable<NotificationSettings> {
    return this.http
      .put<ApiResponse<NotificationSettings>>(`${this.baseUrl}/notifications`, settings)
      .pipe(map((res) => res.data));
  }

  testNotification(toEmail?: string, toPhone?: string): Observable<void> {
    const params: Record<string, string> = {};
    if (toEmail) params['toEmail'] = toEmail;
    if (toPhone) params['toPhone'] = toPhone;
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/notifications/test`, null, { params })
      .pipe(map(() => undefined));
  }
}