// Modelo para la tabla adm_usuarios_jerarquias
/**
 * Modelo: adm_usuarios_jerarquias.js
 * Propósito: Tabla intermedia usuario<->jerarquía. Métodos para listar,
 * crear, actualizar y eliminar relaciones entre usuarios y jerarquías.
 */
const db = require("../database/config");

class AdmUsuarioJerarquia {
  static async findById(id_usuario_jerarquia) {
    const [rows] = await db.query(
      "SELECT * FROM adm_usuarios_jerarquias WHERE id_usuario_jerarquia = ?",
      [id_usuario_jerarquia]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_usuarios_jerarquias");
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "id_usuario_jerarquia",
    sortDir = "ASC"
  ) {
    const allowed = [
      "id_usuario_jerarquia",
      "id_usuario",
      "id_jerarquia",
      "activo",
    ];
    const col = allowed.includes(sortColumn)
      ? sortColumn
      : "id_usuario_jerarquia";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_usuarios_jerarquias ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_usuarios_jerarquias ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_usuarios_jerarquias"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_usuarios_jerarquias (id_usuario, id_jerarquia, activo) VALUES (?, ?, ?)`;
    const values = [
      data.id_usuario,
      data.id_jerarquia,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_usuario_jerarquia, data) {
    const sql = `UPDATE adm_usuarios_jerarquias SET id_usuario = ?, id_jerarquia = ?, activo = ? WHERE id_usuario_jerarquia = ?`;
    const values = [
      data.id_usuario,
      data.id_jerarquia,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_usuario_jerarquia,
    ];
    await db.query(sql, values);
  }

  static async delete(id_usuario_jerarquia) {
    await db.query(
      "DELETE FROM adm_usuarios_jerarquias WHERE id_usuario_jerarquia = ?",
      [id_usuario_jerarquia]
    );
  }
}

module.exports = AdmUsuarioJerarquia;
