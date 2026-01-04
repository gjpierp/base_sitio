// Modelo para la tabla adm_roles_permisos
/**
 * Modelo: adm_roles_permisos.js
 * Propósito: Tabla intermedia roles<->permisos. Provee métodos para listar,
 * crear, eliminar y buscar permisos por rol.
 */
const db = require("../database/config");

class AdmRolPermiso {
  static async update(id_rol_permiso, data) {
    const sql = `UPDATE adm_roles_permisos SET id_rol = ?, id_permiso = ? WHERE id_rol_permiso = ?`;
    const values = [data.id_rol, data.id_permiso, id_rol_permiso];
    await db.query(sql, values);
  }
  static async findById(id_rol_permiso) {
    const [rows] = await db.query(
      "SELECT * FROM adm_roles_permisos WHERE id_rol_permiso = ?",
      [id_rol_permiso]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_roles_permisos");
    return rows;
  }

  static async listar(desde = 0, limite = 10, sortColumn = "id_rol_permiso", sortDir = "ASC") {
    const allowed = ["id_rol_permiso", "id_rol", "id_permiso", "activo"];
    const col = allowed.includes(sortColumn) ? sortColumn : "id_rol_permiso";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(`SELECT * FROM adm_roles_permisos ORDER BY ${col} ${dir}`);
      return rows;
    }
    const [rows] = await db.query(`SELECT * FROM adm_roles_permisos ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`, [limite, desde]);
    return rows;
  }

  static async contar() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM adm_roles_permisos");
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_roles_permisos (id_rol, id_permiso, activo) VALUES (?, ?, ?)`;
    const values = [
      data.id_rol,
      data.id_permiso,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async delete(id_rol_permiso) {
    await db.query("DELETE FROM adm_roles_permisos WHERE id_rol_permiso = ?", [
      id_rol_permiso,
    ]);
  }
}

module.exports = AdmRolPermiso;
