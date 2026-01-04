// Modelo para adm_configuraciones_tema
const db = require("../database/config");

class AdmConfiguracionTema {
  static async findById(id_config) {
    const [rows] = await db.query(
      "SELECT * FROM adm_configuraciones_tema WHERE id_config = ?",
      [id_config]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM adm_configuraciones_tema ORDER BY id_config DESC"
    );
    return rows;
  }

  static async listar(desde = 0, limite = 10) {
    if (typeof desde === "undefined" || typeof limite === "undefined") {
      const [rows] = await db.query(
        "SELECT * FROM adm_configuraciones_tema ORDER BY id_config DESC"
      );
      return rows;
    }
    const [rows] = await db.query(
      "SELECT * FROM adm_configuraciones_tema ORDER BY id_config DESC LIMIT ? OFFSET ?",
      [limite, desde]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM adm_configuraciones_tema"
    );
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_configuraciones_tema (id_usuario, id_tema, nombre, creado_at, meta) VALUES (?, ?, ?, NOW(), ?)`;
    const vals = [
      data.id_usuario || null,
      data.id_tema || null,
      data.nombre || null,
      data.meta || null,
    ];
    const [res] = await db.query(sql, vals);
    return res.insertId;
  }

  static async update(id_config, data) {
    const sql = `UPDATE adm_configuraciones_tema SET id_usuario = ?, id_tema = ?, nombre = ?, meta = ?, creado_at = ? WHERE id_config = ?`;
    const vals = [
      data.id_usuario || null,
      data.id_tema || null,
      data.nombre || null,
      data.meta || null,
      data.creado_at || null,
      id_config,
    ];
    await db.query(sql, vals);
  }

  static async delete(id_config) {
    await db.query("DELETE FROM adm_configuraciones_tema WHERE id_config = ?", [
      id_config,
    ]);
  }
}

module.exports = AdmConfiguracionTema;
