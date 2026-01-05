export interface TipoUsuario {
  id_tipo_usuario: number;
  id?: number;
  nombre: string;
  descripcion?: string;
  id_estado?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
