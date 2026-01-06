export interface Roles {
  id_rol: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
}

export type PartialRoles = Partial<Roles>;
