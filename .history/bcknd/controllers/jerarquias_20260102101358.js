/**
 * Controlador: jerarquias.js
 * Propósito: Endpoints CRUD para jerarquías organizacionales.
 * Exporta handlers para listar, obtener, crear, actualizar y eliminar jerarquías.
 */
const AdmJerarquia = require("../models/adm_jerarquias");
const { parsePagination } = require("../helpers/pagination");

exports.obtenerJerarquias = async (req, res, next) => {
  try {
    const sortKey = String(req.query.sortKey || "").trim();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const allowed = [
      "id_jerarquia",
      "nombre",
      "id_jerarquia_padre",
      "id_estado",
      "activo",
    ];
    const sortColumn = allowed.includes(sortKey) ? sortKey : "nombre";

    const { desde, limite, page, per_page } = await parsePagination(req);
    const list = await AdmJerarquia.listar(desde, limite, sortColumn, sortDir);
    const total = await AdmJerarquia.contar();

    res.json({
      ok: true,
      jerarquias: list,
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
