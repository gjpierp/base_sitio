export interface TiposUsuario {
  id_tipo_usuario: number;
  nombre: string;
  descripcion?: string | null;
  id_estado?: number | null;
}

export type PartialTiposUsuario = Partial<TiposUsuario>;
