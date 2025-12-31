-- crossdb_associate_fks.sql
-- Añade columnas de referencia en db_viviendas_fiscales apuntando a db_vvff_admin
-- RECOMENDACIONES PREVIAS:
-- 1) Hacer backup completo de ambas bases antes de ejecutar.
-- 2) Asegurarse que ambas tablas usan ENGINE=InnoDB y mismo CHARSET.
-- 3) Ejecutar en el servidor MySQL que tiene acceso a ambas bases (localhost en .env).

SET FOREIGN_KEY_CHECKS=0;

-- Usuarios: vincular vvff_usuarios -> adm_usuarios
ALTER TABLE db_viviendas_fiscales.vvff_usuarios
  ADD COLUMN admin_id_usuario INT NULL;

ALTER TABLE db_viviendas_fiscales.vvff_usuarios
  ADD CONSTRAINT fk_vvff_usuarios_admin_usuario
    FOREIGN KEY (admin_id_usuario) REFERENCES db_vvff_admin.adm_usuarios(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- Roles: vincular vvff_rol -> adm_roles
ALTER TABLE db_viviendas_fiscales.vvff_rol
  ADD COLUMN admin_id_rol INT NULL;

ALTER TABLE db_viviendas_fiscales.vvff_rol
  ADD CONSTRAINT fk_vvff_rol_admin_rol
    FOREIGN KEY (admin_id_rol) REFERENCES db_vvff_admin.adm_roles(id_rol)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- Permisos: vincular vvff_permiso -> adm_permisos
ALTER TABLE db_viviendas_fiscales.vvff_permiso
  ADD COLUMN admin_id_permiso INT NULL;

ALTER TABLE db_viviendas_fiscales.vvff_permiso
  ADD CONSTRAINT fk_vvff_permiso_admin_permiso
    FOREIGN KEY (admin_id_permiso) REFERENCES db_vvff_admin.adm_permisos(id_permiso)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- Estados: vincular vvff_estado -> adm_estados
ALTER TABLE db_viviendas_fiscales.vvff_estado
  ADD COLUMN admin_id_estado INT NULL;

ALTER TABLE db_viviendas_fiscales.vvff_estado
  ADD CONSTRAINT fk_vvff_estado_admin_estado
    FOREIGN KEY (admin_id_estado) REFERENCES db_vvff_admin.adm_estados(id_estado)
    ON UPDATE CASCADE ON DELETE RESTRICT;

SET FOREIGN_KEY_CHECKS=1;

-- Fin del script
