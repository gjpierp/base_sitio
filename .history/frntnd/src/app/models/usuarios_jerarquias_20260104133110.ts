export interface UsuariosJerarquias {
  id_usuario_jerarquia: number;
  id_usuario: number;
  id_jerarquia: number;
  activo?: number | null;
}

export type PartialUsuariosJerarquias = Partial<UsuariosJerarquias>;
