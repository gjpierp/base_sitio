export interface Auditoria {
  id_auditoria?: number;
  id_registro?: number;
  id_usuario?: number | null;
  tabla?: string;
  accion?: string;
  datos_anteriores?: string | null;
  datos_nuevos?: string | null;
  fecha?: string | null;
  direccion_ip?: string | null;
  [key: string]: any;
}
