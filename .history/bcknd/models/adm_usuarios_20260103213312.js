// Modelo generado automáticamente - estandarizado
const BaseModel = require("../models/BaseModel");

class AdmUsuarios extends BaseModel {
  static async obtenerRoles(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT r.* FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND r.activo = 1",
      [id_usuario]
    );
    return rows;
  }

  static async obtenerPermisos(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT DISTINCT p.* FROM adm_permisos p JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso JOIN adm_usuarios_roles ur ON ur.id_rol = rp.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND rp.activo = 1 AND p.activo = 1",
      [id_usuario]
    );
    return rows;
  }

  static async sincronizarRoles(id_usuario, roles = []) {
    // Normalize input
    const AdmUsuarioRol = require('./adm_usuarios_roles');
    const desired = Array.isArray(roles) ? roles.map((r) => Number(r)) : [];

    // Fetch existing relations
    const existing = await AdmUsuarioRol.findBy({ id_usuario });
    const existingActive = Array.isArray(existing) ? existing.filter((r) => r.activo == 1) : [];
    const existingRoleIds = existingActive.map((r) => Number(r.id_rol));

    // Roles to add
    const toAdd = desired.filter((r) => !existingRoleIds.includes(Number(r)));
    // Relations to deactivate (existing active roles not in desired)
    const toDeactivate = existingActive.filter((r) => !desired.includes(Number(r.id_rol)));

    // Deactivate removed roles
    for (const rel of toDeactivate) {
      try {
        await AdmUsuarioRol.update(rel.id_usuario_rol, { activo: 0 });
      } catch (e) {
        // continue on error
        console.error('[sincronizarRoles] error deactivating role relation', e);
      }
    }

    // Add missing roles
    for (const roleId of toAdd) {
      try {
        await AdmUsuarioRol.create({ id_usuario, id_rol: Number(roleId), activo: 1 });
      } catch (e) {
        console.error('[sincronizarRoles] error creating role relation', e);
      }
    }
  }

  static async tieneRol(id_usuario, rolNombre) {
    const [rows] = await BaseModel.query(
      "SELECT 1 FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND r.nombre = ? LIMIT 1",
      [id_usuario, rolNombre]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  static async findById(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE id_usuario = ?",
      [id_usuario]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE activo = 1 ORDER BY 1 DESC"
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
        "SELECT * FROM adm_usuarios " + whereSql + " " + orderSql,
        vals
      );
      return rows;
    }
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios " +
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
      "SELECT COUNT(*) as total FROM adm_usuarios " + whereSql,
      vals
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => data[k]);
    const sql =
      "INSERT INTO adm_usuarios (" +
      keys.join(",") +
      ") VALUES (" +
      keys.map((_) => "?").join(",") +
      ")";
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_usuario, data) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map((k) => k + " = ?").join(", ");
    const vals = keys.map((k) => data[k]);
    await BaseModel.query(
      "UPDATE adm_usuarios SET " + setSql + " WHERE id_usuario = ?",
      vals.concat([id_usuario])
    );
  }

  static async delete(id_usuario) {
    await BaseModel.query("DELETE FROM adm_usuarios WHERE id_usuario = ?", [
      id_usuario,
    ]);
  }

  static async softDelete(id_usuario) {
    await BaseModel.query(
      "UPDATE adm_usuarios SET activo = 0 WHERE id_usuario = ?",
      [id_usuario]
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
      "SELECT * FROM adm_usuarios " + whereSql,
      vals
    );
    return rows;
  }
}

module.exports = AdmUsuarios;

// Compatibilidad: nombres usados por controladores legacy
AdmUsuarios.obtenerPorCorreo = async function (correo) {
  if (!correo) return null;
  try {
    // Consultar por campo `correo` (columna estándar)
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    if (Array.isArray(rows) && rows.length) return rows[0];
  } catch (e) {
    // ignore and try fallback
  }
  try {
    // Fallback: intentar por nombre de usuario si existe
    const [rows2] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE nombre_usuario = ? LIMIT 1",
      [correo]
    );
    if (Array.isArray(rows2) && rows2.length) return rows2[0];
  } catch (e) {
    // ignore
  }
  return null;
};
AdmUsuarios.obtenerPorId = function (id) {
  return AdmUsuarios.findById(id);
};
AdmUsuarios.obtenerRolesPorUsuario = function (id_usuario) {
  return AdmUsuarios.obtenerRoles(id_usuario);
};
AdmUsuarios.obtenerPermisosPorUsuario = function (id_usuario) {
  return AdmUsuarios.obtenerPermisos(id_usuario);
};
