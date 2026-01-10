// Entidad generada desde la tabla adm_sesiones_activas
export interface SesionActivaEntity {
  id_sesion: number;
  id_usuario: number;
  nombre_usuario?: string;
  token_hash: string;
  fecha_expiracion: string;
  creado_at: string | null;
}
