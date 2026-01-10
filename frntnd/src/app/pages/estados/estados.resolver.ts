import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const estadosResolver: ResolveFn<{
  estados: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  // Cargar estados paginados
  const estados$ = api
    .getPaginated('estados', { desde: 0, limit: 20, sort: sortKey, order: sortDir })
    .pipe(catchError(() => of({ estados: [], total: 0 })));

  return forkJoin({ res: estados$ }).pipe(
    map(({ res }) => {
      const estados = Array.isArray((res as any)?.estados)
        ? (res as any).estados
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];
      const total = Number((res as any)?.total) || estados.length || 0;
      return { estados, total };
    })
  );
};
