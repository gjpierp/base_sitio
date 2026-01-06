export interface ConfiguracionTema {
  id_config?: number | string;
  id_usuario?: number | string;
  id_tema?: number | string;
  id_estado?: number | null;
  nombre?: string | null;
  creado_at?: string | null;
  meta?: any;
  [key: string]: any;
}
