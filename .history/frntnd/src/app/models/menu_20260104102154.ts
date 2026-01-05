export interface MenuItem {
  id_menu?: number | string;
  id?: number | string;
  nombre: string;
  url?: string;
  ruta?: string; // alias for url
  id_menu_padre?: number | string | null;
  orden?: number;
  icono?: string;
  id_estado?: number | string;
  visible?: number | boolean;
  nivel?: number;
  id_aplicacion?: number | string | null;

  [key: string]: any;
}
