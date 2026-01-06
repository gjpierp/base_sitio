/**
 * Esquema declarativo del modelo `role` para formularios y tablas.
 */
export const ROLE_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_rol', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
  ],
};
export interface Role {
  id_rol?: number | string;
  id?: number | string;
  nombre: string;
  descripcion?: string;
  id_estado?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
