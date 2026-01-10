import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga atributos y estados para la página de Atributos.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const atributoResolver: ResolveFn<{
  atributos: any[];
  estados: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const atributos$ = api.get<any>('atributos').pipe(catchError(() => of({ atributos: [] })));
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));

  return forkJoin([atributos$, estados$]).pipe(
    map(([atributosRes, estadosRes]) => {
      const atributos = Array.isArray((atributosRes as any)?.atributos)
        ? (atributosRes as any).atributos
        : Array.isArray(atributosRes)
        ? (atributosRes as any)
        : Array.isArray((atributosRes as any)?.data)
        ? (atributosRes as any).data
        : [];
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const total = Number((atributosRes as any)?.total) || atributos.length || 0;
      return { atributos, estados, total };
    })
  );
};
