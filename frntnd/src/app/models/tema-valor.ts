/**
 * Esquema declarativo del modelo `temaValor` para formularios y tablas.
 */
export const TEMA_VALOR_SCHEMA: { fields: Array<any> } = {
  fields: [
    { key: 'id', label: 'ID', type: 'text', readonly: true, hidden: true },
    { key: 'id_tema', label: 'Tema', type: 'select' },
    { key: 'id_tema_var', label: 'Variable', type: 'select' },
    { key: 'valor', label: 'Valor', type: 'text' },
  ],
};
export interface TemaValor {
  id?: number | string;
  id_tema?: number | string;
  id_tema_var?: number | string;
  valor?: string | null;
  creado_at?: string | null;
  actualizado_at?: string | null;

  [key: string]: any;
}
