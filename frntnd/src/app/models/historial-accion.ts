export interface HistorialAccion {
  id_accion?: number | string;
  id_usuario?: number | string;
  accion?: string;
  descripcion?: string | null;
  fecha?: string | null;
  direccion_ip?: string | null;

  [key: string]: any;
}
