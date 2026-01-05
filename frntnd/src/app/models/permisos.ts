/**
 * Esquema declarativo del modelo `permisos` para formularios y tablas.
 */
export const PERMISOS_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_permiso', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface Permisos {
  id_permiso: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialPermisos = Partial<Permisos>;
