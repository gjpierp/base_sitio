// Entidad generada desde la tabla adm_jerarquias
export interface JerarquiaEntity {
  id_jerarquia: number;
  id_jerarquia_padre: number | null;
  nombre_jerarquia_padre?: string;
  id_estado: number;
  nombre_estado?: string;
  nombre: string;
  descripcion: string | null;
}
