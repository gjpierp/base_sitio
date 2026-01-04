// Modelo para la tabla adm_jerarquias
/**
 * Modelo: adm_jerarquias.js
 * Propósito: CRUD para jerarquías organizacionales y utilidades para construir
 * jerarquías/árboles si se requiere.
 */
const db = require("../database/config");

class AdmJerarquia {
  static async findById(id_jerarquia) {
    const [rows] = await db.query(
      "SELECT * FROM adm_jerarquias WHERE id_jerarquia = ?",
      [id_jerarquia]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_jerarquias");
    return rows;
  }

  static async listar(desde = 0, limite = 10, sortColumn = "nombre", sortDir = "ASC") {
    const allowed = ["id_jerarquia", "nombre", "id_jerarquia_padre", "id_estado", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(`SELECT * FROM adm_jerarquias ORDER BY ${col} ${dir}`);
      return rows;
    }
    const [rows] = await db.query(`SELECT * FROM adm_jerarquias ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`, [limite, desde]);
    return rows;
  }

  static async contar() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM adm_jerarquias");
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_jerarquias (nombre, descripcion, id_jerarquia_padre, id_estado, activo) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      data.nombre,
      data.descripcion,
      data.id_jerarquia_padre,
      data.id_estado ?? 1,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_jerarquia, data) {
    const sql = `UPDATE adm_jerarquias SET nombre = ?, id_jerarquia_padre = ?, id_estado = ?, activo = ? WHERE id_jerarquia = ?`;
    const values = [
      data.nombre,
      data.id_jerarquia_padre,
      data.id_estado ?? 1,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_jerarquia,
    ];
    await db.query(sql, values);
  }

  static async delete(id_jerarquia) {
    await db.query("DELETE FROM adm_jerarquias WHERE id_jerarquia = ?", [
      id_jerarquia,
    ]);
  }
}

module.exports = AdmJerarquia;
