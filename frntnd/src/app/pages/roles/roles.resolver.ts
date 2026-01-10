import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Resolver que precarga estados y la primera página de roles.
 * Retorna un objeto con las listas normalizadas y el total para pintar inmediatamente.
 */
export const rolesResolver: ResolveFn<{
  estados: any[];
  roles: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const roles$ = api
    .get<any>('roles', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ roles: [], total: 0 })));

  return forkJoin([estados$, roles$]).pipe(
    map(([estadosRes, rolesRes]) => {
      const estados = Array.isArray((estadosRes as any)?.estados)
        ? (estadosRes as any).estados
        : Array.isArray(estadosRes)
        ? (estadosRes as any)
        : Array.isArray((estadosRes as any)?.data)
        ? (estadosRes as any).data
        : [];
      const roles = Array.isArray((rolesRes as any)?.roles)
        ? (rolesRes as any).roles
        : Array.isArray(rolesRes)
        ? (rolesRes as any)
        : Array.isArray((rolesRes as any)?.data)
        ? (rolesRes as any).data
        : [];
      const total = Number((rolesRes as any)?.total) || roles.length || 0;
      return { estados, roles, total };
    })
  );
};
