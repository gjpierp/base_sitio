export interface RolePermission {
  id_rol_permiso?: number | string;
  id_rol?: number | string;
  id_permiso?: number | string;
  activo?: number | boolean;

  [key: string]: any;
}
