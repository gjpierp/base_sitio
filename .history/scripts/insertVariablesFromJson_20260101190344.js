#!/usr/bin/env node
/**
 * insertVariablesFromJson.js
 *
 * Lee un JSON (array de objetos) y lo inserta en la tabla `variables`.
 * Uso:
 *   node scripts/insertVariablesFromJson.js path/to/file.json [--db=admin|vvff]
 *
 * El script usa el pool definido en `bcknd/database/connections.js` (alias `admin` por defecto).
 * Requiere que las variables de entorno ADMS_DB_* (y opcionalmente VVFF_DB_*) estén definidas.
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Error: ruta al JSON requerida. Uso: node scripts/insertVariablesFromJson.js file.json [--db=admin|vvff]');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const dbArg = args.find(a => a.startsWith('--db='));
  const dbAlias = dbArg ? dbArg.split('=')[1] : 'admin';

  let payload;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    payload = JSON.parse(content);
  } catch (err) {
    console.error('Error al leer/parsear JSON:', err.message);
    process.exit(1);
  }

  // Si el JSON contiene un objeto y la lista está bajo una clave, intentar detectar
  if (!Array.isArray(payload)) {
    // buscar la primera propiedad que sea array
    const keys = Object.keys(payload || {});
    const arrKey = keys.find(k => Array.isArray(payload[k]));
    if (arrKey) payload = payload[arrKey];
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    console.error('El JSON debe contener un array de objetos con los registros a insertar.');
    process.exit(1);
  }

  const first = payload[0];
  if (typeof first !== 'object' || Array.isArray(first)) {
    console.error('Elementos del array deben ser objetos con claves = columnas.');
    process.exit(1);
  }

  // Determinar columnas a partir de las claves del primer objeto
  const columns = Object.keys(first);
  if (columns.length === 0) {
    console.error('No se detectaron columnas en el primer objeto del array.');
    process.exit(1);
  }

  // Conectar al pool exportado por bcknd/database/connections.js
  let poolModule;
  try {
    poolModule = require(path.join('..', 'bcknd', 'database', 'connections'));
  } catch (err) {
    console.error('No se pudo cargar bcknd/database/connections.js:', err.message);
    process.exit(1);
  }

  const pool = (typeof poolModule.getPool === 'function') ? poolModule.getPool(dbAlias) : poolModule.dbAdmin;
  if (!pool) {
    console.error(`Pool de BD no encontrado para alias '${dbAlias}'.`);
    process.exit(1);
  }

  const placeholders = columns.map(() => '?').join(', ');
  const colsEscaped = columns.map(c => `\`${c}\``).join(', ');
  const updates = columns.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');
  const sql = `INSERT INTO \`variables\` (${colsEscaped}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    let inserted = 0;
    for (const item of payload) {
      const params = columns.map(k => (item.hasOwnProperty(k) ? item[k] : null));
      await conn.query(sql, params);
      inserted += 1;
    }

    await conn.commit();
    console.log(`OK: ${inserted} registros insertados/actualizados en la tabla 'variables'.`);
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error durante la inserción:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

main().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
