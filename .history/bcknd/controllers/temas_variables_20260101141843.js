/**
 * Controlador: temas_variables.js
 * CRUD para variables de tema y valores por tema.
 */
const AdmTemasVariables = require('../models/adm_temas_variables');
const AdmTemas = require('../models/adm_temas');
const db = require('../database/config');

// Listar variables (opcional search q sobre clave/etiqueta)
exports.listVariables = async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    let vars = await AdmTemasVariables.findAll();
    if (q) {
      const ql = q.toLowerCase();
      vars = vars.filter((v) => (v.clave || '').toLowerCase().includes(ql) || (v.etiqueta || '').toLowerCase().includes(ql));
    }
    res.json({ ok: true, variables: vars });
  } catch (err) {
    next(err);
  }
};

// Obtener variable por id
exports.getVariable = async (req, res, next) => {
  try {
    const id = req.params.id;
    const rows = await db.query('SELECT * FROM adm_temas_variables WHERE id_tema_var = ? LIMIT 1', [id]);
    const row = (rows && rows[0] && rows[0][0]) ? rows[0][0] : (rows && rows[0]) ? rows[0][0] : null;
    if (!row) return res.status(404).json({ ok: false, msg: 'Variable no encontrada' });
    res.json({ ok: true, variable: row });
  } catch (err) {
    next(err);
  }
};

// Crear / upsert variable
exports.createVariable = async (req, res, next) => {
  try {
    const { clave, etiqueta, tipo, valor_defecto, meta } = req.body;
    const id = await AdmTemasVariables.upsertVariable({ clave, etiqueta, tipo, valor_defecto, meta });
    res.status(201).json({ ok: true, id });
  } catch (err) {
    next(err);
  }
};

// Actualizar variable
exports.updateVariable = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { etiqueta, tipo, valor_defecto, meta } = req.body;
    const sql = `UPDATE adm_temas_variables SET etiqueta = ?, tipo = ?, valor_defecto = ?, meta = ? WHERE id_tema_var = ?`;
    await db.query(sql, [etiqueta || null, tipo || 'string', valor_defecto || null, meta ? JSON.stringify(meta) : null, id]);
    res.json({ ok: true, msg: 'Variable actualizada' });
  } catch (err) {
    next(err);
  }
};

// Eliminar variable
exports.deleteVariable = async (req, res, next) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM adm_temas_variables WHERE id_tema_var = ?', [id]);
    res.json({ ok: true, msg: 'Variable eliminada' });
  } catch (err) {
    next(err);
  }
};

// Obtener valores para un tema
exports.getValuesForTheme = async (req, res, next) => {
  try {
    const id_tema = req.params.id_tema;
    // id_tema may be numeric id or clave; try numeric first
    let id = id_tema;
    if (isNaN(Number(id_tema))) {
      // treat as clave
      const t = await AdmTemas.findByClave(id_tema);
      if (t) id = t.id_tema;
    }
    const values = await AdmTemasVariables.getValuesForTheme(id);
    res.json({ ok: true, values });
  } catch (err) {
    next(err);
  }
};

// Set / update value for theme
exports.setValueForTheme = async (req, res, next) => {
  try {
    const { id_tema, id_tema_var, valor } = req.body;
    if (!id_tema || !id_tema_var) return res.status(400).json({ ok: false, msg: 'id_tema e id_tema_var son requeridos' });
    await AdmTemasVariables.setValueForTheme(id_tema, id_tema_var, valor);
    res.json({ ok: true, msg: 'Valor guardado' });
  } catch (err) {
    next(err);
  }
};
