// Modelo para la tabla adm_historial_contrasenas
/**
 * Modelo: adm_historial_contrasenas.js
 * Propósito: Almacenar historial de contraseñas (hashes previos, timestamps)
 * utilizado para validación de no-reutilización y auditoría.
 */
const db = require("../database/config");

class AdmHistorialContrasena {
  static async findById(id_historial) {
    const [rows] = await db.query(
      "SELECT * FROM adm_historial_contrasenas WHERE id_historial = ?",
      [id_historial]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_historial_contrasenas");
    return rows;
  }

  static async countFiltered(filters = {}) {
    const { id_usuario, fecha_desde, fecha_hasta } = filters;
    const where = [];
    const params = [];
    if (id_usuario) {
      where.push("id_usuario = ?");
      params.push(Number(id_usuario));
    }
    if (fecha_desde) {
      where.push("fecha_cambio >= ?");
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      where.push("fecha_cambio <= ?");
      params.push(fecha_hasta);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await db.query(
      `SELECT COUNT(*) as total FROM adm_historial_contrasenas ${whereSql}`,
      params
    );
    return rows[0]?.total || 0;
  }

  static async search(filters = {}, desde = 0, limite = 10) {
    const { id_usuario, fecha_desde, fecha_hasta } = filters;
    const where = [];
    const params = [];
    if (id_usuario) {
      where.push("id_usuario = ?");
      params.push(Number(id_usuario));
    }
    if (fecha_desde) {
      where.push("fecha_cambio >= ?");
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      where.push("fecha_cambio <= ?");
      params.push(fecha_hasta);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    params.push(Number(limite) || 10, Number(desde) || 0);
    const [rows] = await db.query(
      `SELECT * FROM adm_historial_contrasenas ${whereSql} ORDER BY id_historial DESC LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  }

  static async listar(desde = 0, limite = 10, sortColumn = "id_historial", sortDir = "DESC") {
    const col = ["id_historial", "id_usuario", "fecha_cambio"].includes(sortColumn) ? sortColumn : "id_historial";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(`SELECT * FROM adm_historial_contrasenas ORDER BY ${col} ${dir}`);
      return rows;
    }
    const [rows] = await db.query(`SELECT * FROM adm_historial_contrasenas ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`, [limite, desde]);
    return rows;
  }

  static async contar() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM adm_historial_contrasenas");
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_historial_contrasenas (id_usuario, hash_contrasena, fecha_cambio) VALUES (?, ?, ?)`;
    const values = [data.id_usuario, data.hash_contrasena, data.fecha_cambio];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async delete(id_historial) {
    await db.query(
      "DELETE FROM adm_historial_contrasenas WHERE id_historial = ?",
      [id_historial]
    );
  }
}

module.exports = AdmHistorialContrasena;
