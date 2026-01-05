export interface RolesPermisos {
  id_rol_permiso: number;
  id_rol: number;
  id_permiso: number;
  activo?: number | null;
}

export type PartialRolesPermisos = Partial<RolesPermisos>;
