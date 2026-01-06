export interface Menus {
  id_menu: number;
  id_menu_padre?: number | null;
  id_aplicacion?: number | null;
  id_estado?: number | null;
  nombre: string;
  url?: string | null;
  orden?: number | null;
  icono?: string | null;
  visible?: number | null;
  nivel?: number | null;
}

export type PartialMenus = Partial<Menus>;
