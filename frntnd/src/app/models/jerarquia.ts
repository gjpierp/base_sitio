/**
 * Esquema declarativo del modelo `jerarquia` para formularios y tablas.
 */
export const JERARQUIA_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_jerarquia', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'id_jerarquia_padre', label: 'Jerarquía padre', type: 'select' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
  ],
};

export interface Jerarquia {
  id_jerarquia?: number | string;
  id_jerarquia_padre?: number | string | null;
  id_estado?: number | string | null;
  nombre?: string;
  descripcion?: string | null;
  [key: string]: any;
}
