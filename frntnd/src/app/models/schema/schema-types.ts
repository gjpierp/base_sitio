export interface SchemaField {
  key: string;
  label: string;
  type: string;
  readonly?: boolean;
  required?: boolean;
  fk?: string;
  options?: Array<{ value: any; label: string }>;
  verEnLista?: boolean;
  verEnEditar?: boolean;
  verEnCrear?: boolean;
  hidden?: boolean;
  orden?: number; // Orden para mostrar en tabla y modal
}
