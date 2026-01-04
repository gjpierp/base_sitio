// Generador de modelos estándar desde archivos JSON de entidades
const fs = require("fs");
const path = require("path");

function toPascal(s) {
  return s
    .split(/_|\-|\./)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function classNameFromTable(t) {
  return toPascal(t);
}

function detectIdColumn(entity) {
  if (entity.primaryKey && entity.primaryKey.length)
    return entity.primaryKey[0];
  const c = entity.columns.find((x) => /(^id_|_id$)/i.test(x.name));
  return c ? c.name : entity.columns[0].name;
}

function hasActivo(entity) {
  return entity.columns.some((c) => c.name === "activo");
}

function relevantSearchFields(entity) {
  const names = entity.columns.map((c) => c.name.toLowerCase());
  const prefer = [
    "nombre",
    "codigo",
    "correo",
    "correo_electronico",
    "email",
    "dominio",
    "url",
    "host",
  ];
  return prefer.filter((p) => names.includes(p));
}

function generateModel(entity) {
  const table = entity.table;
  const cls = classNameFromTable(table);
  const idcol = detectIdColumn(entity);
  const hasAct = hasActivo(entity);
  const searchFields = relevantSearchFields(entity);

  const lines = [];
  lines.push("// Modelo generado automáticamente - estandarizado");
  lines.push("const db = require('../database/config');");
  lines.push("");
  lines.push(`class ${cls} {`);

  // findById
  lines.push(`  static async findById(${idcol}) {`);
  lines.push(
    `    const [rows] = await db.query('SELECT * FROM ${table} WHERE ${idcol} = ?', [${idcol}]);`
  );
  lines.push("    return rows[0] || null;");
  lines.push("  }");
  lines.push("");

  // findAll
  lines.push("  static async findAll() {");
  lines.push(
    `    const [rows] = await db.query('SELECT * FROM ${table} ${
      hasAct ? "WHERE activo = 1" : ""
    } ORDER BY 1 DESC');`
  );
  lines.push("    return rows;");
  lines.push("  }");
  lines.push("");

  // listar (paginación)
  lines.push(
    '  static async listar(desde = 0, limite = 10, sortColumn = null, sortDir = "ASC", filters = {}) {'
  );
  lines.push("    const where = [];");
  lines.push("    const vals = [];");
  lines.push('    if (filters && typeof filters === "object") {');
  lines.push("      for (const k of Object.keys(filters)) {");
  lines.push("        const v = filters[k];");
  lines.push("        if (v === undefined || v === null) continue;");
  lines.push("        where.push(`${k} = ?`);");
  lines.push("        vals.push(v);");
  lines.push("      }");
  lines.push("    }");
  lines.push(`    const baseWhere = ${hasAct} ? 'activo = 1' : null;`);
  lines.push("    const whereParts = [];");
  lines.push("    if (baseWhere) whereParts.push(baseWhere);");
  lines.push("    if (where.length) whereParts.push(...where);");
  lines.push(
    '    const whereSql = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";'
  );
  lines.push(
    '    const dir = (String(sortDir || "ASC").toUpperCase() === "DESC") ? "DESC" : "ASC";'
  );
  lines.push(
    '    const orderSql = sortColumn ? `ORDER BY ${sortColumn} ${dir}` : "";'
  );
  lines.push(
    '    if (typeof desde === "undefined" || typeof limite === "undefined") {'
  );
  lines.push(
    "      const [rows] = await db.query(`SELECT * FROM ${table} ${whereSql} ${orderSql}` , vals);"
  );
  lines.push("      return rows;");
  lines.push("    }");
  lines.push(
    "    const [rows] = await db.query(`SELECT * FROM ${table} ${whereSql} ${orderSql} LIMIT ? OFFSET ?`, vals.concat([limite, desde]));"
  );
  lines.push("    return rows;");
  lines.push("  }");
  lines.push("");

  // contar
  lines.push("  static async contar(filters = {}) {");
  lines.push("    const where = [];");
  lines.push("    const vals = [];");
  lines.push('    if (filters && typeof filters === "object") {');
  lines.push("      for (const k of Object.keys(filters)) {");
  lines.push("        const v = filters[k];");
  lines.push("        if (v === undefined || v === null) continue;");
  lines.push("        where.push(`${k} = ?`);");
  lines.push("        vals.push(v);");
  lines.push("      }");
  lines.push("    }");
  lines.push(`    if (${hasAct}) where.unshift('activo = 1');`);
  lines.push(
    '    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";'
  );
  lines.push(
    "    const [rows] = await db.query(`SELECT COUNT(*) as total FROM ${table} ${whereSql}`, vals);"
  );
  lines.push("    return rows[0]?.total || 0;");
  lines.push("  }");
  lines.push("");

  // create
  lines.push("  static async create(data) {");
  lines.push(
    "    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);"
  );
  lines.push("    const vals = keys.map(k=>data[k]);");
  lines.push(
    '    const sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(_=>"?").join(",")})`;'
  );
  lines.push("    const [res] = await db.query(sql, vals);");
  lines.push("    return res.insertId;");
  lines.push("  }");
  lines.push("");

  // update
  lines.push(`  static async update(${idcol}, data) {`);
  lines.push(
    "    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);"
  );
  lines.push("    if (!keys.length) return;");
  lines.push('    const setSql = keys.map(k=>`${k} = ?`).join(", ");');
  lines.push("    const vals = keys.map(k=>data[k]);");
  lines.push(
    "    await db.query('UPDATE ${table} SET ' + setSql + ' WHERE ${idcol} = ?', vals.concat([${idcol}]));"
  );
  lines.push("  }");
  lines.push("");

  // delete
  lines.push(`  static async delete(${idcol}) {`);
  lines.push(
    `    await db.query('DELETE FROM ${table} WHERE ${idcol} = ?', [${idcol}]);`
  );
  lines.push("  }");
  lines.push("");

  // softDelete if activo
  if (hasAct) {
    lines.push(`  static async softDelete(${idcol}) {`);
    lines.push(
      `    await db.query('UPDATE ${table} SET activo = 0 WHERE ${idcol} = ?', [${idcol}]);`
    );
    lines.push("  }");
    lines.push("");
  }

  // findBy (generic by fields)
  lines.push("  static async findBy(filters = {}) {");
  lines.push("    const where = [];");
  lines.push("    const vals = [];");
  lines.push(
    "    for (const k of Object.keys(filters || {})) { if (filters[k] === undefined || filters[k] === null) continue; where.push(`${k} = ?`); vals.push(filters[k]); }"
  );
  lines.push(
    '    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";'
  );
  lines.push(
    "    const [rows] = await db.query(`SELECT * FROM ${table} ${whereSql}`, vals);"
  );
  lines.push("    return rows;");
  lines.push("  }");

  lines.push("}");
  lines.push("");
  lines.push(`module.exports = ${cls};`);

  return lines.join("\n");
}

async function main() {
  const entitiesDir = path.resolve(
    __dirname,
    "..",
    "entities",
    "db_vvff_admin"
  );
  if (!fs.existsSync(entitiesDir)) {
    console.error("No existe carpeta de entidades:", entitiesDir);
    process.exit(1);
  }
  const files = fs.readdirSync(entitiesDir).filter((f) => f.endsWith(".json"));
  const outDir = path.resolve(__dirname, "..", "models");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const f of files) {
    const content = fs.readFileSync(path.join(entitiesDir, f), "utf8");
    let entity;
    try {
      entity = JSON.parse(content);
    } catch (e) {
      console.warn("skip", f);
      continue;
    }
    const modelCode = generateModel(entity);
    const outFile = path.join(outDir, entity.table + ".js");
    fs.writeFileSync(outFile, modelCode, "utf8");
    console.log("Generated", outFile);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
