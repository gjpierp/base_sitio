import { HttpInterceptorFn, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

// Interceptor que adjunta el header `x-token` tomado de localStorage
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  const token = isBrowser
    ? window.localStorage.getItem('x-token') || window.localStorage.getItem('token')
    : null;

  if (token) {
    req = req.clone({
      setHeaders: {
        'x-token': token,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Intentar renovar token sólo en navegador, ante 401 y peticiones al API
      const isApiRequest = typeof req.url === 'string' && req.url.includes('/api/');
      const alreadyTried = req.headers.has('x-refresh-attempt');

      if (isBrowser && isApiRequest && error.status === 401 && !alreadyTried && token) {
        return http.get<any>('/api/login/renew').pipe(
          switchMap((resp) => {
            const newToken = resp?.token || resp?.jwt || resp?.accessToken;
            if (!newToken) {
              // No se pudo renovar
              window.localStorage.removeItem('x-token');
              window.localStorage.removeItem('token');
              router.navigate(['/login'], { queryParams: { redirectTo: router.url } });
              return throwError(() => error);
            }
            // Guardar y reintentar la petición original con el nuevo token
            window.localStorage.setItem('x-token', newToken);
            const retried = req.clone({
              setHeaders: { 'x-token': newToken, 'x-refresh-attempt': '1' },
            });
            return next(retried);
          }),
          catchError((renewError) => {
            // Renovación falló: limpiar sesión y enviar al login
            window.localStorage.removeItem('x-token');
            window.localStorage.removeItem('token');
            router.navigate(['/login'], { queryParams: { redirectTo: router.url } });
            return throwError(() => (renewError instanceof HttpErrorResponse ? renewError : error));
          })
        );
      }

      return throwError(() => error);
    })
  );
};
