// Entidad generada desde la tabla adm_auditoria
export interface AuditoriaEntity {
  id_auditoria: number;
  id_entidad: number;
  nombre_entidad?: string;
  id_registro: number;
  id_usuario: number | null;
  nombre_usuario?: string;
  accion: string;
  datos_anteriores: any | null;
  datos_nuevos: any | null;
  fecha: string | null;
  direccion_ip: string | null;
}
