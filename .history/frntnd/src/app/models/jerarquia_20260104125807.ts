export interface Jerarquia {
  id_jerarquia?: number | string;
  nombre?: string;
  descripcion?: string | null;
  id_jerarquia_padre?: number | string | null;
  id_estado?: number | string | null;
  activo?: number | boolean;

  [key: string]: any;
}
