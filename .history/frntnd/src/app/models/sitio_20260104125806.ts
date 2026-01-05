export interface Sitio {
  id_sitio?: number | string;
  nombre?: string;
  codigo?: string | null;
  descripcion?: string | null;
  activo?: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
}
