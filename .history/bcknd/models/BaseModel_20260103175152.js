// BaseModel: helpers para consultas y construcción de WHERE/ORDER
const db = require("../database/config");

class BaseModel {
  static async query(sql, params = []) {
    return db.query(sql, params);
  }

  static buildWhere(filters = {}) {
    const where = [];
    const vals = [];
    for (const k of Object.keys(filters || {})) {
      const v = filters[k];
      if (v === undefined || v === null) continue;
      where.push(k + " = ?");
      vals.push(v);
    }
    return {
      whereSql: where.length ? "WHERE " + where.join(" AND ") : "",
      vals,
    };
  }

  static orderSql(sortColumn, sortDir = "ASC") {
    const dir =
      String(sortDir || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";
    return sortColumn ? "ORDER BY " + sortColumn + " " + dir : "";
  }

  static buildInsert(data = {}) {
    const keys = Object.keys(data || {}).filter((k) => data[k] !== undefined);
    const vals = keys.map((k) => data[k]);
    const cols = keys.join(",");
    const qmarks = keys.map(() => "?").join(",");
    return { cols, vals, qmarks };
  }
}

module.exports = BaseModel;
