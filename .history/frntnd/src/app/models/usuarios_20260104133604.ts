export interface Usuarios {
  /** PK */
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  hash_contrasena: string;
  /** Fecha del último cambio de contraseña */
  fecha_cambio_contrasena?: string | Date | null;
  id_tipo_usuario: number;
  /** Timestamps */
  fecha_creacion?: string | Date | null;
  fecha_actualizacion?: string | Date | null;
  id_estado?: number | null;
  img?: string | null;
  activo?: number | null;
  id_configuracion_default?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
}

export type PartialUsuarios = Partial<Usuarios>;

// Alias compatible con modelos backend
export type AdmUsuarios = Usuarios;

