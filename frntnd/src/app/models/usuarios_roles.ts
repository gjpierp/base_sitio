/**
 * Esquema declarativo del modelo `usuariosRoles` para formularios y tablas.
 */
export const USUARIOS_ROLES_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_usuario_rol', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_usuario', label: 'Usuario', type: 'select' },
    { key: 'id_rol', label: 'Rol', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface UsuariosRoles {
  id_usuario_rol: number;
  id_usuario: number;
  id_rol: number;
}

export type PartialUsuariosRoles = Partial<UsuariosRoles>;
