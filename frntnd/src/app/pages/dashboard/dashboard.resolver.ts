import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga estadísticas y actividad reciente para el dashboard.
 */
export const dashboardResolver: ResolveFn<{
  stats: any;
  actividadReciente: any[];
}> = (route) => {
  const api = inject(ApiService);

  // Solicitudes en paralelo
  const reqs = {
    usuarios: api.getPaginated('usuarios', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
    apps: api.getPaginated('aplicaciones_sitio', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
    config: api.getPaginated('configuraciones', { limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
    auditoria: api.getPaginated('auditoria', { limit: 5, sort: 'fecha', order: 'desc' }).pipe(catchError(() => of({ data: [] })))
  };

  return forkJoin(reqs).pipe(
    map((res: any) => {
      return {
        stats: {
          usuarios: Number(res.usuarios?.total) || 0,
          apps: Number(res.apps?.total) || 0,
          config: Number(res.config?.total) || 0
        },
        actividadReciente: res.auditoria?.data || res.auditoria?.auditoria || []
      };
    })
  );
};
