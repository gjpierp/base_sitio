/**
 * Esquema declarativo del modelo `estado` para formularios y tablas.
 */
export const ESTADO_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_estado', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'id_applicaciones_sitio', label: 'Aplicación Sitio', type: 'select', hidden: true },
  ],
};

export interface Estado {
  id_estado: number;
  nombre: string;
  descripcion?: string;
  id_applicaciones_sitio?: number | null;
  activo?: number | boolean;
  [key: string]: any;
}
