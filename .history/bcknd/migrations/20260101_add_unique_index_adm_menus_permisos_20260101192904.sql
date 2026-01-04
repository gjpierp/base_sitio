-- Migration: Add unique index to prevent duplicate menu-permission relations
-- Run this once in your DB (adjust schema/database as needed)

ALTER TABLE adm_menus_permisos
  ADD CONSTRAINT uq_menu_perm UNIQUE (id_menu, id_permiso);
