/**
 * Esquema declarativo del modelo `tipoUsuario` para formularios y tablas.
 */
export const TIPO_USUARIO_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_tipo_usuario', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface TipoUsuario {
  id_tipo_usuario: number;
  id?: number;
  nombre: string;
  descripcion?: string;
  id_estado?: number | string;

  [key: string]: any;
}
