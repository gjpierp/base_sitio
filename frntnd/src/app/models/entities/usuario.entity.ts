// Entidad generada desde la tabla adm_usuarios
export interface UsuarioEntity {
  id_usuario: number;
  id_tipo_usuario: number;
  nombre_tipo_usuario?: string;
  id_estado: number;
  nombre_estado?: string;
  id_rol?: number;
  nombre_rol?: string;
  id_jerarquia?: string;
  nombre_jerarquia?: string;
  correo_electronico: string;
  hash_contrasena: string;
  nombre_usuario: string;
  nombres: string | null;
  apellidos: string | null;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
  fecha_cambio_contrasena: string | null;
  img: string | null;
  deleted_at: string | null;
}
