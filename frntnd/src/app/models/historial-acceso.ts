export interface HistorialAcceso {
  id_acceso?: number | string;
  id_usuario?: number | string;
  fecha_entrada?: string | null;
  fecha_salida?: string | null;
  direccion_ip?: string | null;
  user_agent?: string | null;

  [key: string]: any;
}
