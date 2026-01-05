export interface AdmMenusPermisos {
  id_menu_permiso: number;
  id_menu: number;
  id_permiso: number;
  activo?: number | null;
}

export type PartialAdmMenusPermisos = Partial<AdmMenusPermisos>;
