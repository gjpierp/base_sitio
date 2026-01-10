// Angular resolver para precargar datos de jerarquías y estados
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga catálogos y la primera página de jerarquías.
 *
 * - Carga los estados y las jerarquías desde la API antes de activar la ruta.
 * - Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 * - Permite que la página de jerarquías muestre datos sin esperas iniciales.
 *
 * @param route Snapshot de la ruta actual
 * @returns Observable con { estados, jerarquias, total }
 */
export const jerarquiasResolver: ResolveFn<{
  estados: any[];
  jerarquias: any[];
  total: number;
}> = (route) => {
  // Inyectar el servicio de API para llamadas HTTP
  const api = inject(ApiService);

  // Leer parámetros de ordenamiento desde la ruta (si existen)
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  // Observable para obtener estados, con manejo de error
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));

  // Observable para obtener jerarquías, con manejo de error
  const jerarquias$ = api
    .get<any>('jerarquias', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ jerarquias: [], total: 0 })));

  // Ejecutar ambas peticiones en paralelo y normalizar la respuesta
  return forkJoin([estados$, jerarquias$]).pipe(
    map(([estadosRes, jerarquiasRes]) => {
      // Normalizar la lista de estados
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];

      // Normalizar la lista de jerarquías
      const jerarquias = Array.isArray((jerarquiasRes as any)?.jerarquias)
        ? (jerarquiasRes as any).jerarquias
        : Array.isArray(jerarquiasRes)
        ? (jerarquiasRes as any)
        : Array.isArray((jerarquiasRes as any)?.data)
        ? (jerarquiasRes as any).data
        : [];

      // Calcular el total de registros
      const total = (jerarquiasRes as any)?.total ?? jerarquias.length;

      // Retornar objeto normalizado para el componente
      return { estados, jerarquias, total };
    })
  );
};
