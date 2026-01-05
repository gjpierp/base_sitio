export interface AdmUsuarios {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  hash_contrasena: string;
  fecha_cambio_contrasena?: string | null;
  id_tipo_usuario: number;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  id_estado?: number | null;
  img?: string | null;
  activo?: number | null;
  id_configuracion_default?: number | null;
  nombres?: string | null;
  apellidos?: string | null;
}

export type PartialAdmUsuarios = Partial<AdmUsuarios>;
