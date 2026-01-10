import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const usuariosRolesResolver: ResolveFn<{
  estados: any[];
  roles: any[];
  usuarios: any[];
  usuariosRoles: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'usuario';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const estados$ = api.get<any>('estados').pipe(catchError(() => of({ estados: [] })));
  const roles$ = api.get<any>('roles').pipe(catchError(() => of({ roles: [] })));
  const usuarios$ = api.get<any>('usuarios').pipe(catchError(() => of({ usuarios: [] })));
  const usuariosRoles$ = api
    .get<any>('usuarios_roles', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ usuarios_roles: [], total: 0 })));
  return forkJoin([estados$, roles$, usuarios$, usuariosRoles$]).pipe(
    map(([estadosRes, rolesRes, usuariosRes, usuariosRolesRes]) => {
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
        : [];
      const usuarios = Array.isArray((usuariosRes as any)?.usuarios)
        ? (usuariosRes as any).usuarios
        : Array.isArray(usuariosRes)
        ? (usuariosRes as any)
        : [];
      const usuariosRoles = Array.isArray((usuariosRolesRes as any)?.usuarios_roles)
        ? (usuariosRolesRes as any).usuarios_roles
        : Array.isArray(usuariosRolesRes)
        ? (usuariosRolesRes as any)
        : [];
      const total = Number((usuariosRolesRes as any)?.total) || usuariosRoles.length || 0;
      return { estados, roles, usuarios, usuariosRoles, total };
    })
  );
};
