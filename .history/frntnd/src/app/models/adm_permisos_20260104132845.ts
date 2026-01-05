export interface AdmPermisos {
  id_permiso: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialAdmPermisos = Partial<AdmPermisos>;
