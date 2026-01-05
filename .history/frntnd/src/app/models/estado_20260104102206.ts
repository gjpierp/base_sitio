export interface Estado {
  id_estado: number;
  id?: number;
  nombre: string;
  descripcion?: string;
  id_applicaciones_sitio?: number | null;
  activo?: number | boolean;

  [key: string]: any;
}
