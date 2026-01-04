-- Script seguro para truncar adm_temas_variables y recrear FK
-- Haz backup antes de ejecutar:
-- mysqldump -u USUARIO -p db_vvff_admin adm_temas_variables adm_temas_variables_valores > backup_temas_vars.sql

-- 1) (Opcional) listar FKs que referencian la tabla padre para revisarlas
SELECT DISTINCT
  CONCAT('ALTER TABLE `', TABLE_SCHEMA, '`.`', TABLE_NAME, '` DROP FOREIGN KEY `', CONSTRAINT_NAME, '`;') AS drop_stmt
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'db_vvff_admin'
  AND REFERENCED_TABLE_NAME = 'adm_temas_variables';

-- 2) DROP FK (si conoces el nombre) — ajusta si el nombre difiere
ALTER TABLE db_vvff_admin.adm_temas_variables_valores
  DROP FOREIGN KEY fk_temas_valores_var;

-- 3) TRUNCATE la tabla padre
TRUNCATE TABLE db_vvff_admin.adm_temas_variables;

-- 4) Recrear la FK correcta (PK de la tabla padre es `id_tema_var`, la columna hija es `id_tema_var`)
ALTER TABLE db_vvff_admin.adm_temas_variables_valores
  ADD CONSTRAINT fk_temas_valores_var
  FOREIGN KEY (id_tema_var) REFERENCES db_vvff_admin.adm_temas_variables(id_tema_var)
  ON DELETE RESTRICT;

-- 5) Verificación
SELECT COUNT(*) AS padre_rows FROM db_vvff_admin.adm_temas_variables;
SELECT COUNT(*) AS hija_rows  FROM db_vvff_admin.adm_temas_variables_valores;
