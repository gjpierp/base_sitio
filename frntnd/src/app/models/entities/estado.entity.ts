// Entidad generada desde la tabla adm_estados
export interface EstadoEntity {
  id_estado: number;
  nombre: string;
  tipo_entidad: 'SISTEMA' | 'VIVIENDA' | 'USUARIO';
  descripcion: string | null;
  id_applicaciones_sitio: number | null;
  nombre_applicaciones_sitio?: string;
}
