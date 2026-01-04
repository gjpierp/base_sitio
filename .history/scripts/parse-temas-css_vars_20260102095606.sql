-- Script: parse-temas-css_vars.sql
-- Propósito: Parsear `css_vars` (JSON) en `adm_temas` y poblar
--           `adm_temas_variables` y `adm_temas_variables_valores`.
-- Uso: Hacer un backup antes de ejecutar. Ejecutar en la BD objetivo.

-- Recomendación:
-- 1) Hacer dump de las tablas objetivo:
--    mysqldump -u USUARIO -p db_vvff_admin adm_temas adm_temas_variables adm_temas_variables_valores > backup_temas.sql
-- 2) Ejecutar este script en una ventana de mantenimiento.

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET @OLD_SQL_MODE = @@SQL_MODE;
SET @OLD_AUTOCOMMIT = @@autocommit;

SET UNIQUE_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 0;
SET autocommit = 0;

START TRANSACTION;

-- 1) Insertar todos los nombres (clave) únicos encontrados en `adm_temas.css_vars`
INSERT INTO adm_temas_variables (clave, etiqueta, tipo, valor_defecto, meta)
SELECT DISTINCT jt.key_name AS clave,
       TRIM(LEADING '--' FROM jt.key_name) AS etiqueta,
       'css' AS tipo,
       NULL AS valor_defecto,
       NULL AS meta
FROM adm_temas t
JOIN JSON_TABLE(
  JSON_KEYS(IFNULL(t.css_vars, JSON_OBJECT())),
  '$[*]' COLUMNS (key_name VARCHAR(255) PATH '$')
) AS jt
WHERE jt.key_name IS NOT NULL
ON DUPLICATE KEY UPDATE clave = VALUES(clave);

-- 2) Poblar/actualizar los valores por tema
INSERT INTO adm_temas_variables_valores (id_tema, id_tema_var, valor)
SELECT t.id_tema,
       v.id_tema_var,
       JSON_UNQUOTE(JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(jt.key_name,'"','\\"'), '"'))) AS valor
FROM adm_temas t
JOIN JSON_TABLE(
  JSON_KEYS(IFNULL(t.css_vars, JSON_OBJECT())),
  '$[*]' COLUMNS (key_name VARCHAR(255) PATH '$')
) AS jt
JOIN adm_temas_variables v ON v.clave = jt.key_name
WHERE JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(jt.key_name,'"','\\"'), '"')) IS NOT NULL
ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP;

COMMIT;

SET autocommit = @OLD_AUTOCOMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;

-- Fin del script
