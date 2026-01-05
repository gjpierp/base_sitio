const fs = require("fs");
const path = require("path");

// Cargar variables de entorno desde .env si existe
try {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
  // also load bcknd/.env if present (contains DB creds in this repo)
  const bckndEnv = path.resolve(__dirname, "..", "bcknd", ".env");
  if (fs.existsSync(bckndEnv)) require("dotenv").config({ path: bckndEnv });
} catch (_) {}
// If dotenv didn't populate required vars, parse bcknd/.env manually as fallback
try {
  const bckndEnvPath = path.resolve(__dirname, "..", "bcknd", ".env");
  if (fs.existsSync(bckndEnvPath)) {
    const raw = fs.readFileSync(bckndEnvPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // remove surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {
  // ignore
}
const { dbVvff, dbAdmin, getPool } = require("../bcknd/database/connections");

const entitiesDir = path.resolve(
  __dirname,
  "..",
  "bcknd",
  "entities",
  "db_vvff_admin"
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function introspect(pool, dbName) {
  const conn = pool;
  // Query tables
  const [tables] = await conn.query(
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
    [dbName]
  );

  const report = [];
  for (const t of tables) {
    const table = t.TABLE_NAME;
    // columns
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
      [dbName, table]
    );

    // primary keys
    const [pkRows] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY' ORDER BY ORDINAL_POSITION`,
      [dbName, table]
    );

    // keys
    const [keyRows] = await conn.query(
      `SELECT CONSTRAINT_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY ORDINAL_POSITION SEPARATOR ',') AS cols
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME <> 'PRIMARY'
       GROUP BY CONSTRAINT_NAME`,
      [dbName, table]
    );

    // foreign keys
    const [fkRows] = await conn.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [dbName, table]
    );

    const columns = cols.map((c) => ({
      name: c.COLUMN_NAME,
      type: c.COLUMN_TYPE,
      nullable: c.IS_NULLABLE === "YES",
      default: c.COLUMN_DEFAULT === null ? undefined : c.COLUMN_DEFAULT,
      auto_increment: (c.EXTRA || "").toLowerCase().includes("auto_increment"),
      comment: c.COLUMN_COMMENT || undefined,
    }));

    const primaryKey = (pkRows || []).map((r) => r.COLUMN_NAME);

    const keys = {};
    for (const k of keyRows || []) {
      keys[k.CONSTRAINT_NAME] = (k.cols || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const foreignKeys = [];
    for (const fk of fkRows || []) {
      foreignKeys.push({
        constraint: fk.CONSTRAINT_NAME,
        columns: [fk.COLUMN_NAME],
        referencedTable: fk.REFERENCED_TABLE_NAME,
        referencedColumns: [fk.REFERENCED_COLUMN_NAME],
      });
    }

    const entity = {
      table,
      columns,
      primaryKey,
      uniqueKeys: {},
      keys,
      foreignKeys,
    };

    const outPath = path.join(entitiesDir, `${table}.json`);
    let changed = true;
    if (fs.existsSync(outPath)) {
      const existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
      const existCols = (existing.columns || []).map((c) => c.name).join(",");
      const newCols = columns.map((c) => c.name).join(",");
      changed = existCols !== newCols;
    }
    if (changed)
      fs.writeFileSync(outPath, JSON.stringify(entity, null, 2), "utf8");

    report.push({ table, status: changed ? "created/updated" : "skipped" });
  }

  return report;
}

async function run() {
  ensureDir(entitiesDir);

  // pick pool and dbName
  const candidates = [];
  if (dbVvff) candidates.push({ pool: dbVvff, name: process.env.VVFF_DB_NAME });
  if (dbAdmin)
    candidates.push({ pool: dbAdmin, name: process.env.ADMS_DB_NAME });
  try {
    const defaultPool = getPool("admin");
    candidates.push({ pool: defaultPool, name: process.env.ADMS_DB_NAME });
  } catch {}

  // prefer explicit env DB name
  let chosen = candidates.find((c) => c.name && c.pool);
  if (!chosen) chosen = candidates.find((c) => c.pool) || null;

  if (!chosen || !chosen.pool) {
    console.error(
      "No hay una conexión MySQL disponible. Configure VVFF_DB_* o ADMS_DB_* en el entorno."
    );
    process.exit(1);
  }
  // Debug: mostrar variables de entorno relevantes y estado de candidate
  console.log("ENV ADMS_DB_NAME=", process.env.ADMS_DB_NAME);
  console.log("ENV VVFF_DB_NAME=", process.env.VVFF_DB_NAME);
  try {
    console.log(
      "Candidates:",
      candidates.map((c) => ({ name: c.name, hasPool: !!c.pool }))
    );
  } catch (e) {}

  const dbName =
    chosen.name ||
    (chosen.pool &&
      chosen.pool.config &&
      chosen.pool.config.connectionConfig &&
      chosen.pool.config.connectionConfig.database) ||
    null;
  if (!dbName) {
    console.error(
      "No se pudo determinar el nombre de la base de datos. Exporta VVFF_DB_NAME o ADMS_DB_NAME."
    );
    process.exit(1);
  }

  console.log("Usando DB:", dbName);
  try {
    const report = await introspect(chosen.pool, dbName);
    console.log("Report:");
    console.table(report);
  } catch (err) {
    console.error("Error al introspectar la BD:", err.message || err);
    process.exit(1);
  }
}

if (require.main === module) run();
