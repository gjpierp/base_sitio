export interface Permisos {
  id_permiso: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialPermisos = Partial<Permisos>;
