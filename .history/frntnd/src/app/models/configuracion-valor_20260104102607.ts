export interface ConfiguracionValor {
  id?: number | string;
  id_config?: number | string;
  id_tema_var?: number | string;
  valor?: string | null;
  creado_at?: string | null;
  actualizado_at?: string | null;

  [key: string]: any;
}
