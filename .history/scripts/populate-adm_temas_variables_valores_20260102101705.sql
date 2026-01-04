-- Script: populate-adm_temas_variables_valores.sql
-- Propósito: Poblar `adm_temas_variables_valores` usando los JSON `css_vars` en `adm_temas`.
-- Recomendación: Hacer backup antes de ejecutar.
--   mysqldump -u USUARIO -p db_vvff_admin adm_temas adm_temas_variables adm_temas_variables_valores > backup_temas_vars.sql

SET @OLD_AUTOCOMMIT = @@autocommit;
SET autocommit = 0;
START TRANSACTION;

-- 1) Asegurar catálogo de variables (idempotente)
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

-- 2) Insertar valores explícitos encontrados en css_vars
INSERT INTO adm_temas_variables_valores (id_tema, id_tema_var, valor)
SELECT t.id_tema,
       v.id_tema_var,
       JSON_UNQUOTE(JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"'))) AS valor
FROM adm_temas t
JOIN JSON_TABLE(
  JSON_KEYS(IFNULL(t.css_vars, JSON_OBJECT())),
  '$[*]' COLUMNS (key_name VARCHAR(255) PATH '$')
) AS jt ON jt.key_name IS NOT NULL
JOIN adm_temas_variables v ON v.clave = jt.key_name
WHERE JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"')) IS NOT NULL
ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP;

-- 3) Insertar valores por defecto donde falten (si variable tiene valor_defecto)
INSERT INTO adm_temas_variables_valores (id_tema, id_tema_var, valor)
SELECT t.id_tema, v.id_tema_var, v.valor_defecto
FROM adm_temas t
CROSS JOIN adm_temas_variables v
WHERE v.valor_defecto IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM adm_temas_variables_valores vv
    WHERE vv.id_tema = t.id_tema AND vv.id_tema_var = v.id_tema_var
  );

COMMIT;
SET autocommit = @OLD_AUTOCOMMIT;

-- Fin del script
