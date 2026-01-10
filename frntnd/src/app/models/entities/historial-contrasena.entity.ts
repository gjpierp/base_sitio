// Entidad generada desde la tabla adm_historial_contrasenas
export interface HistorialContrasenaEntity {
  id_historial: number;
  id_usuario: number;
  nombre_usuario?: string;
  hash_contrasena: string;
  fecha_cambio: string | null;
}
