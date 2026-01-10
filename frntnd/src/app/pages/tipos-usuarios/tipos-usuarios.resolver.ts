import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga tipos de usuario y estados para la página de Tipos de Usuario.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const tiposUsuariosResolver: ResolveFn<{
  tiposUsuarios: any[];
  estados: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const tipos$ = api.get<any>('tipos_usuario').pipe(catchError(() => of({ tipos: [] })));
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));

  return forkJoin([tipos$, estados$]).pipe(
    map(([tiposRes, estadosRes]) => {
      const tiposUsuarios = Array.isArray((tiposRes as any)?.tipos)
        ? (tiposRes as any).tipos
        : Array.isArray(tiposRes)
        ? (tiposRes as any)
        : Array.isArray((tiposRes as any)?.tipos_usuario)
        ? (tiposRes as any).tipos_usuario
        : Array.isArray((tiposRes as any)?.data)
        ? (tiposRes as any).data
        : [];
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const total = Number((tiposRes as any)?.total) || tiposUsuarios.length || 0;
      return { tiposUsuarios, estados, total };
    })
  );
};
