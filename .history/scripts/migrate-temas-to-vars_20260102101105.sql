-- Script: migrate-temas-to-vars.sql
-- Propósito: Poblar `adm_temas_variables` y `adm_temas_valores` a partir de los JSON `css_vars` en `adm_temas`.
-- Ejecutar en la BD de administración (db_vvff_admin). Hacer backup antes.

/*
Recomendado:
mysqldump -u USUARIO -p db_vvff_admin adm_temas adm_temas_variables adm_temas_valores > backup_temas.sql
*/

SET @OLD_AUTOCOMMIT = @@autocommit;
SET autocommit = 0;
START TRANSACTION;

-- 1) Insertar variables únicas encontradas en todos los temas
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

-- 2) Preview: listar primeros 200 pares tema->variable->valor detectados
SELECT t.id_tema, t.clave AS tema_clave, v.id_tema_var, v.clave AS var_clave,
       JSON_UNQUOTE(JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"'))) AS valor_en_css,
       v.valor_defecto
FROM adm_temas t
JOIN JSON_TABLE(JSON_KEYS(IFNULL(t.css_vars, JSON_OBJECT())), '$[*]' COLUMNS (key_name VARCHAR(255) PATH '$')) AS jt
  ON jt.key_name IS NOT NULL
JOIN adm_temas_variables v ON v.clave = jt.key_name
LIMIT 200;

-- 3) Insertar/actualizar valores por tema para cada variable encontrada
--    Si no existe valor en el JSON se aplica el valor_defecto (si existe)
INSERT INTO adm_temas_valores (id_tema, id_tema_var, valor)
SELECT t.id_tema,
       v.id_tema_var,
       NULLIF(TRIM(COALESCE(
         JSON_UNQUOTE(JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"'))),
         v.valor_defecto
       )), '') AS valor
FROM adm_temas t
CROSS JOIN adm_temas_variables v
ON JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"')) IS NOT NULL
   OR v.valor_defecto IS NOT NULL
ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP;

COMMIT;
SET autocommit = @OLD_AUTOCOMMIT;

-- Fin del script
