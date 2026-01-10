// Entidad generada desde la tabla adm_historial_acciones
export interface HistorialAccionEntity {
  id_accion: number;
  id_usuario: number;
  nombre_usuario?: string;
  accion: string;
  descripcion: string | null;
  fecha: string | null;
  direccion_ip: string | null;
}
