export interface Jerarquias {
  id_jerarquia: number;
  id_jerarquia_padre?: number | null;
  id_estado?: number | null;
  nombre: string;
  descripcion?: string | null;
}

export type PartialJerarquias = Partial<Jerarquias>;
