import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const permisosResolver: ResolveFn<{
  permisos: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'codigo';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const permisos$ = api
    .get<any>('permisos', { desde: 0, limite: 10, sortKey, sortDir })
    .pipe(catchError(() => of({ permisos: [], total: 0 })));
  return forkJoin([permisos$]).pipe(
    map(([resp]) => {
      const permisos = Array.isArray((resp as any)?.permisos)
        ? (resp as any).permisos
        : Array.isArray(resp)
        ? (resp as any)
        : [];
      const total = Number((resp as any)?.total) || permisos.length || 0;
      return { permisos, total };
    })
  );
};
