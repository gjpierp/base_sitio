import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver robusto que precarga estados, aplicaciones y la primera página de menús.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const menusResolver: ResolveFn<{
  estados: any[];
  aplicaciones: any[];
  menus: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const aplicaciones$ = api
    .get<any>('aplicaciones_sitio')
    .pipe(catchError(() => of({ aplicaciones: [] })));
  const menus$ = api
    .get<any>('menus', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ menus: [], total: 0 })));

  return forkJoin([estados$, aplicaciones$, menus$]).pipe(
    map(([estadosRes, aplicacionesRes, menusRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const aplicaciones = Array.isArray((aplicacionesRes as any)?.aplicaciones)
        ? (aplicacionesRes as any).aplicaciones
        : Array.isArray(aplicacionesRes)
        ? (aplicacionesRes as any)
        : Array.isArray((aplicacionesRes as any)?.data)
        ? (aplicacionesRes as any).data
        : [];
      const menus = Array.isArray((menusRes as any)?.menus)
        ? (menusRes as any).menus
        : Array.isArray(menusRes)
        ? (menusRes as any)
        : Array.isArray((menusRes as any)?.data)
        ? (menusRes as any).data
        : [];
      const total = Number((menusRes as any)?.total) || menus.length || 0;
      return { estados, aplicaciones, menus, total };
    })
  );
};
