const BaseModel = require("../models/BaseModel");

class AdmMenusPermisos extends BaseModel {
  static get tableName() {
    return "adm_menus_permisos";
  }
  static get primaryKey() {
    return "id_menu_permiso";
  }
  static async findById(id_menu_permiso) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus_permisos WHERE id_menu_permiso = ?",
      [id_menu_permiso]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus_permisos WHERE activo = 1 ORDER BY 1 DESC"
    );
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = null,
    sortDir = "ASC",
    filters = {}
  ) {
    const where = [];
    const vals = [];
    if (filters && typeof filters === "object") {
      for (const k of Object.keys(filters)) {
        const v = filters[k];
        if (v === undefined || v === null) continue;
        where.push(`${k} = ?`);
        vals.push(v);
      }
    }
    const baseWhere = "activo = 1";
    const whereParts = [];
    if (baseWhere) whereParts.push(baseWhere);
    if (where.length) whereParts.push(...where);
    const whereSql = whereParts.length
      ? "WHERE " + whereParts.join(" AND ")
      : "";
    const dir =
      String(sortDir || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const orderSql = sortColumn ? "ORDER BY " + sortColumn + " " + dir : "";
    if (typeof desde === "undefined" || typeof limite === "undefined") {
      const [rows] = await BaseModel.query(
        "SELECT * FROM adm_menus_permisos " + whereSql + " " + orderSql,
        vals
      );
      return rows;
    }
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus_permisos " +
        whereSql +
        " " +
        orderSql +
        " LIMIT ? OFFSET ?",
      vals.concat([limite, desde])
    );
    return rows;
  }

  static async contar(filters = {}) {
    const where = [];
    const vals = [];
    if (filters && typeof filters === "object") {
      for (const k of Object.keys(filters)) {
        const v = filters[k];
        if (v === undefined || v === null) continue;
        where.push(`${k} = ?`);
        vals.push(v);
      }
    }
    if (true) where.unshift("activo = 1");
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query(
      "SELECT COUNT(*) as total FROM adm_menus_permisos " + whereSql,
      vals
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => data[k]);
    const sql =
      "INSERT INTO adm_menus_permisos (" +
      keys.join(",") +
      ") VALUES (" +
      keys.map((_) => "?").join(",") +
      ")";
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_menu_permiso, data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map((k) => k + " = ?").join(", ");
    const vals = keys.map((k) => data[k]);
    await BaseModel.query(
      "UPDATE adm_menus_permisos SET " + setSql + " WHERE id_menu_permiso = ?",
      vals.concat([id_menu_permiso])
    );
  }

  static async delete(id_menu_permiso) {
    await BaseModel.query(
      "DELETE FROM adm_menus_permisos WHERE id_menu_permiso = ?",
      [id_menu_permiso]
    );
  }

  static async softDelete(id_menu_permiso) {
    await BaseModel.query(
      "UPDATE adm_menus_permisos SET activo = 0 WHERE id_menu_permiso = ?",
      [id_menu_permiso]
    );
  }

  static async findBy(filters = {}) {
    const where = [];
    const vals = [];
    for (const k of Object.keys(filters || {})) {
      if (filters[k] === undefined || filters[k] === null) continue;
      where.push(k + " = ?");
      vals.push(filters[k]);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus_permisos " + whereSql,
      vals
    );
    return rows;
  }
}

module.exports = AdmMenusPermisos;

// Compatibilidad
AdmMenusPermisos.obtenerPermisos = async function (id_menu) {
  const [rows] = await require("../models/BaseModel").query(
    "SELECT p.* FROM adm_permisos p JOIN adm_menus_permisos mp ON mp.id_permiso = p.id_permiso WHERE mp.id_menu = ? AND mp.activo = 1 AND p.activo = 1",
    [id_menu]
  );
  return rows;
};

AdmMenusPermisos.deleteByMenuAndPerm = async function (id_menu, id_permiso) {
  await require("../models/BaseModel").query(
    "DELETE FROM adm_menus_permisos WHERE id_menu = ? AND id_permiso = ?",
    [id_menu, id_permiso]
  );
};
