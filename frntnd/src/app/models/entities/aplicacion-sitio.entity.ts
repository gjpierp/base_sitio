// Entidad generada desde la tabla adm_aplicaciones_sitio
export interface AplicacionSitioEntity {
  id_aplicacion: number;
  id_sitio: number;
  nombre_sitio?: string;
  id_entidad: number | null;
  nombre_entidad?: string;
  id_estado: number;
  nombre_estado?: string;
  nombre: string;
  enlace: string | null;
  metodo_http: 'GET' | 'POST' | 'PUT' | 'DELETE';
  icono: string | null;
  es_menu: number;
  deleted_at: string | null;
  clave: string | null;
  descripcion: string | null;
  created_at: string | null;
  updated_at: string | null;
}
