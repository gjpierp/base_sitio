/**
 * Controlador: roles_permisos.js
 * Propósito: Endpoints para CRUD de la relación roles<->permisos.
 * Exporta funciones para listar, obtener, crear, actualizar y eliminar relaciones.
 */
const { response } = require("express");
const AdmRolPermiso = require("../models/adm_roles_permisos");
const { parsePagination } = require("../helpers/pagination");

// GET /api/roles_permisos
const obtenerRolesPermisos = async (req, res = response) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const data = await AdmRolPermiso.listar(desde, limite);
    const total = await AdmRolPermiso.contar();
    res.json({
      ok: true,
      roles_permisos: data,
      total,
      page,
      per_page,
      desde,
      limite,
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error al obtener roles_permisos" });
  }
};

// GET /api/roles_permisos/:id
const obtenerRolPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;
    const data = await AdmRolPermiso.findById(id);
    if (!data) {
      return res.status(404).json({ ok: false, msg: "No encontrado" });
    }
    res.json({ ok: true, rol_permiso: data });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error al obtener rol_permiso" });
  }
};

// POST /api/roles_permisos
const crearRolPermiso = async (req, res = response) => {
  try {
    const { id_rol, id_permiso } = req.body;
    if (!id_rol || !id_permiso) {
      return res
        .status(400)
        .json({ ok: false, msg: "id_rol e id_permiso son requeridos" });
    }
    const insertId = await AdmRolPermiso.create({ id_rol, id_permiso });
    res.status(201).json({ ok: true, id: insertId });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error al crear rol_permiso" });
  }
};

// PUT /api/roles_permisos/:id
const actualizarRolPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { id_rol, id_permiso } = req.body;
    if (!id_rol || !id_permiso) {
      return res
        .status(400)
        .json({ ok: false, msg: "id_rol e id_permiso son requeridos" });
    }
    await AdmRolPermiso.update(id, { id_rol, id_permiso });
    res.json({ ok: true, msg: "Actualizado" });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error al actualizar rol_permiso" });
  }
};

// DELETE /api/roles_permisos/:id
const eliminarRolPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;
    await AdmRolPermiso.delete(id);
    res.json({ ok: true, msg: "Eliminado" });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error al eliminar rol_permiso" });
  }
};

module.exports = {
  obtenerRolesPermisos,
  obtenerRolPermiso,
  crearRolPermiso,
  actualizarRolPermiso,
  eliminarRolPermiso,
};
