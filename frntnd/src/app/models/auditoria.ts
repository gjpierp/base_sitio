export interface Auditoria {
  id_auditoria?: number | string;
  tabla?: string;
  id_registro?: number | string;
  accion?: string;
  id_usuario?: number | string | null;
  datos_anteriores?: string | null;
  datos_nuevos?: string | null;
  fecha?: string | null;
  direccion_ip?: string | null;

  [key: string]: any;
}
