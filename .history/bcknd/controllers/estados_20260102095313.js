/**
 * Controlador: estados.js
 * Propósito: CRUD de estados utilizados por otras entidades (usuarios, recursos).
 * Exporta handlers para listar, obtener, crear, actualizar y eliminar estados.
 *
 * Funciones exportadas:
 * - obtenerEstados(req,res,next)
 * - obtenerEstado(req,res,next)
 * - crearEstado(req,res,next)
 * - actualizarEstado(req,res,next)
 * - eliminarEstado(req,res,next)
 */
const AdmEstado = require("../models/adm_estados");
const { parsePagination } = require("../helpers/pagination");

// Obtener todos los estados (paginado)
exports.obtenerEstados = async (req, res, next) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const all = await AdmEstado.findAll();
    const total = Array.isArray(all) ? all.length : 0;
    const estados = Array.isArray(all) ? all.slice(desde, desde + limite) : all;
    res.json({ ok: true, estados, total, page, per_page, desde, limite });
  } catch (error) {
    next(error);
  }
};

// Obtener un estado por ID
exports.obtenerEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await AdmEstado.findById(id);
    if (!estado) {
      return res.status(404).json({ ok: false, msg: "Estado no encontrado" });
    }
    res.json({ ok: true, estado });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo estado
exports.crearEstado = async (req, res, next) => {
  try {
    const { nombre, descripcion, id_applicaciones_sitio, activo } = req.body;
    const id = await AdmEstado.create({
      nombre,
      descripcion,
      id_applicaciones_sitio,
      activo,
    });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

// Actualizar un estado
exports.actualizarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, id_applicaciones_sitio, activo } = req.body;
    await AdmEstado.update(id, {
      nombre,
      descripcion,
      id_applicaciones_sitio,
      activo,
    });
    res.json({ ok: true, msg: "Estado actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar un estado
exports.eliminarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdmEstado.softDelete(id);
    res.json({ ok: true, msg: "Estado eliminado" });
  } catch (error) {
    next(error);
  }
};
