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

  // Frontend-friendly aliases (kept for compatibility)
  id?: number | string;
  nombre?: string;
  correo_electronico?: string;

  [key: string]: any;
}
