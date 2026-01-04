/**
 * Controlador: themes.js
 * Propósito: Endpoints CRUD para temas (temas visuales) y utilidades para
 * listar/obtener/crear/actualizar/eliminar temas. Se espera que `css_vars`
 * sea un objeto mapeado de variables CSS y el modelo se encargue de su sanitización.
 */
const { response } = require("express");
const AdmTemas = require("../models/adm_temas");
const { parsePagination } = require("../helpers/pagination");

const listThemes = async (req, res = response) => {
  try {
    const all = await AdmTemas.findAll(true);
    const { desde, limite, page, per_page } = await parsePagination(req);
    const total = Array.isArray(all) ? all.length : 0;
    const data = Array.isArray(all) ? all.slice(desde, desde + limite) : all;
    res.json({ ok: true, data, total, page, per_page, desde, limite });
  } catch (error) {
    console.error("Error listando temas", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const getTheme = async (req, res = response) => {
  try {
    const clave = req.params.clave;
    const theme = await AdmTemas.findByClave(clave);
    if (!theme)
      return res.status(404).json({ ok: false, msg: "Tema no encontrado" });
    res.json({ ok: true, data: theme });
  } catch (error) {
    console.error("Error obteniendo tema", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const createTheme = async (req, res = response) => {
  try {
    const body = req.body || {};
    if (!body.clave || !body.nombre) {
      return res
        .status(400)
        .json({ ok: false, msg: "Clave y nombre son requeridos" });
    }
    if (body.css_vars && typeof body.css_vars !== "object") {
      return res
        .status(400)
        .json({ ok: false, msg: "css_vars debe ser un objeto" });
    }
    const id = await AdmTemas.create({
      clave: body.clave,
      nombre: body.nombre,
      descripcion: body.descripcion,
      tipo: body.tipo,
      css_vars: body.css_vars || {},
      preview: body.preview || null,
      activo: typeof body.activo !== "undefined" ? body.activo : 1,
      publico: typeof body.publico !== "undefined" ? body.publico : 1,
      id_usuario: req.uid || null,
      creado_por: req.uid || null,
    });
    res.status(201).json({ ok: true, id, msg: "Tema creado" });
  } catch (error) {
    console.error("Error creando tema", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const updateTheme = async (req, res = response) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    if (body.css_vars && typeof body.css_vars !== "object") {
      return res
        .status(400)
        .json({ ok: false, msg: "css_vars debe ser un objeto" });
    }
    await AdmTemas.update(id, body);
    res.json({ ok: true, msg: "Tema actualizado" });
  } catch (error) {
    console.error("Error actualizando tema", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const deleteTheme = async (req, res = response) => {
  try {
    const id = req.params.id;
    await AdmTemas.delete(id);
    res.json({ ok: true, msg: "Tema eliminado" });
  } catch (error) {
    console.error("Error eliminando tema", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

module.exports = {
  listThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
};
