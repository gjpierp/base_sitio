// Cargar variables desde bcknd/.env sin depender de 'dotenv'
const fs = require("fs");
const path = require("path");
const envPath = path.resolve(__dirname, "..", "bcknd", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) return;
    let [, key, val] = m;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}
const mysql = require("mysql2/promise");

async function main() {
  const host = process.env.VVFF_DB_HOST;
  const port = process.env.VVFF_DB_PORT || 3306;
  const user = process.env.VVFF_DB_USER;
  const password = process.env.VVFF_DB_PASSWORD;
  const database = process.env.VVFF_DB_NAME;

  if (!host || !user || !database) {
    console.error("Variables VVFF_DB_* no configuradas en bcknd/.env");
    process.exit(1);
  }

  const outDir = path.resolve(__dirname, "..", "bcknd", "entities", database);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pool = mysql.createPool({
    host,
    port: Number(port),
    user,
    password,
    database,
  });

  try {
    console.log("Conectando a", host, "database", database);
    const [tablesRows] = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
      [database]
    );
    const tables = tablesRows.map(
      (r) => r.TABLE_NAME || r.table_name || Object.values(r)[0]
    );
    for (const t of tables) {
      const [cols] = await pool.query(
        `SELECT column_name, column_type, is_nullable, column_default, extra, column_comment, ordinal_position FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position`,
        [database, t]
      );
      const columns = cols.map((c) => ({
        name: c.COLUMN_NAME || c.column_name,
        type: c.COLUMN_TYPE || c.column_type,
        nullable: (c.IS_NULLABLE || c.is_nullable) === "YES",
        default: c.COLUMN_DEFAULT === null ? undefined : c.COLUMN_DEFAULT,
        auto_increment: (c.EXTRA || c.extra || "")
          .toLowerCase()
          .includes("auto_increment"),
        comment: c.COLUMN_COMMENT || c.column_comment || undefined,
      }));

      const [keysRows] = await pool.query(
        `SELECT k.constraint_name, k.column_name, tc.constraint_type
         FROM information_schema.key_column_usage k
         JOIN information_schema.table_constraints tc
           ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema AND k.table_name = tc.table_name
         WHERE k.table_schema = ? AND k.table_name = ?`,
        [database, t]
      );
      const primaryKey = [];
      const uniqueKeys = {};
      const keys = {};
      for (const r of keysRows) {
        const cName =
          r.COLUMN_NAME || r.column_name || Object.values(r).find(Boolean);
        const cType = r.constraint_type || r.CONSTRAINT_TYPE;
        const cname = r.constraint_name || r.CONSTRAINT_NAME;
        if ((cType || "").toUpperCase() === "PRIMARY KEY")
          primaryKey.push(cName);
        else if ((cType || "").toUpperCase() === "UNIQUE") {
          uniqueKeys[cname] = uniqueKeys[cname] || [];
          uniqueKeys[cname].push(cName);
        } else {
          keys[cname] = keys[cname] || [];
          keys[cname].push(cName);
        }
      }

      const [fksRows] = await pool.query(
        `SELECT rc.constraint_name, kcu.column_name, kcu.referenced_table_name, kcu.referenced_column_name
         FROM information_schema.referential_constraints rc
         JOIN information_schema.key_column_usage kcu
           ON rc.constraint_name = kcu.constraint_name AND rc.constraint_schema = kcu.constraint_schema
         WHERE rc.constraint_schema = ? AND kcu.table_name = ?`,
        [database, t]
      );
      const fkMap = {};
      for (const r of fksRows) {
        const cname = r.CONSTRAINT_NAME || r.constraint_name;
        fkMap[cname] = fkMap[cname] || {
          constraint: cname,
          columns: [],
          referencedTable: null,
          referencedColumns: [],
        };
        fkMap[cname].columns.push(r.COLUMN_NAME || r.column_name);
        fkMap[cname].referencedTable =
          r.REFERENCED_TABLE_NAME || r.referenced_table_name;
        fkMap[cname].referencedColumns.push(
          r.REFERENCED_COLUMN_NAME || r.referenced_column_name
        );
      }

      const out = {
        table: t,
        columns,
        primaryKey,
        uniqueKeys,
        keys,
        foreignKeys: Object.values(fkMap),
      };
      const outFile = path.join(outDir, t + ".json");
      fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
      console.log("  • Generado", outFile);
    }
    console.log("Generación completa en", outDir);
    process.exit(0);
  } catch (err) {
    console.error(
      "Error generando entidades:",
      err && err.message ? err.message : err
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
