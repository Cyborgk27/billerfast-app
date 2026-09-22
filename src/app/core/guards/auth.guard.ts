import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authGuard(): boolean {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.user();

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (user?.rol === 'Customer') {
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  return true;
}