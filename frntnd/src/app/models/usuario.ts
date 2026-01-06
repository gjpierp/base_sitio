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
  nombres?: string | null;
  apellidos?: string | null;

  // Frontend-friendly aliases (kept for compatibility)
  id?: number | string;
  nombre?: string;
  correo_electronico?: string;

  // Campos agregados para evitar errores TS7053/TS2551
  id_rol?: number | string;
  nombre_rol?: string;
  nombre_jerarquia?: string;
  nombre_tipo_usuario?: string;
  nombre_estado?: string;

  // [key: string]: any; // Eliminar si no es necesario
}

/**
 * Esquema declarativo del modelo `usuario` para uso en formularios y UIs.
 * Mantener aquí las etiquetas y tipos por defecto para que el componente sea fuente única.
 */
export const USUARIO_SCHEMA: { fields: Array<any> } = {
  fields: [
    // alias frontend
    { key: 'id', label: 'ID', type: 'text', readonly: true, hidden: true, hiddenOnCreate: true },
    // identity
    { key: 'nombre_usuario', label: 'Nombre de usuario', type: 'text' },
    { key: 'nombres', label: 'Nombres', type: 'text' },
    { key: 'apellidos', label: 'Apellidos', type: 'text' },
    // contact
    // El correo es único por usuario: no se podrá editar en modo edición.
    {
      key: 'correo_electronico',
      label: 'Correo electrónico',
      type: 'text',
      alias: 'correo_electronico',
      readonly: false,
      readonlyOnEdit: true,
      value: '',
    },
    // avatar
    {
      key: 'img',
      label: 'Avatar (URL)',
      type: 'text',
      hidden: true,
      hiddenOnEdit: true,
      hiddenOnCreate: true,
    },
    // password (visible al crear; oculto al editar)
    { key: 'contrasena', label: 'Contraseña', type: 'password', hidden: false, hiddenOnEdit: true },
    // relations / selects
    { key: 'id_rol', label: 'Rol', type: 'select' },
    { key: 'id_jerarquia', label: 'Jerarquía', type: 'select' },
    { key: 'id_tipo_usuario', label: 'Tipo usuario', type: 'select' },
    { key: 'id_estado', label: 'Estado', type: 'select' },
    // flags
    // Campo 'activo' eliminado
  ],
};
