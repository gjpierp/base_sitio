/**
 * Esquema declarativo del modelo `usuarioRol` para formularios y tablas.
 */
export const USUARIO_ROL_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_usuario_rol', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_usuario', label: 'Usuario', type: 'select' },
    { key: 'id_rol', label: 'Rol', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface UsuarioRol {
  id_usuario_rol?: number | string;
  id_usuario?: number | string;
  id_rol?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
