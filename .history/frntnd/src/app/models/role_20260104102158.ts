export interface Role {
  id_rol?: number | string;
  id?: number | string;
  nombre: string;
  descripcion?: string;
  id_estado?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
