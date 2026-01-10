// Entidad generada desde la tabla adm_historial_accesos
export interface HistorialAccesoEntity {
  id_acceso: number;
  id_usuario: number;
  nombre_usuario?: string;
  fecha_entrada: string | null;
  fecha_salida: string | null;
  direccion_ip: string | null;
  user_agent: string | null;
}
