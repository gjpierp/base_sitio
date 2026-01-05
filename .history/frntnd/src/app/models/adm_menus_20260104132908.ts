export interface AdmMenus {
  id_menu: number;
  nombre: string;
  url?: string | null;
  id_menu_padre?: number | null;
  orden?: number | null;
  icono?: string | null;
  id_estado?: number | null;
  visible?: number | null;
  nivel?: number | null;
  id_aplicacion?: number | null;
}

export type PartialAdmMenus = Partial<AdmMenus>;
