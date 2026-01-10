// Entidad generada desde la tabla adm_menus
export interface MenuEntity {
  id_menu: number;
  id_menu_padre: number | null;
  nombre_menu_padre?: string;
  id_aplicacion: number | null;
  nombre_aplicacion?: string;
  id_estado: number;
  nombre_estado?: string;
  nombre: string;
  url: string | null;
  orden: number | null;
  icono: string | null;
  visible: number;
  nivel: number;
}
