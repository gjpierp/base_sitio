/**
 * Controlador: tipos_usuario.js
 * Propósito: Gestionar tipos de usuario (catálogo) con endpoints CRUD sencillos.
 */
const AdmTipoUsuario = require("../models/adm_tipos_usuario");
const { parsePagination } = require("../helpers/pagination");

// Obtener todos los tipos de usuario (paginado)
exports.obtenerTiposUsuario = async (req, res, next) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const all = await AdmTipoUsuario.findAll();
    const total = Array.isArray(all) ? all.length : 0;
    const tipos = Array.isArray(all) ? all.slice(desde, desde + limite) : all;
    res.json({ ok: true, tipos, total, page, per_page, desde, limite });
  } catch (error) {
    next(error);
  }
};

// Obtener un tipo de usuario por ID
exports.obtenerTipoUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tipo = await AdmTipoUsuario.findById(id);
    if (!tipo) {
      return res
        .status(404)
        .json({ ok: false, msg: "Tipo de usuario no encontrado" });
    }
    res.json({ ok: true, tipo });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo tipo de usuario
exports.crearTipoUsuario = async (req, res, next) => {
  try {
    const { nombre, descripcion, id_estado } = req.body;
    const id = await AdmTipoUsuario.create({ nombre, descripcion, id_estado });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

// Actualizar un tipo de usuario
exports.actualizarTipoUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, id_estado } = req.body;
    await AdmTipoUsuario.update(id, { nombre, descripcion, id_estado });
    res.json({ ok: true, msg: "Tipo de usuario actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar un tipo de usuario
exports.eliminarTipoUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdmTipoUsuario.delete(id);
    res.json({ ok: true, msg: "Tipo de usuario eliminado" });
  } catch (error) {
    next(error);
  }
};
