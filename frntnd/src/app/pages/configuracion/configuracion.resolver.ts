import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga catálogos y la primera página de configuraciones.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const configuracionResolver: ResolveFn<{
  estados: any[];
  usuarios: any[];
  configuraciones: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'clave';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const usuarios$ = api
    .get<any>('usuarios', { desde: 0 })
    .pipe(catchError(() => of({ usuarios: [] })));
  const configuraciones$ = api
    .get<any>('configuraciones', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ configuraciones: [], total: 0 })));

  return forkJoin([estados$, usuarios$, configuraciones$]).pipe(
    map(([estadosRes, usuariosRes, configuracionesRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const usuarios = Array.isArray((usuariosRes as any)?.usuarios)
        ? (usuariosRes as any).usuarios
        : Array.isArray(usuariosRes)
        ? (usuariosRes as any)
        : Array.isArray((usuariosRes as any)?.data)
        ? (usuariosRes as any).data
        : [];
      const configuraciones = Array.isArray((configuracionesRes as any)?.configuraciones)
        ? (configuracionesRes as any).configuraciones
        : Array.isArray(configuracionesRes)
        ? (configuracionesRes as any)
        : Array.isArray((configuracionesRes as any)?.data)
        ? (configuracionesRes as any).data
        : [];
      const total = (configuracionesRes as any)?.total ?? configuraciones.length;
      return { estados, usuarios, configuraciones, total };
    })
  );
};
