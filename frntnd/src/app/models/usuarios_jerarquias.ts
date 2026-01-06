/**
 * Esquema declarativo del modelo `usuariosJerarquias` para formularios y tablas.
 */
export const USUARIOS_JERARQUIAS_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_usuario_jerarquia', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_usuario', label: 'Usuario', type: 'select' },
    { key: 'id_jerarquia', label: 'Jerarquía', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface UsuariosJerarquias {
  id_usuario_jerarquia: number;
  id_usuario: number;
  id_jerarquia: number;
}

export type PartialUsuariosJerarquias = Partial<UsuariosJerarquias>;
