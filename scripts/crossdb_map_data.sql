-- crossdb_map_data.sql
-- Script para mapear datos existentes entre vvff_* y adm_*
-- Ejecute primero los backups y revise coincidencias antes de aplicar.

START TRANSACTION;

-- 1) Mapear usuarios por email
UPDATE db_viviendas_fiscales.vvff_usuarios v
JOIN db_vvff_admin.adm_usuarios a ON LOWER(TRIM(a.correo)) = LOWER(TRIM(v.email))
SET v.admin_id_usuario = a.id_usuario
WHERE v.admin_id_usuario IS NULL;

-- 2) Mapear roles por nombre (normalizando mayúsculas)
UPDATE db_viviendas_fiscales.vvff_rol r
JOIN db_vvff_admin.adm_roles ar ON LOWER(TRIM(ar.nombre)) = LOWER(TRIM(r.nombre))
SET r.admin_id_rol = ar.id_rol
WHERE r.admin_id_rol IS NULL;

-- 3) Mapear permisos por nombre
UPDATE db_viviendas_fiscales.vvff_permiso p
JOIN db_vvff_admin.adm_permisos ap ON LOWER(TRIM(ap.nombre)) = LOWER(TRIM(p.nombre))
SET p.admin_id_permiso = ap.id_permiso
WHERE p.admin_id_permiso IS NULL;

-- 4) Mapear estados por nombre
UPDATE db_viviendas_fiscales.vvff_estado e
JOIN db_vvff_admin.adm_estados ae ON LOWER(TRIM(ae.nombre)) = LOWER(TRIM(e.nombre))
SET e.admin_id_estado = ae.id_estado
WHERE e.admin_id_estado IS NULL;

COMMIT;

-- Notas:
-- - Si la comparación por nombre/email no es suficiente, revise manualmente los casos no mapeados.
-- - Para ver registros no mapeados después de ejecutar, use: SELECT * FROM db_viviendas_fiscales.vvff_usuarios WHERE admin_id_usuario IS NULL;
