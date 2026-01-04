/**
 * Controlador: jerarquias.js
 * Propósito: Endpoints CRUD para jerarquías organizacionales.
 * Exporta handlers para listar, obtener, crear, actualizar y eliminar jerarquías.
 */
const AdmJerarquia = require("../models/adm_jerarquias");
const { parsePagination } = require("../helpers/pagination");

exports.obtenerJerarquias = async (req, res, next) => {
  try {
    // soportar paginación y ordenamiento desde frontend
    const sortKey = String(req.query.sortKey || "").trim();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc" ? -1 : 1;

    const all = await AdmJerarquia.findAll();
    const total = Array.isArray(all) ? all.length : 0;

    // orden simple si se provee sortKey
    let list = Array.isArray(all) ? all.slice() : [];
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === "number" && typeof vb === "number")
          return (va - vb) * sortDir;
        return String(va).localeCompare(String(vb)) * sortDir;
      });
    }

    const { desde, limite, page, per_page } = await parsePagination(req);
    const resultados = list.slice(desde, Math.min(desde + limite, total));

    res.json({
      ok: true,
      jerarquias: resultados,
      total,
      desde,
      limite,
      page,
      per_page,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jerarquia = await AdmJerarquia.findById(id);
    if (!jerarquia) {
      return res
        .status(404)
        .json({ ok: false, msg: "Jerarquía no encontrada" });
    }
    res.json({ ok: true, jerarquia });
  } catch (error) {
    next(error);
  }
};

exports.crearJerarquia = async (req, res, next) => {
  try {
    const { nombre, descripcion, id_jerarquia_padre, id_estado } = req.body;
    const id = await AdmJerarquia.create({
      nombre,
      descripcion,
      id_jerarquia_padre,
      id_estado,
    });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

exports.actualizarJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, id_jerarquia_padre, id_estado } = req.body;
    const existente = await AdmJerarquia.findById(id);
    if (!existente) {
      return res
        .status(404)
        .json({ ok: false, msg: "Jerarquía no encontrada" });
    }
    await AdmJerarquia.update(id, { nombre, id_jerarquia_padre, id_estado });
    res.json({ ok: true, msg: "Jerarquía actualizada" });
  } catch (error) {
    next(error);
  }
};

exports.eliminarJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existente = await AdmJerarquia.findById(id);
    if (!existente) {
      return res
        .status(404)
        .json({ ok: false, msg: "Jerarquía no encontrada" });
    }
    await AdmJerarquia.delete(id);
    res.json({ ok: true, msg: "Jerarquía eliminada" });
  } catch (error) {
    next(error);
  }
};
