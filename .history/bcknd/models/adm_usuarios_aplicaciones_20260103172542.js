// Modelo para adm_usuarios_aplicaciones
const db = require('../database/config');

class AdmUsuariosAplicaciones {
  static async findById(id_usuario_aplicacion) {
    const [rows] = await db.query('SELECT * FROM adm_usuarios_aplicaciones WHERE id_usuario_aplicacion = ?', [id_usuario_aplicacion]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM adm_usuarios_aplicaciones ORDER BY id_usuario_aplicacion DESC');
    return rows;
  }

  static async listar(desde = 0, limite = 10) {
    if (typeof desde === 'undefined' || typeof limite === 'undefined') {
      const [rows] = await db.query('SELECT * FROM adm_usuarios_aplicaciones ORDER BY id_usuario_aplicacion DESC');
      return rows;
    }
    const [rows] = await db.query('SELECT * FROM adm_usuarios_aplicaciones ORDER BY id_usuario_aplicacion DESC LIMIT ? OFFSET ?', [limite, desde]);
    return rows;
  }

  static async contar() {
    const [rows] = await db.query('SELECT COUNT(*) as total FROM adm_usuarios_aplicaciones');
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const sql = `INSERT INTO adm_usuarios_aplicaciones (id_usuario, id_aplicacion, activo, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`;
    const vals = [data.id_usuario || null, data.id_aplicacion || null, typeof data.activo !== 'undefined' ? data.activo : 1];
    const [res] = await db.query(sql, vals);
    return res.insertId;
  }

  static async update(id_usuario_aplicacion, data) {
    const sql = `UPDATE adm_usuarios_aplicaciones SET id_usuario = ?, id_aplicacion = ?, activo = ?, updated_at = NOW() WHERE id_usuario_aplicacion = ?`;
    const vals = [data.id_usuario || null, data.id_aplicacion || null, typeof data.activo !== 'undefined' ? data.activo : 1, id_usuario_aplicacion];
    await db.query(sql, vals);
  }

  static async delete(id_usuario_aplicacion) {
    await db.query('DELETE FROM adm_usuarios_aplicaciones WHERE id_usuario_aplicacion = ?', [id_usuario_aplicacion]);
  }

  static async softDelete(id_usuario_aplicacion) {
    await db.query('UPDATE adm_usuarios_aplicaciones SET activo = 0 WHERE id_usuario_aplicacion = ?', [id_usuario_aplicacion]);
  }
}

module.exports = AdmUsuariosAplicaciones;
