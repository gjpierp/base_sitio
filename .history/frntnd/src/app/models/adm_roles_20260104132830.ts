export interface AdmRoles {
  id_rol: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialAdmRoles = Partial<AdmRoles>;
