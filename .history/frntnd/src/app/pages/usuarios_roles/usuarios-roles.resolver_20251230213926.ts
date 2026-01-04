import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const usuariosRolesResolver: ResolveFn<{
  usuarios: any[];
  roles: any[];
  usuariosRoles: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const usuarios$ = api.get<any>('usuarios').pipe(catchError(() => of([])));
  const roles$ = api.get<any>('roles').pipe(catchError(() => of([])));
  const list$ = api
    .get<any>('usuarios_roles', { desde: 0, limite: 10 })
    .pipe(catchError(() => of({ usuarios_roles: [], total: 0 })));

  return forkJoin([usuarios$, roles$, list$]).pipe(
    map(([uRes, rRes, listRes]) => {
      const usuarios = Array.isArray(uRes)
        ? uRes
        : Array.isArray((uRes as any)?.usuarios)
        ? (uRes as any).usuarios
        : Array.isArray((uRes as any)?.data)
        ? (uRes as any).data
        : [];
      const roles = Array.isArray(rRes)
        ? rRes
        : Array.isArray((rRes as any)?.roles)
        ? (rRes as any).roles
        : Array.isArray((rRes as any)?.data)
        ? (rRes as any).data
        : [];
      const usuariosRoles = Array.isArray(listRes?.usuarios_roles)
        ? listRes.usuarios_roles
        : Array.isArray(listRes)
        ? listRes
        : [];
      const total = Number(listRes?.total) || usuariosRoles.length || 0;
      return { usuarios, roles, usuariosRoles, total };
    })
  );
};
