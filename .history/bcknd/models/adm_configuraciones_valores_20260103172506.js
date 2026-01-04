// Modelo para adm_configuraciones_valores
const db = require('../database/config');

class AdmConfiguracionValor {
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM adm_configuraciones_valores WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM adm_configuraciones_valores ORDER BY id DESC');
    return rows;
  }

  static async listar(desde = 0, limite = 10) {
    if (typeof desde === 'undefined' || typeof limite === 'undefined') {
      const [rows] = await db.query('SELECT * FROM adm_configuraciones_valores ORDER BY id DESC');
      return rows;
    }
    const [rows] = await db.query('SELECT * FROM adm_configuraciones_valores ORDER BY id DESC LIMIT ? OFFSET ?', [limite, desde]);
    return rows;
  }

  static async crear(data) {
    const sql = `INSERT INTO adm_configuraciones_valores (id_config, id_tema_var, valor, creado_at, actualizado_at) VALUES (?, ?, ?, NOW(), NOW())`;
    const vals = [data.id_config || null, data.id_tema_var || null, data.valor || null];
    const [res] = await db.query(sql, vals);
    return res.insertId;
  }

  static async update(id, data) {
    const sql = `UPDATE adm_configuraciones_valores SET id_config = ?, id_tema_var = ?, valor = ?, actualizado_at = NOW() WHERE id = ?`;
    const vals = [data.id_config || null, data.id_tema_var || null, data.valor || null, id];
    await db.query(sql, vals);
  }

  static async delete(id) {
    await db.query('DELETE FROM adm_configuraciones_valores WHERE id = ?', [id]);
  }
}

module.exports = AdmConfiguracionValor;
