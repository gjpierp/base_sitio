import { SchemaField } from './schema-types';

export const PERMISO_SCHEMA: SchemaField[] = [
  {
    key: 'id_permiso',
    label: 'ID',
    type: 'number',
    readonly: true,
    verEnLista: false,
    verEnEditar: false,
    verEnCrear: false,
    orden: 1
  },
  {
    key: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    verEnLista: true,
    verEnEditar: true,
    verEnCrear: true,
    orden: 2
  },
  {
    key: 'id_estado',
    label: 'Estado',
    type: 'select',
    required: false,
    fk: 'estado',
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 3
  },
  {
    key: 'nombre_estado',
    label: 'Estado',
    type: 'text',
    required: true,
    verEnLista: true,
    verEnEditar: false,
    verEnCrear: false,
    orden: 4
  },
  {
    key: 'descripcion',
    label: 'Descripción',
    type: 'text',
    required: false,
    verEnLista: false,
    verEnEditar: true,
    verEnCrear: true,
    orden: 5
  },
];
