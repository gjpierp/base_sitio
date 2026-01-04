/**
 * Controlador: usuarios_jerarquias.js
 * Propósito: Gestionar las asociaciones usuario<->jerarquía (CRUD y listados).
 */
const AdmUsuarioJerarquia = require("../models/adm_usuarios_jerarquias");
const { parsePagination } = require("../helpers/pagination");

// Obtener todos los usuarios_jerarquias
exports.obtenerUsuariosJerarquias = async (req, res, next) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const lista = await AdmUsuarioJerarquia.listar(desde, limite);
    const total = await AdmUsuarioJerarquia.contar();
    res.json({
      ok: true,
      usuarios_jerarquias: lista,
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

// Obtener un usuario_jerarquia por ID
exports.obtenerUsuarioJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await AdmUsuarioJerarquia.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ ok: false, msg: "Usuario jerarquía no encontrado" });
    }
    res.json({ ok: true, usuario_jerarquia: item });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo usuario_jerarquia
exports.crearUsuarioJerarquia = async (req, res, next) => {
  try {
    const { id_usuario, id_jerarquia } = req.body;
    const id = await AdmUsuarioJerarquia.create({ id_usuario, id_jerarquia });
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
};

// Actualizar un usuario_jerarquia
exports.actualizarUsuarioJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_usuario, id_jerarquia } = req.body;
    await AdmUsuarioJerarquia.update(id, { id_usuario, id_jerarquia });
    res.json({ ok: true, msg: "Usuario jerarquía actualizado" });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario_jerarquia
exports.eliminarUsuarioJerarquia = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AdmUsuarioJerarquia.delete(id);
    res.json({ ok: true, msg: "Usuario jerarquía eliminado" });
  } catch (error) {
    next(error);
  }
};
