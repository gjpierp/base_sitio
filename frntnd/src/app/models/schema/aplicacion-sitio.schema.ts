import { SchemaField } from './schema-types';

/**
 * Esquema de Aplicación Sitio
 * Define los campos y metadatos para la gestión de aplicaciones por sitio.
 * - Los campos con 'fk' representan relaciones foráneas.
 * - Los campos 'readonly' sólo se muestran en modo lectura.
 * - Los campos 'verEnLista', 'verEnEditar', 'verEnCrear' controlan la visibilidad en cada contexto.
 */
export const APLICACION_SITIO_SCHEMA: SchemaField[] = [
  {
    key: 'id_aplicacion',
    label: 'ID',
    type: 'number',
    readonly: true,
    verEnLista: false, // No mostrar en la lista
    verEnEditar: false,
    verEnCrear: false,
    orden: 1,
  },
  {
    key: 'id_sitio',
    label: 'Sitio',
    type: 'select',
    required: true,
    fk: 'sitio', // Relación foránea a sitio
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 3,
  },
  {
    key: 'nombre_sitio',
    label: 'Sitio',
    type: 'text',
    readonly: true,
    verEnLista: true,
    verEnEditar: false,
    verEnCrear: false,
    orden: 4,
  },
  {
    key: 'id_entidad',
    label: 'Entidad',
    type: 'select',
    required: false,
    fk: 'entidad', // Relación foránea a entidad
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 5,
  },
  {
    key: 'nombre_entidad',
    label: 'Entidad',
    type: 'text',
    readonly: true,
    verEnLista: true,
    verEnEditar: false,
    verEnCrear: false,
    orden: 6,
  },
  {
    key: 'id_estado',
    label: 'Estado',
    type: 'select',
    required: false,
    fk: 'estado', // Relación foránea a estado
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 7,
  },
  {
    key: 'nombre_estado',
    label: 'Estado',
    type: 'text',
    readonly: true,
    verEnLista: true,
    verEnEditar: false,
    verEnCrear: false,
    orden: 8,
  },
  {
    key: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    verEnLista: true,
    verEnEditar: true,
    verEnCrear: true,
    orden: 2,
  },
  {
    key: 'enlace',
    label: 'Enlace',
    type: 'text',
    required: false,
    verEnLista: true,
    verEnEditar: true,
    verEnCrear: true,
    orden: 9,
  },
  {
    key: 'metodo_http',
    label: 'Método HTTP',
    type: 'select',
    required: false,
    options: [
      { value: 'GET', label: 'GET' },
      { value: 'POST', label: 'POST' },
      { value: 'PUT', label: 'PUT' },
      { value: 'DELETE', label: 'DELETE' },
    ], // Opciones fijas
    verEnLista: true,
    verEnEditar: true,
    verEnCrear: true,
    orden: 10,
  },
  {
    key: 'icono',
    label: 'Icono',
    type: 'text',
    required: false,
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 11,
  },
  {
    key: 'es_menu',
    label: '¿Es menú?',
    type: 'checkbox',
    required: false,
    verEnLista: true,
    verEnEditar: true,
    verEnCrear: true,
    orden: 12,
  }, // Indica si la aplicación es un menú
  {
    key: 'clave',
    label: 'Clave',
    type: 'text',
    required: false,
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 13,
  },
  {
    key: 'descripcion',
    label: 'Descripción',
    type: 'textarea',
    required: false,
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 14,
  },
  {
    key: 'created_at',
    label: 'Creado',
    type: 'datetime',
    readonly: true,
    verEnLista: false,
    verEnEditar: false,
    verEnCrear: false,
    orden: 15,
  }, // Fecha de creación (solo lectura)
  {
    key: 'updated_at',
    label: 'Actualizado',
    type: 'datetime',
    readonly: true,
    verEnLista: false,
    verEnEditar: false,
    verEnCrear: false,
    orden: 16,
  }, // Fecha de actualización (solo lectura)
  {
    key: 'deleted_at',
    label: 'Eliminado',
    type: 'datetime',
    readonly: true,
    verEnLista: false,
    verEnEditar: false,
    verEnCrear: false,
    orden: 17,
  }, // Fecha de eliminación (solo lectura)
];
