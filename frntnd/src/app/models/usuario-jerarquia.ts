/**
 * Esquema declarativo del modelo `usuarioJerarquia` para formularios y tablas.
 */
export const USUARIO_JERARQUIA_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_usuario_jerarquia', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_usuario', label: 'Usuario', type: 'select' },
    { key: 'id_jerarquia', label: 'Jerarquía', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface UsuarioJerarquia {
  id_usuario_jerarquia?: number | string;
  id_usuario?: number | string;
  id_jerarquia?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
