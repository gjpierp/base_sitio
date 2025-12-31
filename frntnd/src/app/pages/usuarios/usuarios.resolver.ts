import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga tipos de usuario, estados y la primera página de usuarios.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const usuariosResolver: ResolveFn<{
  tiposUsuario: any[];
  estados: any[];
  usuarios: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const tipos$ = api.get<any>('tipos_usuario').pipe(catchError(() => of({ tipos: [] })));
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const usuarios$ = api
    .get<any>('usuarios', { desde: 0, limite: 10, sortKey, sortDir })
    .pipe(catchError(() => of({ usuarios: [], total: 0 })));

  return forkJoin([tipos$, estados$, usuarios$]).pipe(
    map(([tiposRes, estadosRes, usuariosRes]) => {
      const tiposUsuario = Array.isArray((tiposRes as any)?.tipos)
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
      const usuarios = Array.isArray((usuariosRes as any)?.usuarios)
        ? (usuariosRes as any).usuarios
        : Array.isArray(usuariosRes)
        ? (usuariosRes as any)
        : [];
      const total = Number((usuariosRes as any)?.total) || usuarios.length || 0;
      return { tiposUsuario, estados, usuarios, total };
    })
  );
};
