export interface AplicacionSitio {
  id_aplicacion?: number | string;
  id_sitio?: number | string;
  nombre?: string;
  clave?: string | null;
  descripcion?: string | null;
  activo?: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
}
