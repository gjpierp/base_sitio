import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const rolesResolver: ResolveFn<{
  roles: any[];
  total: number;
}> = (route) => {
  const api = inject(ApiService);
  const sortKey = (route?.data as any)?.sortKey ?? 'nombre';
  const sortDir = (route?.data as any)?.sortDir ?? 'asc';
  const roles$ = api
    .get<any>('roles', { desde: 0, sortKey, sortDir })
    .pipe(catchError(() => of({ roles: [], total: 0 })));
  return forkJoin([roles$]).pipe(
    map(([resp]) => {
      const roles = Array.isArray((resp as any)?.roles)
        ? (resp as any).roles
        : Array.isArray(resp)
        ? (resp as any)
        : [];
      const total = Number((resp as any)?.total) || roles.length || 0;
      return { roles, total };
    })
  );
};
