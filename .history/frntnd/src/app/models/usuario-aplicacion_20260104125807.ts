export interface UsuarioAplicacion {
  id_usuario_aplicacion?: number | string;
  id_usuario?: number | string;
  id_aplicacion?: number | string;
  activo?: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
}
