/**
 * Esquema declarativo del modelo `usuarioAplicacion` para formularios y tablas.
 */
export const USUARIO_APLICACION_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id_usuario_aplicacion', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_usuario', label: 'Usuario', type: 'select' },
    { key: 'id_aplicacion', label: 'Aplicación', type: 'select' },
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
export interface UsuarioAplicacion {
  id_usuario_aplicacion?: number | string;
  id_usuario?: number | string;
  id_aplicacion?: number | string;
  activo?: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
}
