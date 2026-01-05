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
  lines.push("const BaseModel = require('../models/BaseModel');");
  lines.push("");
  lines.push("class " + cls + " extends BaseModel {");

  // findById

  // findByClave helper when entity has 'clave' column
  if (entity.columns.some((c) => c.name === "clave")) {
    lines.push("  static async findByClave(clave) {");
    if (hasAct) {
      lines.push(
        "    const [rows] = await BaseModel.query('SELECT * FROM " +
          table +
          " WHERE clave = ? AND activo = 1', [clave]);"
      );
    } else {
      lines.push(
        "    const [rows] = await BaseModel.query('SELECT * FROM " +
          table +
          " WHERE clave = ?', [clave]);"
      );
    }
    lines.push("    return rows[0] || null;");
    lines.push("  }");
    lines.push("");
  }

  // Compatibility helpers for adm_usuarios: obtenerRoles, obtenerPermisos, tieneRol
  if (table === "adm_usuarios") {
    lines.push("  static async obtenerRoles(id_usuario) {");
    lines.push(
      "    const [rows] = await BaseModel.query('SELECT r.* FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND r.activo = 1', [id_usuario]);"
    );
    lines.push("    return rows;");
    lines.push("  }");
    lines.push("");

    lines.push("  static async obtenerPermisos(id_usuario) {");
    lines.push(
      "    const [rows] = await BaseModel.query('SELECT DISTINCT p.* FROM adm_permisos p JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso JOIN adm_usuarios_roles ur ON ur.id_rol = rp.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND rp.activo = 1 AND p.activo = 1', [id_usuario]);"
    );
    lines.push("    return rows;");
    lines.push("  }");
    lines.push("");

    lines.push("  static async tieneRol(id_usuario, rolNombre) {");
    lines.push(
      "    const [rows] = await BaseModel.query('SELECT 1 FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND r.nombre = ? LIMIT 1', [id_usuario, rolNombre]);"
    );
    lines.push("    return Array.isArray(rows) && rows.length > 0;");
    lines.push("  }");
    lines.push("");
  }
  lines.push("  static async findById(" + idcol + ") {");
  lines.push(
    "    const [rows] = await BaseModel.query('SELECT * FROM " +
      table +
      " WHERE " +
      idcol +
      " = ?', [" +
      idcol +
      "]);"
  );
  lines.push("    return rows[0] || null;");
  lines.push("  }");
  lines.push("");

  // findAll
  lines.push("  static async findAll() {");
  const _baseWhere = hasAct ? "WHERE activo = 1" : "";
  lines.push(
    "    const [rows] = await BaseModel.query('SELECT * FROM " +
      table +
      " " +
      _baseWhere +
      " ORDER BY 1 DESC');"
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
  lines.push(
    "    const baseWhere = " + (hasAct ? "'activo = 1'" : "null") + ";"
  );
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
    '    const orderSql = sortColumn ? "ORDER BY " + sortColumn + " " + dir : "";'
  );
  lines.push(
    '    if (typeof desde === "undefined" || typeof limite === "undefined") {'
  );
  lines.push(
    "      const [rows] = await BaseModel.query('SELECT * FROM " +
      table +
      " ' + whereSql + ' ' + orderSql , vals);"
  );
  lines.push("      return rows;");
  lines.push("    }");
  lines.push(
    "    const [rows] = await BaseModel.query('SELECT * FROM " +
      table +
      " ' + whereSql + ' ' + orderSql + ' LIMIT ? OFFSET ?', vals.concat([limite, desde]));"
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
  lines.push(
    "    if (" + (hasAct ? "true" : "false") + ") where.unshift('activo = 1');"
  );
  lines.push(
    '    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";'
  );
  lines.push(
    "    const [rows] = await BaseModel.query('SELECT COUNT(*) as total FROM " +
      table +
      " ' + whereSql, vals);"
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
    "    const sql = 'INSERT INTO " +
      table +
      " (' + keys.join(',') + ') VALUES (' + keys.map(_=>'?').join(',') + ')';"
  );
  lines.push("    const [res] = await BaseModel.query(sql, vals);");
  lines.push("    return res.insertId;");
  lines.push("  }");
  lines.push("");

  // update
  lines.push("  static async update(" + idcol + ", data) {");
  lines.push(
    "    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);"
  );
  lines.push("    if (!keys.length) return;");
  lines.push('    const setSql = keys.map(k=>k + " = ?").join(", ");');
  lines.push("    const vals = keys.map(k=>data[k]);");
  lines.push(
    "    await BaseModel.query('UPDATE " +
      table +
      " SET ' + setSql + ' WHERE " +
      idcol +
      " = ?', vals.concat([" +
      idcol +
      "]));"
  );
  lines.push("  }");
  lines.push("");

  // delete
  lines.push("  static async delete(" + idcol + ") {");
  lines.push(
    "    await BaseModel.query('DELETE FROM " +
      table +
      " WHERE " +
      idcol +
      " = ?', [" +
      idcol +
      "]); "
  );
  lines.push("  }");
  lines.push("");

  // softDelete if activo
  if (hasAct) {
    lines.push("  static async softDelete(" + idcol + ") {");
    lines.push(
      "    await BaseModel.query('UPDATE " +
        table +
        " SET activo = 0 WHERE " +
        idcol +
        " = ?', [" +
        idcol +
        "]); "
    );
    lines.push("  }");
    lines.push("");
  }

  // findBy (generic by fields)
  lines.push("  static async findBy(filters = {}) {");
  lines.push("    const where = [];");
  lines.push("    const vals = [];");
  lines.push(
    "    for (const k of Object.keys(filters || {})) { if (filters[k] === undefined || filters[k] === null) continue; where.push(k + ' = ?'); vals.push(filters[k]); }"
  );
  lines.push(
    '    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";'
  );
  lines.push(
    "    const [rows] = await BaseModel.query('SELECT * FROM " +
      table +
      " ' + whereSql, vals);"
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
    // Agregar cabecera con timestamp y evitar reescribir si no hay cambios
    const header = `// Modelo generado automáticamente - NO editar si desea preservar cambios manuales.\n// Generado: ${new Date().toISOString()}\n`;
    const finalCode = header + modelCode;
    if (fs.existsSync(outFile)) {
      const existing = fs.readFileSync(outFile, "utf8");
      if (existing === finalCode) {
        console.log("Unchanged, skip:", outFile);
        continue;
      }
    }
    fs.writeFileSync(outFile, finalCode, "utf8");
    console.log("Generated", outFile);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
