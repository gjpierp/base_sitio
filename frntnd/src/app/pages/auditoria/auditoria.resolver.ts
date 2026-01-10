import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga usuarios (para filtros) y la primera página de auditoría.
 */
export const auditoriaResolver: ResolveFn<{
  usuarios: any[];
  auditoria: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'fecha';
  const sortDir = (route?.data as any)?.sortDir ?? 'desc';

  // Cargar usuarios para el filtro de "Usuario"
  const usuarios$ = api
    .get<any>('usuarios', { limit: 1000 })
    .pipe(catchError(() => of({ usuarios: [] })));

  // Cargar registros de auditoría
  const auditoria$ = api
    .get<any>('auditoria', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ auditoria: [], total: 0 })));

  return forkJoin([usuarios$, auditoria$]).pipe(
    map(([usuariosRes, auditoriaRes]) => {
      const usuarios = Array.isArray((usuariosRes as any)?.usuarios)
        ? (usuariosRes as any).usuarios
        : Array.isArray((usuariosRes as any)?.data)
        ? (usuariosRes as any).data
        : [];
      const auditoria = Array.isArray((auditoriaRes as any)?.auditoria)
        ? (auditoriaRes as any).auditoria
        : (auditoriaRes as any)?.data || [];
      const total = Number((auditoriaRes as any)?.total) || auditoria.length || 0;
      return { usuarios, auditoria, total };
    })
  );
};
