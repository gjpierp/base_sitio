export interface AdmUsuariosRoles {
  id_usuario_rol: number;
  id_usuario: number;
  id_rol: number;
  activo?: number | null;
}

export type PartialAdmUsuariosRoles = Partial<AdmUsuariosRoles>;
