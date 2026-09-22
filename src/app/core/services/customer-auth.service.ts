import { Injectable, computed, signal } from '@angular/core';
import type { UserInfo } from '../models/auth.model';

const TOKEN_KEY = 'billerfast_customer_token';
const USER_KEY = 'billerfast_customer_user';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly userSignal = signal<UserInfo | null>(this.loadUser());
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setSession(token: string, user: UserInfo): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
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