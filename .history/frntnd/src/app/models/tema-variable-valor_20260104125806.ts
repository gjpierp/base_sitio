export interface TemaVariableValor {
  id?: number | string;
  id_tema?: number | string;
  id_tema_var?: number | string;
  valor?: string | null;
  creado_at?: string | null;
  actualizado_at?: string | null;

  [key: string]: any;
}
