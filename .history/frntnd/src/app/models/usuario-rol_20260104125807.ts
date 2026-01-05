export interface UsuarioRol {
  id_usuario_rol?: number | string;
  id_usuario?: number | string;
  id_rol?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
