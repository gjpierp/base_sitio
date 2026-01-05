/**
 * Esquema declarativo del modelo `temaVariable` para formularios y tablas.
 */
export const TEMA_VARIABLE_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_tema_var', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'clave', label: 'Clave', type: 'text' },
    { key: 'etiqueta', label: 'Etiqueta', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'valor_defecto', label: 'Valor por defecto', type: 'text' },
  ],
};
export interface TemaVariable {
  id_tema_var?: number | string;
  clave?: string;
  etiqueta?: string | null;
  tipo?: string | null;
  valor_defecto?: string | null;
  meta?: any;
  creado_at?: string | null;
  actualizado_at?: string | null;

  [key: string]: any;
}
