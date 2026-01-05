export interface Configuracion {
  id_configuracion?: number | string;
  clave?: string;
  valor?: string | null;
  descripcion?: string | null;
  tipo?: string | null;
  publico?: number | boolean;
  id_usuario?: number | string | null;
  protegido?: number | boolean;
  creado_por?: number | string | null;
  fecha_creacion?: string | null;
  actualizado_por?: number | string | null;
  fecha_actualizacion?: string | null;

  [key: string]: any;
}
