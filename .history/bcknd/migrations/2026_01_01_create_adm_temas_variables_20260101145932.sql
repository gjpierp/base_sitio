-- Migration: Create theme variables catalog and per-theme values
-- Creates two tables:
--  - adm_temas_variables: catalog of configurable CSS variables for themes
--  - adm_temas_variables_valores: per-theme values linking to adm_temas (id_tema)
-- Run in a maintenance window and BACKUP your DB before applying.

-- Table: adm_temas_variables
CREATE TABLE IF NOT EXISTS `adm_temas_variables` (
  `id_tema_var` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(150) NOT NULL,
  `etiqueta` VARCHAR(255) DEFAULT NULL,
  `tipo` VARCHAR(50) NOT NULL DEFAULT 'string',
  `valor_defecto` TEXT DEFAULT NULL,
  `meta` JSON DEFAULT NULL,
  `creado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tema_var`),
  UNIQUE KEY `ux_adm_temas_variables_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: adm_temas_variables_valores
CREATE TABLE IF NOT EXISTS `adm_temas_variables_valores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_tema` INT NOT NULL,
  `id_tema_var` INT NOT NULL,
  `valor` TEXT DEFAULT NULL,
  `creado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_tema_var` (`id_tema`, `id_tema_var`),
  INDEX `idx_tema` (`id_tema`),
  INDEX `idx_tema_var` (`id_tema_var`),
  CONSTRAINT `fk_temas_valores_tema` FOREIGN KEY (`id_tema`) REFERENCES `adm_temas` (`id_tema`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_temas_valores_var` FOREIGN KEY (`id_tema_var`) REFERENCES `adm_temas_variables` (`id_tema_var`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: seed common CSS variables (examples)
INSERT INTO `adm_temas_variables` (`clave`, `etiqueta`, `tipo`, `valor_defecto`, `meta`) VALUES
  ('--primary-color', 'Color primario', 'color', '#0b5fff', JSON_OBJECT('category', 'palette')),
  ('--secondary-color', 'Color secundario', 'color', '#f0f0f0', JSON_OBJECT('category', 'palette')),
  ('--font-family', 'Fuente base', 'string', 'Inter, system-ui, sans-serif', JSON_OBJECT('category','typography'))
ON DUPLICATE KEY UPDATE clave = VALUES(clave);

-- End of migration
