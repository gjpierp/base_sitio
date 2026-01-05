export interface TemaVariable {
  id_tema_var?: number | string;
  clave?: string;
  etiqueta?: string | null;
  tipo?: string | null;
  valor_defecto?: string | null;
  meta?: any;
  creado_at?: string | null;
  actualizado_at?: string | null;

  [key: string]: any;
}
