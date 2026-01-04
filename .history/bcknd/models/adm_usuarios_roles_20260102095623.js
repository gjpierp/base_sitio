// Modelo para la tabla adm_usuarios_roles
/**
 * Modelo: adm_usuarios_roles.js
 * Propósito: Tabla intermedia usuario<->roles. Provee métodos para listar,
 * crear, sincronizar roles de usuario y facilidades para consultas.
 */
const db = require("../database/config");

class AdmUsuarioRol {
  static async findById(id_usuario_rol) {
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios_roles WHERE id_usuario_rol = ?",
      [id_usuario_rol]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_usuarios_roles");
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "id_usuario_rol",
    sortDir = "ASC"
  ) {
    const allowed = ["id_usuario_rol", "id_usuario", "id_rol", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "id_usuario_rol";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_usuarios_roles ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_usuarios_roles ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_usuarios_roles"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_usuarios_roles (id_usuario, id_rol, activo) VALUES (?, ?, ?)`;
    const values = [
      data.id_usuario,
      data.id_rol,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_usuario_rol, data) {
    const sql = `UPDATE adm_usuarios_roles SET id_usuario = ?, id_rol = ?, activo = ? WHERE id_usuario_rol = ?`;
    const values = [
      data.id_usuario,
      data.id_rol,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_usuario_rol,
    ];
    await db.query(sql, values);
  }

  static async delete(id_usuario_rol) {
    await db.query("DELETE FROM adm_usuarios_roles WHERE id_usuario_rol = ?", [
      id_usuario_rol,
    ]);
  }
}

module.exports = AdmUsuarioRol;
