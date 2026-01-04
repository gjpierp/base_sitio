/**
 * Modelo: adm_temas.js
 * Propósito: Persistencia para temas (visual themes). Maneja serialización
 * y sanitización de `css_vars` (almacenados como JSON en la columna correspondiente).
 * Métodos: findAll(publicOnly), findByClave, create, update, delete.
 */
const db = require("../database/config");

class AdmTemas {
  static async findAll(publicoOnly = true) {
    const sql = publicoOnly
      ? "SELECT * FROM adm_temas WHERE activo = 1 AND publico = 1 ORDER BY nombre"
      : "SELECT * FROM adm_temas ORDER BY nombre";
    const [rows] = await db.query(sql);
    return rows.map((r) => ({
      ...r,
      css_vars: AdmTemas._parseCssVars(r.css_vars),
    }));
  }

  static async findByClave(clave) {
    const [rows] = await db.query(
      "SELECT * FROM adm_temas WHERE clave = ? LIMIT 1",
      [clave]
    );
    const row = rows[0] || null;
    if (!row) return null;
    row.css_vars = AdmTemas._parseCssVars(row.css_vars);
    return row;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre",
    sortDir = "ASC",
    publicoOnly = true
  ) {
    const allowed = ["id_tema", "clave", "nombre", "tipo", "activo", "publico"];
    const col = allowed.includes(sortColumn) ? sortColumn : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    const baseWhere = publicoOnly ? "WHERE activo = 1 AND publico = 1" : "";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_temas ${baseWhere} ORDER BY ${col} ${dir}`
      );
      return rows.map((r) => ({
        ...r,
        css_vars: AdmTemas._parseCssVars(r.css_vars),
      }));
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_temas ${baseWhere} ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows.map((r) => ({
      ...r,
      css_vars: AdmTemas._parseCssVars(r.css_vars),
    }));
  }

  static async contar(publicoOnly = true) {
    const baseWhere = publicoOnly ? "WHERE activo = 1 AND publico = 1" : "";
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM adm_temas ${baseWhere}`
    );
    return rows[0]?.total || 0;
  }

  static _parseCssVars(raw) {
    if (!raw && raw !== 0) return {};
    // If already an object (mysql driver may return JSON fields as objects)
    if (typeof raw === "object" && !Array.isArray(raw)) return raw;
    // If it's a string, try to parse as JSON; tolerate malformed values
    if (typeof raw === "string") {
      try {
        // Trim to avoid accidental whitespace
        const s = raw.trim();
        // Fast path for empty string
        if (s.length === 0) return {};
        // If string obviously not JSON (e.g. "[object Object]") or doesn't start
        // with a JSON character, avoid JSON.parse which throws.
        if (
          s.includes("[object Object]") ||
          (!s.startsWith("{") && !s.startsWith("["))
        ) {
          return {};
        }
        return JSON.parse(s);
      } catch (err) {
        // Parsing failed for unexpected JSON; return empty safe object
        return {};
      }
    }
    // Anything else -> empty
    return {};
  }

  static _sanitizeCssVars(cssVars) {
    if (!cssVars || typeof cssVars !== "object" || Array.isArray(cssVars))
      return {};
    const clean = {};
    const nameRe = /^--[a-zA-Z0-9\-_]+$/;
    for (const k of Object.keys(cssVars)) {
      const v = cssVars[k];
      if (typeof k !== "string") continue;
      if (!nameRe.test(k)) continue;
      if (typeof v !== "string") continue;
      const trimmed = v.trim();
      if (trimmed.length === 0 || trimmed.length > 200) continue;
      if (/[<>]/.test(trimmed)) continue;
      clean[k] = trimmed;
    }
    return clean;
  }

  static async create(data) {
    const cleanVars = AdmTemas._sanitizeCssVars(data.css_vars ?? {});
    const sql = `INSERT INTO adm_temas (clave, nombre, descripcion, tipo, css_vars, preview, activo, publico, id_usuario, creado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const vals = [
      data.clave,
      data.nombre,
      data.descripcion ?? null,
      data.tipo ?? "custom",
      JSON.stringify(cleanVars),
      data.preview ?? null,
      typeof data.activo !== "undefined" ? data.activo : 1,
      typeof data.publico !== "undefined" ? data.publico : 1,
      data.id_usuario ?? null,
      data.creado_por ?? null,
    ];
    const [res] = await db.query(sql, vals);
    return res.insertId;
  }

  static async update(id_tema, payload = {}) {
    const allowed = [
      "nombre",
      "descripcion",
      "tipo",
      "css_vars",
      "preview",
      "activo",
      "publico",
      "actualizado_por",
    ];
    const fields = Object.keys(payload).filter((k) => allowed.includes(k));
    if (!fields.length) return;
    const set = fields.map((f) => `${f} = ?`).join(", ");
    const vals = fields.map((f) =>
      f === "css_vars"
        ? JSON.stringify(AdmTemas._sanitizeCssVars(payload[f]))
        : payload[f]
    );
    vals.push(id_tema);
    const sql = `UPDATE adm_temas SET ${set}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_tema = ?`;
    await db.query(sql, vals);
  }

  static async delete(id_tema) {
    await db.query("DELETE FROM adm_temas WHERE id_tema = ?", [id_tema]);
  }
}

module.exports = AdmTemas;
