/**
 * Componente para la gestión y listado de usuarios en el sistema.
 * Fecha             Autor                   Versión           Descripción
 * @date 04-01-2026 @author Gerardo Paiva   @version 1.0.0    @description Listado, edición y eliminación de usuarios.
 */
const BaseModel = require("../models/BaseModel");

class AdmUsuarios extends BaseModel {
  /**
   * @description Nombre de la tabla en la base de datos.
   * @author Gerardo Paiva
   * @date 04-01-2026
   */
  static get tableName() {
    return "adm_usuarios";
  }

  /**
   * @description Clave primaria de la tabla.
   * @author Gerardo Paiva
   * @date 04-01-2026
   */
  static get primaryKey() {
    return "id_usuario";
  }

  /**
   * @description Obtiene los roles activos asociados a un usuario.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @returns {Promise<Array>} Lista de roles.
   */
  static async obtenerRoles(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT r.* FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND r.activo = 1",
      [id_usuario]
    );
    return rows;
  }

  /**
   * @description Obtiene permisos activos directos e indirectos de un usuario.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @returns {Promise<Array>} Lista de permisos.
   */
  static async obtenerPermisos(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT DISTINCT p.* FROM adm_permisos p JOIN adm_roles_permisos rp ON rp.id_permiso = p.id_permiso JOIN adm_usuarios_roles ur ON ur.id_rol = rp.id_rol WHERE ur.id_usuario = ? AND ur.activo = 1 AND rp.activo = 1 AND p.activo = 1",
      [id_usuario]
    );
    return rows;
  }

  /**
   * @description Sincroniza las relaciones `adm_usuarios_roles` para un usuario.
   * Añade relaciones faltantes y desactiva las que ya no están en la lista.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @param {Array<number>} [roles=[]] - Array de ids de roles deseados.
   * @returns {Promise<void>}
   */
  static async sincronizarRoles(id_usuario, roles = []) {
    const AdmUsuarioRol = require("./adm_usuarios_roles");
    const desired = Array.isArray(roles) ? roles.map((r) => Number(r)) : [];

    const existing = await AdmUsuarioRol.findBy({ id_usuario });
    const existingActive = Array.isArray(existing)
      ? existing.filter((r) => r.activo === 1)
      : [];
    const existingRoleIds = existingActive.map((r) => Number(r.id_rol));

    const toAdd = desired.filter((r) => !existingRoleIds.includes(Number(r)));
    const toDeactivate = existingActive.filter(
      (r) => !desired.includes(Number(r.id_rol))
    );

    for (const rel of toDeactivate) {
      try {
        await AdmUsuarioRol.update(rel.id_usuario_rol, { activo: 0 });
      } catch (e) {
        console.error("[sincronizarRoles] error deactivating role relation", e);
      }
    }

    for (const roleId of toAdd) {
      try {
        await AdmUsuarioRol.create({
          id_usuario,
          id_rol: Number(roleId),
          activo: 1,
        });
      } catch (e) {
        console.error("[sincronizarRoles] error creating role relation", e);
      }
    }
  }

  /**
   * @description Comprueba si un usuario tiene un rol dado (por nombre).
   * Acepta variantes con o sin sufijo `_ROLE`.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @param {string} rolNombre - Nombre del rol a comprobar.
   * @returns {Promise<boolean>} `true` si el usuario tiene el rol.
   */
  static async tieneRol(id_usuario, rolNombre) {
    if (!rolNombre) return false;
    const simple = String(rolNombre || "").replace(/_?ROLE$/i, "");
    const variants = [rolNombre, simple];
    const [rows] = await BaseModel.query(
      `SELECT 1 FROM adm_roles r JOIN adm_usuarios_roles ur ON ur.id_rol = r.id_rol WHERE ur.id_usuario = ? AND (LOWER(r.nombre) = LOWER(?) OR LOWER(r.nombre) = LOWER(?)) LIMIT 1`,
      [id_usuario, variants[0], variants[1]]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  /**
   * @description Obtiene un usuario por su id.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @returns {Promise<Object|null>} Objeto usuario o null si no existe.
   */
  static async findById(id_usuario) {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE id_usuario = ?",
      [id_usuario]
    );
    return rows[0] || null;
  }

  /**
   * @description Lista todos los usuarios activos.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @returns {Promise<Array>} Array de usuarios.
   */
  static async findAll() {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE activo = 1 ORDER BY 1 DESC"
    );
    return rows;
  }

  /**
   * @description Listado paginado y filtrado de usuarios.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} [desde=0] - Offset para paginación.
   * @param {number} [limite=10] - Límite de registros.
   * @param {string|null} [sortColumn=null] - Columna de orden.
   * @param {string} [sortDir='ASC'] - Dirección de orden (`ASC`|`DESC`).
   * @param {Object} [filters={}] - Filtros a aplicar (clave: valor).
   * @returns {Promise<Array>} Lista de usuarios.
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

  /**
   * @description Cuenta usuarios que cumplen los filtros dados.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {Object} [filters={}] - Filtros a aplicar.
   * @returns {Promise<number>} Total de registros.
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
      "SELECT COUNT(*) as total FROM adm_usuarios " + whereSql,
      vals
    );
    return rows[0]?.total || 0;
  }

  /**
   * @description Inserta un nuevo usuario en la tabla.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {Object} data - Campos a insertar.
   * @returns {Promise<number>} InsertId del nuevo registro.
   */
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

  /**
   * @description Actualiza campos de un usuario por id.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @param {Object} data - Campos a actualizar.
   * @returns {Promise<void>}
   */
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

  /**
   * @description Elimina físicamente un usuario de la tabla.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @returns {Promise<void>}
   */
  static async delete(id_usuario) {
    await BaseModel.query("DELETE FROM adm_usuarios WHERE id_usuario = ?", [
      id_usuario,
    ]);
  }

  /**
   * @description Marca un usuario como inactivo (soft delete).
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {number} id_usuario - Identificador del usuario.
   * @returns {Promise<void>}
   */
  static async softDelete(id_usuario) {
    await BaseModel.query(
      "UPDATE adm_usuarios SET activo = 0 WHERE id_usuario = ?",
      [id_usuario]
    );
  }

  /**
   * @description Busca usuarios por filtros arbitrarios.
   * @author Gerardo Paiva
   * @date 04-01-2026
   * @param {Object} [filters={}] - Filtros clave:valor.
   * @returns {Promise<Array>} Resultados que cumplen los filtros.
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
      "SELECT * FROM adm_usuarios " + whereSql,
      vals
    );
    return rows;
  }
}

// Compatibilidad: nombres usados por controladores legacy
AdmUsuarios.obtenerPorCorreo = async function (correo) {
  if (!correo) return null;
  try {
    const [rows] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    if (Array.isArray(rows) && rows.length) return rows[0];
  } catch (e) {}
  try {
    const [rows2] = await BaseModel.query(
      "SELECT * FROM adm_usuarios WHERE nombre_usuario = ? LIMIT 1",
      [correo]
    );
    if (Array.isArray(rows2) && rows2.length) return rows2[0];
  } catch (e) {}
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

module.exports = AdmUsuarios;
