-- Migration: 2026_01_02_migrate_temas_schema.sql
-- Objetivo:
--  - Crear estructura relacional para variables de tema y configuraciones por usuario.
--  - Poblar `adm_temas_valores` con valores por tema/variable (usando datos en `adm_temas.css_vars` y valores por defecto de `adm_temas_variables`).
--  - Añadir columna `id_configuracion_default` en `adm_usuarios` para referenciar una configuración por defecto.
-- Recomendación: Hacer backup antes de ejecutar.
--   mysqldump -u USUARIO -p db_vvff_admin adm_temas adm_temas_variables adm_temas_valores adm_configuraciones_tema adm_configuraciones_valores adm_usuarios > backup_temas_full.sql

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET @OLD_SQL_MODE = @@SQL_MODE;
SET @OLD_AUTOCOMMIT = @@autocommit;

SET UNIQUE_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 0;
SET autocommit = 0;

START TRANSACTION;

-- 1) Crear tabla de valores por tema (si no existe)
CREATE TABLE IF NOT EXISTS `adm_temas_valores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_tema` INT NOT NULL,
  `id_tema_var` INT NOT NULL,
  `valor` TEXT DEFAULT NULL,
  `creado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_tema_var` (`id_tema`,`id_tema_var`),
  INDEX `idx_tema` (`id_tema`),
  INDEX `idx_tema_var` (`id_tema_var`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Crear tablas de configuraciones por usuario
CREATE TABLE IF NOT EXISTS `adm_configuraciones_tema` (
  `id_config` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_tema` INT NOT NULL,
  `nombre` VARCHAR(200) DEFAULT NULL,
  `creado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `meta` JSON DEFAULT NULL,
  PRIMARY KEY (`id_config`),
  INDEX `idx_conf_usuario` (`id_usuario`),
  CONSTRAINT `fk_conf_tema` FOREIGN KEY (`id_tema`) REFERENCES `adm_temas` (`id_tema`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `adm_configuraciones_valores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_config` INT NOT NULL,
  `id_tema_var` INT NOT NULL,
  `valor` TEXT DEFAULT NULL,
  `creado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_conf_var` (`id_config`,`id_tema_var`),
  INDEX `idx_conf` (`id_config`),
  CONSTRAINT `fk_conf_val_conf` FOREIGN KEY (`id_config`) REFERENCES `adm_configuraciones_tema` (`id_config`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Asegurar que `adm_temas_variables` exista (migration previa), asumimos que ya existe.
-- 4) Poblar catálogo de variables desde `adm_temas.css_vars` (idempotente)
--    Esto inserta claves únicas encontradas en los JSON `css_vars`.
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

-- 5) Poblar `adm_temas_valores` para que cada tema tenga fila para cada variable.
--    Para valores faltantes en `css_vars`, usamos `adm_temas_variables.valor_defecto`.
INSERT INTO adm_temas_valores (id_tema, id_tema_var, valor)
SELECT t.id_tema,
       v.id_tema_var,
       COALESCE(
         JSON_UNQUOTE(JSON_EXTRACT(t.css_vars, CONCAT('$."', REPLACE(v.clave,'"','\\"'), '"'))),
         v.valor_defecto
       ) AS valor
FROM adm_temas t
CROSS JOIN adm_temas_variables v
ON TRUE
WHERE TRUE
ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP;

-- 6) Añadir FK que referencia variables en adm_temas_valores ahora que adm_temas_variables existe
-- Añadir constraints FK en adm_temas_valores sólo si no existen (compatible con todas las versiones)
SET @fk_valores_tema_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS tc
  JOIN information_schema.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
  WHERE tc.TABLE_SCHEMA = DATABASE()
    AND tc.TABLE_NAME = 'adm_temas_valores'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND kcu.COLUMN_NAME = 'id_tema'
);
SET @sql_fk_valores_tema = IF(@fk_valores_tema_exists = 0,
  'ALTER TABLE adm_temas_valores ADD CONSTRAINT fk_valores_tema FOREIGN KEY (id_tema) REFERENCES adm_temas(id_tema) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 0'
);
PREPARE stmt_fk_valores_tema FROM @sql_fk_valores_tema; EXECUTE stmt_fk_valores_tema; DEALLOCATE PREPARE stmt_fk_valores_tema;

SET @fk_valores_var_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS tc
  JOIN information_schema.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
  WHERE tc.TABLE_SCHEMA = DATABASE()
    AND tc.TABLE_NAME = 'adm_temas_valores'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND kcu.COLUMN_NAME = 'id_tema_var'
);
SET @sql_fk_valores_var = IF(@fk_valores_var_exists = 0,
  'ALTER TABLE adm_temas_valores ADD CONSTRAINT fk_valores_var FOREIGN KEY (id_tema_var) REFERENCES adm_temas_variables(id_tema_var) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 0'
);
PREPARE stmt_fk_valores_var FROM @sql_fk_valores_var; EXECUTE stmt_fk_valores_var; DEALLOCATE PREPARE stmt_fk_valores_var;

-- 7) Añadir columna `id_configuracion_default` en `adm_usuarios` para señalar la configuración por defecto (opción recomendada)
--    Si la tabla `adm_usuarios` tiene otro nombre, ajustar manualmente.
-- Añadimos la columna sólo si no existe (compatible con entornos que no soportan ADD COLUMN IF NOT EXISTS)
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'adm_usuarios' AND COLUMN_NAME = 'id_configuracion_default'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE adm_usuarios ADD COLUMN id_configuracion_default INT NULL, ADD INDEX idx_usuarios_conf_default (id_configuracion_default)',
  'SELECT 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Añadir la FK sólo si no existe
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS tc
  JOIN information_schema.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
  WHERE tc.TABLE_SCHEMA = DATABASE()
    AND tc.TABLE_NAME = 'adm_usuarios'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND kcu.COLUMN_NAME = 'id_configuracion_default'
);
SET @sql_fk = IF(@fk_exists = 0,
  'ALTER TABLE adm_usuarios ADD CONSTRAINT fk_usuarios_conf_default FOREIGN KEY (id_configuracion_default) REFERENCES adm_configuraciones_tema(id_config) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 0'
);
PREPARE stmt_fk FROM @sql_fk; EXECUTE stmt_fk; DEALLOCATE PREPARE stmt_fk;

COMMIT;

SET autocommit = @OLD_AUTOCOMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;

-- Fin de migración
