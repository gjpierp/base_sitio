export interface MenuItem {
  id_menu?: number | string;
  id?: number | string;
  id_menu_padre?: number | string | null;
  id_aplicacion?: number | string | null;
  id_estado?: number | string;
  nombre: string;
  url?: string;
  ruta?: string; // alias for url
  orden?: number;
  icono?: string;
  visible?: number | boolean;
  nivel?: number;
  [key: string]: any;
}
