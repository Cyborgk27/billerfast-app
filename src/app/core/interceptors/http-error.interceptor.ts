import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export function httpErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        if (!req.url.includes('/api/Auth/')) {
          router.navigate(['/login']);
        }
      }

      let message = 'Error de conexión con el servidor';
      if (error.status === 0) {
        message = 'No se pudo conectar con la API';
      } else if (error.status >= 500) {
        message = 'Error interno del servidor';
      } else if (error.status >= 400) {
        message = error.error?.message ?? error.message ?? 'Solicitud inválida';
      }
      snackBar.open(message, 'Cerrar', { duration: 5000 });
      return throwError(() => error);
    }),
  );
}