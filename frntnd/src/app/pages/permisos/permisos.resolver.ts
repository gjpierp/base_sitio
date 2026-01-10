import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga estados y la primera página de permisos.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
/**
 * Resolver que precarga estados y la primera página de permisos.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 * @function permisosResolver
 * @param route Snapshot de la ruta actual, permite extraer parámetros y datos de configuración
 * @returns Observable con { estados, permisos, total }
 * @author Gerardo Paiva
 * @date 09-01-2026
 */
export const permisosResolver: ResolveFn<{
  estados: any[];
  permisos: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  // Claves de ordenamiento configurables desde la ruta
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  // Observable de estados, con manejo de error
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  // Observable de permisos, con manejo de error y paginación
  const permisos$ = api
    .get<any>('permisos', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ permisos: [], total: 0 })));

  /**
   * Ejecuta ambas peticiones en paralelo y normaliza la respuesta.
   * - Extrae los arrays de estados y permisos, sin importar la forma de la respuesta.
   * - Calcula el total de registros para la tabla.
   */
  return forkJoin([estados$, permisos$]).pipe(
    map(([estadosRes, permisosRes]) => {
      // Normaliza la lista de estados
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      // Normaliza la lista de permisos
      const permisos = Array.isArray((permisosRes as any)?.permisos)
        ? (permisosRes as any).permisos
        : Array.isArray(permisosRes)
        ? (permisosRes as any)
        : Array.isArray((permisosRes as any)?.data)
        ? (permisosRes as any).data
        : [];
      // Calcula el total de registros
      const total = Number((permisosRes as any)?.total) || permisos.length || 0;
      return { estados, permisos, total };
    })
  );
};
