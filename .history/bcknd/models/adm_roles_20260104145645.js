const BaseModel = require("../models/BaseModel");

class AdmRoles extends BaseModel {
  static get tableName() {
    return "adm_roles";
  }
  static get primaryKey() {
    return "id_rol";
  }
  static async findById(id_rol) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_roles WHERE id_rol = ?",
      [id_rol]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_roles WHERE activo = 1 ORDER BY 1 DESC"
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
        "SELECT * FROM adm_roles " + whereSql + " " + orderSql,
        vals
      );
      return rows;
    }
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_roles " +
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
      "SELECT COUNT(*) as total FROM adm_roles " + whereSql,
      vals
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => data[k]);
    const sql =
      "INSERT INTO adm_roles (" +
      keys.join(",") +
      ") VALUES (" +
      keys.map((_) => "?").join(",") +
      ")";
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_rol, data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map((k) => k + " = ?").join(", ");
    const vals = keys.map((k) => data[k]);
    await BaseModel.query(
      "UPDATE adm_roles SET " + setSql + " WHERE id_rol = ?",
      vals.concat([id_rol])
    );
  }

  static async delete(id_rol) {
    await BaseModel.query("DELETE FROM adm_roles WHERE id_rol = ?", [id_rol]);
  }

  static async softDelete(id_rol) {
    await BaseModel.query("UPDATE adm_roles SET activo = 0 WHERE id_rol = ?", [
      id_rol,
    ]);
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
      "SELECT * FROM adm_roles " + whereSql,
      vals
    );
    return rows;
  }
}

module.exports = AdmRoles;

// Compatibilidad: nombres en español usados por controladores
AdmRoles.obtenerPorId = function (id) {
  return AdmRoles.findById(id);
};

AdmRoles.obtenerPorNombre = async function (nombre) {
  if (!nombre) return null;
  const rows = await AdmRoles.findBy({ nombre });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

AdmRoles.crear = function (data) {
  return AdmRoles.create(data);
};

AdmRoles.actualizar = function (id, data) {
  return AdmRoles.update(id, data);
};

AdmRoles.eliminar = function (id) {
  return AdmRoles.delete(id);
};

AdmRoles.obtenerPermisos = async function (id_rol) {
  const [rows] = await BaseModel.query(
    `SELECT p.* FROM adm_permisos p JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso WHERE rp.id_rol = ? AND rp.activo = 1 AND p.activo = 1`,
    [id_rol]
  );
  return rows || [];
};

AdmRoles.obtenerUsuarios = async function (id_rol) {
  const [rows] = await BaseModel.query(
    `SELECT u.* FROM adm_usuarios u JOIN adm_usuarios_roles ur ON ur.id_usuario = u.id_usuario WHERE ur.id_rol = ? AND ur.activo = 1 AND u.activo = 1`,
    [id_rol]
  );
  return rows || [];
};

AdmRoles.sincronizarPermisos = async function (id_rol, permisos = []) {
  const AdmRolesPermisos = require("./adm_roles_permisos");
  const desired = Array.isArray(permisos) ? permisos.map((p) => Number(p)) : [];
  const existing = await AdmRolesPermisos.findBy({ id_rol });
  const existingActive = Array.isArray(existing)
    ? existing.filter((r) => r.activo === 1)
    : [];
  const existingPermIds = existingActive.map((r) => Number(r.id_permiso));

  const toAdd = desired.filter((p) => !existingPermIds.includes(Number(p)));
  const toDeactivate = existingActive.filter(
    (r) => !desired.includes(Number(r.id_permiso))
  );

  for (const rel of toDeactivate) {
    try {
      await AdmRolesPermisos.update(rel.id_rol_permiso, { activo: 0 });
    } catch (e) {
      console.error("[sincronizarPermisos] error deactivating relation", e);
    }
  }
  for (const permId of toAdd) {
    try {
      await AdmRolesPermisos.create({
        id_rol,
        id_permiso: Number(permId),
        activo: 1,
      });
    } catch (e) {
      console.error("[sincronizarPermisos] error creating relation", e);
    }
  }
};
