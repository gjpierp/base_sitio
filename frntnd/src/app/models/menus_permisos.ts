export interface MenusPermisos {
  id_menu_permiso: number;
  id_menu: number;
  id_permiso: number;
  id_estado?: number | null;
}

export type PartialMenusPermisos = Partial<MenusPermisos>;
