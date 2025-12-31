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
  const estados$ = api
    .get<any>('estados', { desde: 0, limite: 10, sortKey, sortDir })
    .pipe(catchError(() => of({ estados: [], total: 0 })));
  return forkJoin([estados$]).pipe(
    map(([resp]) => {
      const estados = Array.isArray((resp as any)?.estados)
        ? (resp as any).estados
        : Array.isArray(resp)
        ? (resp as any)
        : [];
      const total = Number((resp as any)?.total) || estados.length || 0;
      return { estados, total };
    })
  );
};
