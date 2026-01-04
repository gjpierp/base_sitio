// Modelo generado automáticamente - estandarizado
const BaseModel = require('../models/BaseModel');

class AdmHistorialAcciones extends BaseModel {
  static async findById(id_accion) {
    const [rows] = await BaseModel.query('SELECT * FROM adm_historial_acciones WHERE id_accion = ?', [id_accion]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await BaseModel.query('SELECT * FROM adm_historial_acciones  ORDER BY 1 DESC');
    return rows;
  }

  static async listar(desde = 0, limite = 10, sortColumn = null, sortDir = "ASC", filters = {}) {
    const where = [];
    const vals = [];
    if (filters && typeof filters === "object") {
      for (const k of Object.keys(filters)) {
        const v = filters[k];
        if (v === undefined || v === null) continue;
        where.push(`${k} = ?`);
        vals.push(v);
      }
    }
    const baseWhere = null;
    const whereParts = [];
    if (baseWhere) whereParts.push(baseWhere);
    if (where.length) whereParts.push(...where);
    const whereSql = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";
    const dir = (String(sortDir || "ASC").toUpperCase() === "DESC") ? "DESC" : "ASC";
    const orderSql = sortColumn ? "ORDER BY " + sortColumn + " " + dir : "";
    if (typeof desde === "undefined" || typeof limite === "undefined") {
      const [rows] = await BaseModel.query('SELECT * FROM adm_historial_acciones ' + whereSql + ' ' + orderSql , vals);
      return rows;
    }
    const [rows] = await BaseModel.query('SELECT * FROM adm_historial_acciones ' + whereSql + ' ' + orderSql + ' LIMIT ? OFFSET ?', vals.concat([limite, desde]));
    return rows;
  }

  static async contar(filters = {}) {
    const where = [];
    const vals = [];
    if (filters && typeof filters === "object") {
      for (const k of Object.keys(filters)) {
        const v = filters[k];
        if (v === undefined || v === null) continue;
        where.push(`${k} = ?`);
        vals.push(v);
      }
    }
    if (false) where.unshift('activo = 1');
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query('SELECT COUNT(*) as total FROM adm_historial_acciones ' + whereSql, vals);
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);
    const vals = keys.map(k=>data[k]);
    const sql = 'INSERT INTO adm_historial_acciones (' + keys.join(',') + ') VALUES (' + keys.map(_=>'?').join(',') + ')';
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_accion, data) {
    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map(k=>k + " = ?").join(", ");
    const vals = keys.map(k=>data[k]);
    await BaseModel.query('UPDATE adm_historial_acciones SET ' + setSql + ' WHERE id_accion = ?', vals.concat([id_accion]));
  }

  static async delete(id_accion) {
    await BaseModel.query('DELETE FROM adm_historial_acciones WHERE id_accion = ?', [id_accion]); 
  }

  static async findBy(filters = {}) {
    const where = [];
    const vals = [];
    for (const k of Object.keys(filters || {})) { if (filters[k] === undefined || filters[k] === null) continue; where.push(k + ' = ?'); vals.push(filters[k]); }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query('SELECT * FROM adm_historial_acciones ' + whereSql, vals);
    return rows;
  }
}

// Compatibilidad
AdmHistorialAcciones.search = function (filters, desde = 0, limite = 10) {
  return AdmHistorialAcciones.listar(Number(desde) || 0, Number(limite) || 10, null, 'ASC', filters || {});
};
AdmHistorialAcciones.countFiltered = function (filters) {
  return AdmHistorialAcciones.contar(filters || {});
};

module.exports = AdmHistorialAcciones;