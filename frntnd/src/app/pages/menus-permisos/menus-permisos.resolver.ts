import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const menusPermisosResolver: ResolveFn<{
  estados: any[];
  roles: any[];
  menusPermisos: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';

  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const roles$ = api.get<any>('roles', { desde: 0 }).pipe(catchError(() => of({ roles: [] })));
  const menusPermisos$ = api
    .get<any>('menus-permisos', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ menusPermisos: [], total: 0 })));

  return forkJoin([estados$, roles$, menusPermisos$]).pipe(
    map(([estadosRes, rolesRes, menusPermisosRes]) => {
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
      const menusPermisos = Array.isArray((menusPermisosRes as any)?.menusPermisos)
        ? (menusPermisosRes as any).menusPermisos
        : Array.isArray(menusPermisosRes)
        ? (menusPermisosRes as any)
        : [];
      const total = Number((menusPermisosRes as any)?.total) || menusPermisos.length || 0;
      return { estados, roles, menusPermisos, total };
    })
  );
};
