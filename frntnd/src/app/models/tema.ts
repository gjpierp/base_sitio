/**
 * Esquema declarativo del modelo `tema` para formularios y tablas.
 */
export const TEMA_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_tema', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'clave', label: 'Clave', type: 'text' },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'select' },
    { key: 'publico', label: 'Público', type: 'select' },
  ],
};
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
