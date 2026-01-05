export interface UsuariosRoles {
  id_usuario_rol: number;
  id_usuario: number;
  id_rol: number;
  activo?: number | null;
}

export type PartialUsuariosRoles = Partial<UsuariosRoles>;
