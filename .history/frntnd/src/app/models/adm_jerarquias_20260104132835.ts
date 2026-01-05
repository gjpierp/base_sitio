export interface AdmJerarquias {
  id_jerarquia: number;
  nombre: string;
  descripcion?: string | null;
  id_jerarquia_padre?: number | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialAdmJerarquias = Partial<AdmJerarquias>;
