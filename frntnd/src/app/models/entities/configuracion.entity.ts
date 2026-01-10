// Entidad basada en adm_configuraciones.json del backend
// Ajusta los tipos según necesidades de Angular/TypeScript

export interface ConfiguracionEntity {
  id_configuracion: number;
  id_usuario?: number | null;
  nombre_usuario?: string | null;
  id_estado?: number | null;
  nombre_estado?: string | null;
  clave: string;
  valor?: string | null;
  descripcion?: string | null;
  tipo?: 'string' | 'number' | 'boolean' | 'json' | 'select' | 'file' | 'date' | 'time';
  publico?: boolean;
  protegido?: boolean;
  creado_por?: number | null;
  fecha_creacion?: string | Date;
  actualizado_por?: number | null;
  fecha_actualizacion?: string | Date;
}
