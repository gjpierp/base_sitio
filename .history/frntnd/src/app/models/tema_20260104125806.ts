export interface Tema {
  id_tema?: number | string;
  clave?: string;
  nombre?: string;
  descripcion?: string | null;
  tipo?: string | null;
  css_vars?: any;
  preview?: string | null;
  activo?: number | boolean;
  publico?: number | boolean;
  id_usuario?: number | string | null;
  creado_por?: number | string | null;
  fecha_creacion?: string | null;
  actualizado_por?: number | string | null;
  fecha_actualizacion?: string | null;

  [key: string]: any;
}
