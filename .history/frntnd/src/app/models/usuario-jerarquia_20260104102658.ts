export interface UsuarioJerarquia {
  id_usuario_jerarquia?: number | string;
  id_usuario?: number | string;
  id_jerarquia?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
