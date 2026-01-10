import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const entidadesResolver: ResolveFn<{
  estados: any[];
  entidades: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'alias_nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const entidades$ = api
    .get<any>('entidades', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ entidades: [], total: 0 })));

  return forkJoin([estados$, entidades$]).pipe(
    map(([estadosRes, entidadesRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const entidades = Array.isArray((entidadesRes as any)?.entidades)
        ? (entidadesRes as any).entidades
        : Array.isArray(entidadesRes)
        ? (entidadesRes as any)
        : Array.isArray((entidadesRes as any)?.data)
        ? (entidadesRes as any).data
        : [];
      const total = (entidadesRes as any)?.total ?? entidades.length;
      return { estados, entidades, total };
    })
  );
};
