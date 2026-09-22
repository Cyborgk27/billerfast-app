import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../models/presentation';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfo,
} from '../models/auth.model';

const TOKEN_KEY = 'billerfast_token';
const USER_KEY = 'billerfast_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Auth`;

  private readonly userSignal = signal<UserInfo | null>(this.loadUser());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, request)
      .pipe(
        map((res) => {
          this.persist(res.data);
          return res.data;
        }),
      );
  }

  register(request: RegisterRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.baseUrl}/register`, request)
      .pipe(map((res) => res.data));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  user(): UserInfo | null {
    return this.userSignal();
  }

  getToken(): string | null {
    return this.token();
  }

  private persist(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
    this.userSignal.set(response.usuario);
  }

  private loadUser(): UserInfo | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || !localStorage.getItem(TOKEN_KEY)) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  }
}