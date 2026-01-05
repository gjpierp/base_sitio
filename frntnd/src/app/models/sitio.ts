/**
 * Esquema declarativo del modelo `sitio` para formularios y tablas.
 */
export const SITIO_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_sitio', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface Sitio {
  id_sitio?: number | string;
  nombre?: string;
  codigo?: string | null;
  descripcion?: string | null;
  activo?: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
}
