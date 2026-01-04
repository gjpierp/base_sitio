// Modelo para la tabla adm_menus_permisos
/**
 * Modelo: adm_menus_permisos.js
 * Propósito: Tabla intermedia para relaciones menu<->permiso. Provee CRUD y
 * utilidades para comprobar/excluir relaciones.
 */
const db = require("../database/config");

class AdmMenuPermiso {
  static async obtenerPermisos(id_menu) {
    const [rows] = await db.query(
      `SELECT p.* FROM adm_permisos p
          INNER JOIN adm_menus_permisos mp ON p.id_permiso = mp.id_permiso
          WHERE mp.id_menu = ?`,
      [id_menu]
    );
    return rows;
  }
  static async existeRelacion(id_menu, id_permiso) {
    const [rows] = await db.query(
      "SELECT 1 FROM adm_menus_permisos WHERE id_menu = ? AND id_permiso = ?",
      [id_menu, id_permiso]
    );
    return rows.length > 0;
  }
  static async create(data) {
    const sql = `INSERT INTO adm_menus_permisos (id_menu, id_permiso, activo) VALUES (?, ?, ?)`;
    const values = [
      data.id_menu,
      data.id_permiso,
      typeof data.activo !== "undefined" ? data.activo : 1,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async delete(id_menu_permiso) {
    await db.query("DELETE FROM adm_menus_permisos WHERE id_menu_permiso = ?", [
      id_menu_permiso,
    ]);
  }

  static async deleteByMenuId(id_menu) {
    await db.query("DELETE FROM adm_menus_permisos WHERE id_menu = ?", [id_menu]);
  }

  static async findByMenuId(id_menu) {
    const [rows] = await db.query("SELECT * FROM adm_menus_permisos WHERE id_menu = ?", [id_menu]);
    return rows;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_menus_permisos");
    return rows;
  }
  // Puedes agregar aquí métodos para crear/eliminar relaciones si lo necesitas
}

module.exports = AdmMenuPermiso;
