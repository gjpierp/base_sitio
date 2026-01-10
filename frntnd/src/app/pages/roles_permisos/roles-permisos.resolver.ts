import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface RolesPermisosData {
  roles: any[];
  permisos: any[];
  rolesPermisos: any[];
  total: number;
  error?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RolesPermisosResolver implements Resolve<RolesPermisosData> {
  constructor(private api: ApiService) {}

  resolve(): Observable<RolesPermisosData> {
    return forkJoin({
      roles: this.api.get<any>('roles'),
      permisos: this.api.get<any>('permisos'),
      rolesPermisosRes: this.api.get<any>('roles-permisos'),
    }).pipe(
      map(({ roles, permisos, rolesPermisosRes }) => ({
        roles: Array.isArray(roles) ? roles : roles?.roles ?? roles?.data ?? [],
        permisos: Array.isArray(permisos)
          ? permisos
          : permisos?.permisos ?? permisos?.data ?? [],
        rolesPermisos: Array.isArray(rolesPermisosRes)
          ? rolesPermisosRes
          : Array.isArray(rolesPermisosRes?.roles_permisos)
          ? rolesPermisosRes.roles_permisos
          : Array.isArray(rolesPermisosRes?.data)
          ? rolesPermisosRes.data
          : [],
        total: rolesPermisosRes?.total ?? 0,
        error: false,
      })),
      catchError(() =>
        of({
          roles: [],
          permisos: [],
          rolesPermisos: [],
          total: 0,
          error: true,
        }),
      ),
    );
  }
}
