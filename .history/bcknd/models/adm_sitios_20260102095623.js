// Modelo para la tabla adm_sitios
/**
 * Modelo: adm_sitios.js
 * Propósito: CRUD de sitios y utilidades auxiliares.
 */
const db = require("../database/config");

class AdmSitio {
  static async findById(id_sitio) {
    const [rows] = await db.query(
      "SELECT * FROM adm_sitios WHERE id_sitio = ? AND activo = 1",
      [id_sitio]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_sitios WHERE activo = 1");
    return rows;
  }

  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre",
    sortDir = "ASC"
  ) {
    const allowed = ["id_sitio", "nombre", "codigo", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_sitios WHERE activo = 1 ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_sitios WHERE activo = 1 ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_sitios WHERE activo = 1"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_sitios (nombre, codigo, descripcion, activo, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.nombre,
      data.codigo || null,
      data.descripcion || null,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_sitio, data) {
    const sql = `UPDATE adm_sitios SET nombre = ?, codigo = ?, descripcion = ?, activo = ?, updated_at = NOW() WHERE id_sitio = ?`;
    const values = [
      data.nombre,
      data.codigo || null,
      data.descripcion || null,
      typeof data.activo !== "undefined" ? data.activo : 1,
      id_sitio,
    ];
    await db.query(sql, values);
  }

  static async delete(id_sitio) {
    await db.query("DELETE FROM adm_sitios WHERE id_sitio = ?", [id_sitio]);
  }

  static async softDelete(id_sitio) {
    await db.query("UPDATE adm_sitios SET activo = 0 WHERE id_sitio = ?", [
      id_sitio,
    ]);
  }
}

module.exports = AdmSitio;
