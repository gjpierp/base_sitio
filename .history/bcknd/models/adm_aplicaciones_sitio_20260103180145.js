// Modelo generado automáticamente - estandarizado
const BaseModel = require('../models/BaseModel');

class AdmAplicacionesSitio extends BaseModel {
  static async findByClave(clave) {
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio WHERE clave = ? AND activo = 1', [clave]);
    return rows[0] || null;
  }

  static async findById(id_aplicacion) {
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio WHERE id_aplicacion = ?', [id_aplicacion]);
    return rows[0] || null;
  }

  static async findAllBySitio(id_sitio = null) {
    if (!id_sitio) return this.findAll();
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio WHERE id_sitio = ? AND activo = 1 ORDER BY 1 DESC', [id_sitio]);
    return rows;
  }

  static async findAll() {
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio WHERE activo = 1 ORDER BY 1 DESC');
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
    const baseWhere = 'activo = 1';
    const whereParts = [];
    if (baseWhere) whereParts.push(baseWhere);
    if (where.length) whereParts.push(...where);
    const whereSql = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";
    const dir = (String(sortDir || "ASC").toUpperCase() === "DESC") ? "DESC" : "ASC";
    const orderSql = sortColumn ? "ORDER BY " + sortColumn + " " + dir : "";
    if (typeof desde === "undefined" || typeof limite === "undefined") {
      const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio ' + whereSql + ' ' + orderSql , vals);
      return rows;
    }
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio ' + whereSql + ' ' + orderSql + ' LIMIT ? OFFSET ?', vals.concat([limite, desde]));
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
    if (true) where.unshift('activo = 1');
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query('SELECT COUNT(*) as total FROM adm_aplicaciones_sitio ' + whereSql, vals);
    return rows[0]?.total || 0;
  }

  static async create(data) {
    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);
    const vals = keys.map(k=>data[k]);
    const sql = 'INSERT INTO adm_aplicaciones_sitio (' + keys.join(',') + ') VALUES (' + keys.map(_=>'?').join(',') + ')';
    const [res] = await BaseModel.query(sql, vals);
    return res.insertId;
  }

  static async update(id_aplicacion, data) {
    const keys = Object.keys(data || {}).filter(k=>data[k] !== undefined);
    if (!keys.length) return;
    const setSql = keys.map(k=>k + " = ?").join(", ");
    const vals = keys.map(k=>data[k]);
    await BaseModel.query('UPDATE adm_aplicaciones_sitio SET ' + setSql + ' WHERE id_aplicacion = ?', vals.concat([id_aplicacion]));
  }

  static async delete(id_aplicacion) {
    await BaseModel.query('DELETE FROM adm_aplicaciones_sitio WHERE id_aplicacion = ?', [id_aplicacion]); 
  }

  static async softDelete(id_aplicacion) {
    await BaseModel.query('UPDATE adm_aplicaciones_sitio SET activo = 0 WHERE id_aplicacion = ?', [id_aplicacion]); 
  }

  static async findBy(filters = {}) {
    const where = [];
    const vals = [];
    for (const k of Object.keys(filters || {})) { if (filters[k] === undefined || filters[k] === null) continue; where.push(k + ' = ?'); vals.push(filters[k]); }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await BaseModel.query('SELECT * FROM adm_aplicaciones_sitio ' + whereSql, vals);
    return rows;
  }
}

module.exports = AdmAplicacionesSitio;