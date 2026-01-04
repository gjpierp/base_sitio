-- Dry-run: listar ALTER TABLE ... DROP FOREIGN KEY que referencian adm_temas_variables
-- No ejecuta ningún DROP ni TRUNCATE. Revisa la salida y ejecuta manualmente los DROP aprobados.

SELECT DISTINCT
  CONCAT('ALTER TABLE `', TABLE_SCHEMA, '`.`', TABLE_NAME, '` DROP FOREIGN KEY `', CONSTRAINT_NAME, '`;') AS drop_stmt,
  TABLE_SCHEMA,
  TABLE_NAME,
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'db_vvff_admin'
  AND REFERENCED_TABLE_NAME = 'adm_temas_variables'
ORDER BY TABLE_SCHEMA, TABLE_NAME;

-- Instrucciones:
-- 1) Ejecuta este script y revisa las filas devueltas en la columna `drop_stmt`.
-- 2) Si estás de acuerdo, copia los `ALTER TABLE ... DROP FOREIGN KEY ...;` y ejecútalos manualmente.
-- 3) Luego ejecuta el TRUNCATE y, si procede, el ADD CONSTRAINT para recrear la FK.

-- Ejemplo de uso (manual, tras revisar):
-- ALTER TABLE db_vvff_admin.adm_temas_variables_valores DROP FOREIGN KEY fk_temas_valores_var;
-- TRUNCATE TABLE db_vvff_admin.adm_temas_variables;
-- ALTER TABLE db_vvff_admin.adm_temas_variables_valores
--   ADD CONSTRAINT fk_temas_valores_var FOREIGN KEY (id_tema_var) REFERENCES db_vvff_admin.adm_temas_variables(id_tema_var) ON DELETE RESTRICT;
