export interface AdmRolesPermisos {
  id_rol_permiso: number;
  id_rol: number;
  id_permiso: number;
  activo?: number | null;
}

export type PartialAdmRolesPermisos = Partial<AdmRolesPermisos>;
