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

const fs = require("fs");
const path = require("path");

// Cargar variables de entorno del backend (bcknd/.env) si existe
try {
  require("dotenv").config({
    path: path.join(__dirname, "..", "bcknd", ".env"),
  });
} catch (e) {
  // ignore
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error(
      "Error: ruta al JSON requerida. Uso: node scripts/insertVariablesFromJson.js file.json [--db=admin|vvff]"
    );
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  const dbArg = args.find((a) => a.startsWith("--db="));
  const dbAlias = dbArg ? dbArg.split("=")[1] : "admin";
  const tableArg = args.find((a) => a.startsWith("--table="));
  const tableName = tableArg ? tableArg.split("=")[1] : "variables";
  const dryRun = args.includes("--dry-run") || args.includes("-n");
  const validate = args.includes("--validate");

  let payload;
  try {
    const content = fs.readFileSync(filePath, "utf8");
    payload = JSON.parse(content);
  } catch (err) {
    console.error("Error al leer/parsear JSON:", err.message);
    process.exit(1);
  }

  // Si el JSON contiene un objeto y la lista está bajo una clave, intentar detectar
  if (!Array.isArray(payload)) {
    // buscar la primera propiedad que sea array
    const keys = Object.keys(payload || {});
    const arrKey = keys.find((k) => Array.isArray(payload[k]));
    if (arrKey) payload = payload[arrKey];
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    console.error(
      "El JSON debe contener un array de objetos con los registros a insertar."
    );
    process.exit(1);
  }

  const first = payload[0];
  if (typeof first !== "object" || Array.isArray(first)) {
    console.error(
      "Elementos del array deben ser objetos con claves = columnas."
    );
    process.exit(1);
  }

  // Determinar columnas a partir de las claves del primer objeto
  const columns = Object.keys(first);
  if (columns.length === 0) {
    console.error("No se detectaron columnas en el primer objeto del array.");
    process.exit(1);
  }

  // Conectar al pool exportado por bcknd/database/connections.js
  let poolModule;
  try {
    poolModule = require(path.join(
      __dirname,
      "..",
      "bcknd",
      "database",
      "connections"
    ));
  } catch (err) {
    console.error(
      "No se pudo cargar bcknd/database/connections.js:",
      err.message
    );
    process.exit(1);
  }

  const pool =
    typeof poolModule.getPool === "function"
      ? poolModule.getPool(dbAlias)
      : poolModule.dbAdmin;
  if (!pool) {
    console.error(`Pool de BD no encontrado para alias '${dbAlias}'.`);
    process.exit(1);
  }

  const placeholders = columns.map(() => "?").join(", ");
  const colsEscaped = columns.map((c) => `\`${c}\``).join(", ");
  const updates = columns.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");
  const sql = `INSERT INTO \`${tableName}\` (${colsEscaped}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`;

  // Si se solicitó validación, obtener columnas reales de la tabla
  if (validate) {
    let vConn;
    try {
      vConn = await pool.getConnection();
      const [rows] = await vConn.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const actualCols = rows.map((r) => r.Field);
      const missing = columns.filter((c) => !actualCols.includes(c));
      console.log(`Validación tabla '${tableName}': columnas reales=${actualCols.length}, payload=${columns.length}`);
      if (missing.length) console.warn('Columnas faltantes en la tabla:', missing);
      else console.log('Todas las columnas del payload existen en la tabla.');
    } catch (err) {
      console.error('Error al validar esquema de la tabla:', err.message);
      if (!dryRun) process.exit(1);
    } finally {
      if (vConn) vConn.release();
    }
  }

  if (dryRun) {
    console.log('--- DRY RUN: no se ejecutarán consultas ---');
    console.log('SQL preparado:', sql);
    console.log('Primeros 5 sets de parámetros:');
    payload.slice(0, 5).forEach((item, idx) => {
      const params = columns.map((k) => (item.hasOwnProperty(k) ? item[k] : null));
      console.log(`#${idx + 1}:`, params);
    });
    console.log(`Total registros en payload: ${payload.length}`);
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    let inserted = 0;
    for (const item of payload) {
      const params = columns.map((k) => (item.hasOwnProperty(k) ? item[k] : null));
      await conn.query(sql, params);
      inserted += 1;
    }

    await conn.commit();
    console.log(`OK: ${inserted} registros insertados/actualizados en la tabla '${tableName}'.`);
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error durante la inserción:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
