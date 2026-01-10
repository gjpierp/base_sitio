// Entidad generada desde la tabla adm_atributos
export interface AtributoEntity {
  id_atributo: number;
  id_entidad: number;
    nombre_entidad?: string;
  nombre_columna: string;
  tipo_dato: string | null;
  es_auditable: number;
  id_estado: number;
    nombre_estado?: string;
  ver_en_crear: number;
  ver_en_editar: number;
  ver_en_lista: number;
  ver_en_detalle: number;
  es_fk: number;
  fk_tabla_referencia: string | null;
  fk_columna_mostrar: string | null;
}
