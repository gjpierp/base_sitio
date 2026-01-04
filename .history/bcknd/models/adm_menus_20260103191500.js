// Modelo generado automáticamente - estandarizado
const BaseModel = require("../models/BaseModel");

class AdmMenus extends BaseModel {
  static async findById(id_menu) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus WHERE id_menu = ?",
      [id_menu]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus  ORDER BY 1 DESC"
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
    const baseWhere = null;
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
        "SELECT * FROM adm_menus " + whereSql + " " + orderSql,
        vals
      );
      return rows;
    }
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_menus " +
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
    if (false) where.unshift("activo = 1");
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query(
      "SELECT COUNT(*) as total FROM adm_menus " + whereSql,
      vals
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => data[k]);
    const sql =
      "INSERT INTO adm_menus (" +
      keys.join(",") +
      ") VALUES (" +
      keys.map((_) => "?").join(",") +
      ")";
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_menu, data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map((k) => k + " = ?").join(", ");
    const vals = keys.map((k) => data[k]);
    await BaseModel.query(
      "UPDATE adm_menus SET " + setSql + " WHERE id_menu = ?",
      vals.concat([id_menu])
    );
  }

  static async delete(id_menu) {
    await BaseModel.query("DELETE FROM adm_menus WHERE id_menu = ?", [id_menu]);
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
      "SELECT * FROM adm_menus " + whereSql,
      vals
    );
    return rows;
  }
}

module.exports = AdmMenus;

// Compatibilidad: helpers esperados por controladores
AdmMenus.obtenerPermisos = async function (id_menu, db) {
  // Delegamos a adm_menus_permisos
  const AdmMenuPermiso = require("./adm_menus_permisos");
  return AdmMenuPermiso.obtenerPermisos(id_menu);
};

AdmMenus.existsByNombre = async function (nombre, excludeId) {
  const [rows] = await require("./BaseModel").query(
    "SELECT 1 FROM adm_menus WHERE nombre = ?" +
      (excludeId ? " AND id_menu != ?" : " LIMIT 1"),
    excludeId ? [nombre, excludeId] : [nombre]
  );
  return Array.isArray(rows) ? rows.length > 0 : !!rows;
};

AdmMenus.existsByUrl = async function (url, excludeId) {
  const [rows] = await require("./BaseModel").query(
    "SELECT 1 FROM adm_menus WHERE url = ?" +
      (excludeId ? " AND id_menu != ?" : " LIMIT 1"),
    excludeId ? [url, excludeId] : [url]
  );
  return Array.isArray(rows) ? rows.length > 0 : !!rows;
};

AdmMenus.findByIds = async function (ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await require("./BaseModel").query(
    `SELECT * FROM adm_menus WHERE id_menu IN (${placeholders})`,
    ids
  );
  return rows;
};

// Obtener jerarquía simple: hijos directos
AdmMenus.obtenerJerarquia = async function (id_menu) {
  const [rows] = await require("./BaseModel").query(
    "SELECT * FROM adm_menus WHERE id_menu_padre = ?",
    [id_menu]
  );
  return rows || [];
};

// Construcción del árbol de menús.
// Filtra menús por su estado/visibilidad antes de construir el árbol.
// id_usuario actualmente no filtra por permisos específicos, pero se acepta
// para compatibilidad y en el futuro puede usarse para filtrar por permisos.
AdmMenus.buildUserMenuTree = async function (id_usuario = null) {
  const menus = (await AdmMenus.listar(0, 1000, "orden", "ASC")) || [];

  // Filtrar según estado/visibilidad si las columnas existen
  const filtered = menus.filter((m) => {
    try {
      // Si existe la columna `activo`, incluir sólo activo==1
      if (typeof m.activo !== 'undefined' && Number(m.activo) !== 1) return false;
      // Si existe la columna `visible`, incluir sólo visible==1
      if (typeof m.visible !== 'undefined' && Number(m.visible) !== 1) return false;
    } catch (e) {
      // En caso de error, no bloquear la inclusión
    }
    return true;
  });

  // Construir mapa por id_menu
  const map = {};
  for (const item of filtered) {
    const id = item.id_menu ?? item.id ?? item.ID;
    map[id] = { ...item, hijos: [] };
  }

  const roots = [];
  for (const idStr of Object.keys(map)) {
    const node = map[idStr];
    const parentId = node.id_menu_padre ?? node.id_padre ?? node.parent_id ?? null;
    if (parentId && map[parentId]) {
      map[parentId].hijos.push(node);
    } else {
      roots.push(node);
    }
  }

  // Ordenar hijos por 'orden' si existe
  const sortChildren = (arr) => {
    arr.sort((a, b) => (Number(a.orden || 0) - Number(b.orden || 0)));
    for (const it of arr) if (Array.isArray(it.hijos) && it.hijos.length) sortChildren(it.hijos);
  };
  sortChildren(roots);

  return roots;
};
