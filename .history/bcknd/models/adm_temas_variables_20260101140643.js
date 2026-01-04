const db = require('../database/config');

class AdmTemasVariables {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM adm_temas_variables ORDER BY clave');
    return rows;
  }

  static async findByClave(clave) {
    const [rows] = await db.query('SELECT * FROM adm_temas_variables WHERE clave = ? LIMIT 1', [clave]);
    return rows[0] || null;
  }

  static async create(payload) {
    const sql = `INSERT INTO adm_temas_variables (clave, etiqueta, tipo, valor_defecto, meta) VALUES (?, ?, ?, ?, ?)`;
    const vals = [payload.clave, payload.etiqueta || null, payload.tipo || 'string', payload.valor_defecto || null, payload.meta ? JSON.stringify(payload.meta) : null];
    const [res] = await db.query(sql, vals);
    return res.insertId;
  }

  static async upsertVariable(payload) {
    // Insert or update by clave
    const existing = await AdmTemasVariables.findByClave(payload.clave);
    if (existing) {
      const sql = `UPDATE adm_temas_variables SET etiqueta = ?, tipo = ?, valor_defecto = ?, meta = ? WHERE id_tema_var = ?`;
      const vals = [payload.etiqueta || null, payload.tipo || 'string', payload.valor_defecto || null, payload.meta ? JSON.stringify(payload.meta) : null, existing.id_tema_var];
      await db.query(sql, vals);
      return existing.id_tema_var;
    }
    return AdmTemasVariables.create(payload);
  }

  static async setValueForTheme(id_tema, id_tema_var, valor) {
    const sql = `INSERT INTO adm_temas_variables_valores (id_tema, id_tema_var, valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP`;
    await db.query(sql, [id_tema, id_tema_var, valor]);
  }

  static async getValuesForTheme(id_tema) {
    const sql = `
      SELECT v.id, v.id_tema, v.id_tema_var, v.valor, t.clave, t.etiqueta, t.tipo, t.valor_defecto
      FROM adm_temas_variables t
      LEFT JOIN adm_temas_variables_valores v ON v.id_tema_var = t.id_tema_var AND v.id_tema = ?
      ORDER BY t.clave
    `;
    const [rows] = await db.query(sql, [id_tema]);
    return rows;
  }
}

module.exports = AdmTemasVariables;
