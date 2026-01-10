import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolesPermisosResolver implements Resolve<any> {
  constructor(private api: ApiService) {}

  async resolve() {
    try {
      const [roles, permisos, rolesPermisosRes] = await firstValueFrom(
        forkJoin([
          this.api.get<any>('roles'),
          this.api.get<any>('permisos'),
          this.api.get<any>('roles-permisos'),
        ])
      );
      return {
        roles: Array.isArray(roles) ? roles : roles?.roles || roles?.data || [],
        permisos: Array.isArray(permisos) ? permisos : permisos?.permisos || permisos?.data || [],
        rolesPermisos: Array.isArray(rolesPermisosRes)
          ? rolesPermisosRes
          : Array.isArray(rolesPermisosRes?.roles_permisos)
          ? rolesPermisosRes.roles_permisos
          : Array.isArray(rolesPermisosRes?.data)
          ? rolesPermisosRes.data
          : [],
        total: rolesPermisosRes?.total || 0,
      };
    } catch (err) {
      return { roles: [], permisos: [], rolesPermisos: [], total: 0, error: true };
    }
  }
}
