/**
 * Componente para la gestión y listado de roles en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 28-12-2025 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de roles.
 */
const BaseModel = require("../models/BaseModel");

class AdmRoles extends BaseModel {
  static get tableName() {
    return "adm_roles";
  }
  static get primaryKey() {
    return "id_rol";
  }
  /**
   * @description Obtiene un rol por su id.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  static async findById(id_rol) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_roles WHERE id_rol = ?",
      [id_rol]
    );
    return rows[0] || null;
  }

  /**
   * @description Lista todos los roles activos.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_roles WHERE activo = 1 ORDER BY 1 DESC"
    );
    return rows;
  }

  /**
   * @description Listado paginado y filtrado de roles.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

  /**
   * @description Cuenta los roles que cumplen filtros.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

  /**
   * @description Crea un nuevo rol.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

  /**
   * @description Actualiza un rol por id.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

  /**
   * @description Elimina un rol permanentemente.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  static async delete(id_rol) {
    await BaseModel.query("DELETE FROM adm_roles WHERE id_rol = ?", [id_rol]);
  }

  /**
   * @description Marca un rol como inactivo (soft delete).
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
  static async softDelete(id_rol) {
    await BaseModel.query("UPDATE adm_roles SET activo = 0 WHERE id_rol = ?", [
      id_rol,
    ]);
  }

  /**
   * @description Encuentra roles por filtros.
   * @author Gerardo Paiva
   * @date 28-12-2025
   */
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

// Compatibilidad: nombres en español usados por controladores
/**
 * @description Obtiene un rol por su id. (compatibilidad)
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.obtenerPorId = function (id) {
  return AdmRoles.findById(id);
};

/**
 * @description Obtiene un rol por su nombre.
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.obtenerPorNombre = async function (nombre) {
  if (!nombre) return null;
  const rows = await AdmRoles.findBy({ nombre });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
};

/**
 * @description Crea un rol (alias compatibilidad).
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.crear = function (data) {
  return AdmRoles.create(data);
};

/**
 * @description Actualiza un rol (alias compatibilidad).
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.actualizar = function (id, data) {
  return AdmRoles.update(id, data);
};

/**
 * @description Elimina un rol (alias compatibilidad).
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.eliminar = function (id) {
  return AdmRoles.delete(id);
};

/**
 * @description Obtiene permisos asociados a un rol.
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.obtenerPermisos = async function (id_rol) {
  const [rows] = await BaseModel.query(
    `SELECT p.* FROM adm_permisos p JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso WHERE rp.id_rol = ? AND rp.activo = 1 AND p.activo = 1`,
    [id_rol]
  );
  return rows || [];
};

/**
 * @description Obtiene usuarios asociados a un rol.
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
AdmRoles.obtenerUsuarios = async function (id_rol) {
  const [rows] = await BaseModel.query(
    `SELECT u.* FROM adm_usuarios u JOIN adm_usuarios_roles ur ON ur.id_usuario = u.id_usuario WHERE ur.id_rol = ? AND ur.activo = 1 AND u.activo = 1`,
    [id_rol]
  );
  return rows || [];
};

/**
 * @description Sincroniza permisos de un rol (añade/desactiva relaciones).
 * @author Gerardo Paiva
 * @date 28-12-2025
 */
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

module.exports = AdmRoles;
