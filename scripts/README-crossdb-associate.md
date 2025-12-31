Objetivo

Asociar entidades (estados, usuarios, roles, permisos) de la base `db_viviendas_fiscales` con las tablas maestras en `db_vvff_admin`.

Contenido de los scripts

- `crossdb_associate_fks.sql`: Añade columnas `admin_*` en las tablas `vvff_*` y crea las `FOREIGN KEY` hacia `db_vvff_admin.adm_*`.
- `crossdb_map_data.sql`: Actualiza las nuevas columnas mapeando por `email` o `nombre`.

Pasos recomendados

1. Backup de ambas bases de datos:

```bash
mysqldump -u root -p db_vvff_admin > db_vvff_admin.bak.sql
mysqldump -u root -p db_viviendas_fiscales > db_viviendas_fiscales.bak.sql
```

2. Revisar engines y charsets (ambas deben ser InnoDB y utf8mb4):

```sql
SELECT TABLE_SCHEMA, TABLE_NAME, ENGINE, TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA IN ('db_vvff_admin','db_viviendas_fiscales')
  AND TABLE_NAME IN ('adm_usuarios','adm_estados','adm_roles','adm_permisos','vvff_usuarios','vvff_estado','vvff_rol','vvff_permiso');
```

3. Ejecutar `crossdb_map_data.sql` en modo `DRY RUN` (SELECT) para revisar candidatos:

```sql
-- ejemplo: ver usuarios coincidentes por email
SELECT v.id_usuario AS vvff_id, v.email, a.id_usuario AS adm_id, a.correo
FROM db_viviendas_fiscales.vvff_usuarios v
LEFT JOIN db_vvff_admin.adm_usuarios a ON LOWER(TRIM(a.correo)) = LOWER(TRIM(v.email));
```

4. Ejecutar `crossdb_associate_fks.sql` y `crossdb_map_data.sql` en orden indicado.

5. Probar endpoints y revisar integridad. Si todo ok, considerar migrar las relaciones muchas-a-muchas (vvff_usuario_rol) a referencias administrativas si se necesita sincronización.

Notas adicionales

- Si las bases están en distinto servidor y no soportan FK cross-db, aplicar la estrategia de map/validación en la capa aplicativa o usar tablas de mapeo centrales.
- Las constraints usan `ON DELETE SET NULL` o `RESTRICT` según el caso; puedes ajustarlas si prefieres `CASCADE`.
