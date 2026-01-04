/**
 * Controlador: usuarios_roles.js
 * Propósito: CRUD sobre la tabla intermedia adm_usuarios_roles. Exporta
 * funciones para listar, obtener, crear, actualizar y eliminar asociaciones.
 */
const AdmUsuarioRol = require("../models/adm_usuarios_roles");
const { parsePagination } = require("../helpers/pagination");

// Obtener todos los usuarios_roles
exports.obtenerUsuariosRoles = async (req, res, next) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const all = await AdmUsuarioRol.findAll();
    const total = Array.isArray(all) ? all.length : 0;
    const lista = Array.isArray(all) ? all.slice(desde, desde + limite) : all;
    res.json({
      ok: true,
      usuarios_roles: lista,
      total,
      page,
      per_page,
      desde,
      limite,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario_rol por ID
exports.obtenerUsuarioRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await AdmUsuarioRol.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ ok: false, msg: "Usuario rol no encontrado" });
    }
    res.json({ ok: true, usuario_rol: item });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo usuario_rol
exports.crearUsuarioRol = async (req, res, next) => {
  try {
    const { id_usuario, id_rol } = req.body;
    const id = await AdmUsuarioRol.create({ id_usuario, id_rol });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario_rol
exports.actualizarUsuarioRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_usuario, id_rol } = req.body;
    await AdmUsuarioRol.update(id, { id_usuario, id_rol });
    res.json({ ok: true, msg: "Usuario rol actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario_rol
exports.eliminarUsuarioRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdmUsuarioRol.delete(id);
    res.json({ ok: true, msg: "Usuario rol eliminado" });
  } catch (error) {
    next(error);
  }
};
