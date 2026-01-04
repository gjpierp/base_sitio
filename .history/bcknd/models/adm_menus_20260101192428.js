// Modelo para la tabla adm_menus
/**
 * Modelo: adm_menus.js
 * Propósito: Acceso a datos para menús del sistema. Soporta listado, árbol
 * de menús, CRUD y asociar permisos a menús.
 */
const db = require("../database/config");

class AdmMenu {
  static async obtenerJerarquia(id_menu) {
    // Devuelve los submenús directos de un menú
    const [rows] = await db.query(
      "SELECT * FROM adm_menus WHERE id_menu_padre = ?",
      [id_menu]
    );
    return rows;
  }
  static async listar(
    desde = 0,
    limite = 10,
    sortColumn = "nombre",
    sortDir = "ASC"
  ) {
    const col = [
      "id_menu",
      "nombre",
      "url",
      "icono",
      "nivel",
      "orden",
      "visible",
    ].includes(sortColumn)
      ? sortColumn
      : "nombre";
    const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
    if (desde === undefined || limite === undefined) {
      const [rows] = await db.query(
        `SELECT * FROM adm_menus ORDER BY ${col} ${dir}`
      );
      return rows;
    }
    const [rows] = await db.query(
      `SELECT * FROM adm_menus ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`,
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM adm_menus");
    return rows[0]?.total || 0;
  }
  static async findById(id_menu) {
    const [rows] = await db.query("SELECT * FROM adm_menus WHERE id_menu = ?", [
      id_menu,
    ]);
    return rows[0] || null;
  }

  static async obtenerPermisos(id_menu) {
    const AdmMenuPermiso = require('./adm_menus_permisos');
    return AdmMenuPermiso.obtenerPermisos(id_menu);
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM adm_menus");
    return rows;
  }

  static async findByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    // Sanitize ids to numbers
    const nums = ids.map((v) => Number(v)).filter((n) => !isNaN(n));
    if (nums.length === 0) return [];
    const placeholders = nums.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT * FROM adm_menus WHERE id_menu IN (${placeholders})`,
      nums
    );
    return rows;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_menus (nombre, url, icono, nivel, orden, visible, id_menu_padre, id_estado, id_aplicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.nombre,
      data.url,
      data.icono,
      data.nivel,
      data.orden || 0,
      data.visible !== false ? 1 : 0,
      data.id_menu_padre,
      data.id_estado ?? 1,
      data.id_aplicacion ?? null,
    ];
    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  static async update(id_menu, data) {
    const sql = `UPDATE adm_menus SET nombre = ?, url = ?, icono = ?, nivel = ?, orden = ?, visible = ?, id_menu_padre = ?, id_estado = ?, id_aplicacion = ? WHERE id_menu = ?`;
    const values = [
      data.nombre,
      data.url,
      data.icono,
      data.nivel,
      data.orden,
      data.visible ? 1 : 0,
      data.id_menu_padre,
      data.id_estado ?? 1,
      data.id_aplicacion ?? null,
      id_menu,
    ];
    await db.query(sql, values);
  }

  static async delete(id_menu) {
    await db.query("DELETE FROM adm_menus WHERE id_menu = ?", [id_menu]);
  }

  static async findByUserId(id_usuario) {
    const [rows] = await db.query(
      `SELECT * FROM adm_menus WHERE visible = 1 ORDER BY nivel, orden, nombre`
    );
    return rows;
  }

  static async buildUserMenuTree(id_usuario) {
    const menus = await this.findByUserId(id_usuario);
    const menuMap = {};
    const roots = [];
    menus.forEach((menu) => {
      menuMap[menu.id_menu] = { ...menu, hijos: [] };
    });
    menus.forEach((menu) => {
      if (menu.id_menu_padre && menuMap[menu.id_menu_padre]) {
        menuMap[menu.id_menu_padre].hijos.push(menuMap[menu.id_menu]);
      } else {
        roots.push(menuMap[menu.id_menu]);
      }
    });
    return roots;
  }
}

module.exports = AdmMenu;
