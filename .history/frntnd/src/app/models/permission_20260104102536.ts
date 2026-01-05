export interface Permission {
  id?: number | string;
  nombre: string;
  descripcion?: string;
  id_estado?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
