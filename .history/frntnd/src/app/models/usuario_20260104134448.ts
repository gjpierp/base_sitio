export interface User {
  // Backend fields
  id_usuario?: number | string;
  nombre_usuario?: string;
  correo?: string;
  hash_contrasena?: string;
  fecha_cambio_contrasena?: string | null;
  id_tipo_usuario?: number | string;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  id_estado?: number | string;
  img?: string | null;
  activo?: number | boolean;
  id_configuracion_default?: number | string | null;
  nombres?: string | null;
  apellidos?: string | null;

  // Frontend-friendly aliases (kept for compatibility)
  id?: number | string;
  nombre?: string;
  correo_electronico?: string;

  [key: string]: any;
}

/**
 * Esquema declarativo del modelo `usuario` para uso en formularios y UIs.
 * Mantener aquí las etiquetas y tipos por defecto para que el componente sea fuente única.
 */
export const USUARIO_SCHEMA: { fields: Array<any> } = {
  fields: [
    // alias frontend
    { key: 'id', label: 'ID', type: 'text', readonly: true, hiddenOnCreate: true },
    // identity
    { key: 'nombre_usuario', label: 'Nombre de usuario', type: 'text' },
    { key: 'nombres', label: 'Nombres', type: 'text' },
    { key: 'apellidos', label: 'Apellidos', type: 'text' },
    // contact
    { key: 'correo_electronico', label: 'Correo electrónico', type: 'text', alias: 'correo' },
    // avatar
    { key: 'img', label: 'Avatar (URL)', type: 'text' },
    // config
    { key: 'id_configuracion_default', label: 'Configuración por defecto', type: 'text' },
    // relations / selects
    { key: 'id_rol', label: 'Rol', type: 'select' },
    { key: 'id_jerarquia', label: 'Jerarquía', type: 'select' },
    { key: 'id_tipo_usuario', label: 'Tipo usuario', type: 'select' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
    // flags
    { key: 'activo', label: 'Activo', type: 'select' },
  ],
};
