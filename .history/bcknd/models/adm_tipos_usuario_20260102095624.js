// Modelo para la tabla adm_tipos_usuario
/**
 * Modelo: adm_tipos_usuario.js
 * Propósito: Catálogo de tipos de usuario. Soporta operaciones CRUD simples.
 */
const db = require("../database/config");

class AdmTipoUsuario {
  static async findById(id_tipo_usuario) {
    const [rows] = await db.query(
      "SELECT * FROM adm_tipos_usuario WHERE id_tipo_usuario = ?",
      [id_tipo_usuario]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_tipos_usuario");
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre",
    sortDir = "ASC"
  ) {
    const allowed = ["id_tipo_usuario", "nombre", "id_estado", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_tipos_usuario ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_tipos_usuario ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_tipos_usuario"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_tipos_usuario (nombre, descripcion, id_estado, activo) VALUES (?, ?, ?, ?)`;
    const values = [
      data.nombre,
      data.descripcion,
      data.id_estado ?? 1,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_tipo_usuario, data) {
    const sql = `UPDATE adm_tipos_usuario SET nombre = ?, descripcion = ?, id_estado = ?, activo = ? WHERE id_tipo_usuario = ?`;
    const values = [
      data.nombre,
      data.descripcion,
      data.id_estado ?? 1,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_tipo_usuario,
    ];
    await db.query(sql, values);
  }

  static async delete(id_tipo_usuario) {
    await db.query("DELETE FROM adm_tipos_usuario WHERE id_tipo_usuario = ?", [
      id_tipo_usuario,
    ]);
  }
}

module.exports = AdmTipoUsuario;
