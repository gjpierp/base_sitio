export interface MenusPermisos {
  id_menu_permiso: number;
  id_menu: number;
  id_permiso: number;
  activo?: number | null;
}

export type PartialMenusPermisos = Partial<MenusPermisos>;
