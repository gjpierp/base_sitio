// Modelo para la tabla adm_estados
/**
 * Modelo: adm_estados.js
 * Propósito: Acceso a la tabla adm_estados (catálogo de estados para entidades).
 * Provee métodos básicos: findAll, findById, create, update, delete.
 */
const db = require("../database/config");

class AdmEstado {
  static async findById(id_estado) {
    const [rows] = await db.query(
      "SELECT * FROM adm_estados WHERE id_estado = ? AND activo = 1",
      [id_estado]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_estados WHERE activo = 1");
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre",
    sortDir = "ASC"
  ) {
    const allowed = ["id_estado", "nombre", "id_applicaciones_sitio", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_estados WHERE activo = 1 ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_estados WHERE activo = 1 ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_estados WHERE activo = 1"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_estados (nombre, descripcion, id_applicaciones_sitio, activo) VALUES (?, ?, ?, ?)`;
    const values = [
      data.nombre,
      data.descripcion || null,
      data.id_applicaciones_sitio || null,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_estado, data) {
    const sql = `UPDATE adm_estados SET nombre = ?, descripcion = ?, id_applicaciones_sitio = ?, activo = ? WHERE id_estado = ?`;
    const values = [
      data.nombre,
      data.descripcion || null,
      data.id_applicaciones_sitio || null,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_estado,
    ];
    await db.query(sql, values);
  }

  static async delete(id_estado) {
    await db.query("DELETE FROM adm_estados WHERE id_estado = ?", [id_estado]);
  }

  static async softDelete(id_estado) {
    await db.query("UPDATE adm_estados SET activo = 0 WHERE id_estado = ?", [
      id_estado,
    ]);
  }
}

module.exports = AdmEstado;
