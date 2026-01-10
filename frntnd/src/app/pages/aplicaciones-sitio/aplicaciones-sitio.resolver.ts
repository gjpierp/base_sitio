import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga estados y la primera página de aplicaciones de sitio.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const aplicacionesSitioResolver: ResolveFn<{
  estados: any[];
  aplicacionesSitio: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const aplicacionesSitio$ = api
    .get<any>('aplicaciones_sitio', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ aplicacionesSitio: [], total: 0 })));

  return forkJoin([estados$, aplicacionesSitio$]).pipe(
    map(([estadosRes, aplicacionesSitioRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const aplicacionesSitio = Array.isArray((aplicacionesSitioRes as any)?.aplicacionesSitio)
        ? (aplicacionesSitioRes as any).aplicacionesSitio
        : Array.isArray(aplicacionesSitioRes)
        ? (aplicacionesSitioRes as any)
        : Array.isArray((aplicacionesSitioRes as any)?.data)
        ? (aplicacionesSitioRes as any).data
        : [];
      const total = Number((aplicacionesSitioRes as any)?.total) || aplicacionesSitio.length || 0;
      return { estados, aplicacionesSitio, total };
    })
  );
};
