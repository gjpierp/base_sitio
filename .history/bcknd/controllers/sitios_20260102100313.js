/**
 * Controlador: sitios.js
 * Propósito: CRUD de sitios y endpoints relacionados.
 * Exporta handlers para listar, obtener, crear, actualizar y eliminar sitios.
 */
const AdmSitio = require("../models/adm_sitios");
const { parsePagination } = require("../helpers/pagination");

// Obtener todos los sitios
exports.obtenerSitios = async (req, res, next) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const sitios = await AdmSitio.listar(desde, limite);
    const total = await AdmSitio.contar();
    res.json({ ok: true, sitios, total, page, per_page, desde, limite });
  } catch (error) {
    next(error);
  }
};

// Obtener un sitio por ID
exports.obtenerSitio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sitio = await AdmSitio.findById(id);
    if (!sitio)
      return res.status(404).json({ ok: false, msg: "Sitio no encontrado" });
    res.json({ ok: true, sitio });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo sitio
exports.crearSitio = async (req, res, next) => {
  try {
    const { nombre, codigo, descripcion, activo } = req.body;
    const id = await AdmSitio.create({ nombre, codigo, descripcion, activo });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

// Actualizar un sitio
exports.actualizarSitio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, descripcion, activo } = req.body;
    await AdmSitio.update(id, { nombre, codigo, descripcion, activo });
    res.json({ ok: true, msg: "Sitio actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar un sitio
exports.eliminarSitio = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdmSitio.softDelete(id);
    res.json({ ok: true, msg: "Sitio eliminado" });
  } catch (error) {
    next(error);
  }
};
