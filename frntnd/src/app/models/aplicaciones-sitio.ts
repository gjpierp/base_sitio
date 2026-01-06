export interface AplicacionSitio {
  id_aplicacion?: number;
  id_sitio?: number;
  id_estado?: number | null;
  nombre?: string;
  clave?: string | null;
  descripcion?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}
