export interface AdmTiposUsuario {
  id_tipo_usuario: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
  activo?: number | null;
}

export type PartialAdmTiposUsuario = Partial<AdmTiposUsuario>;
