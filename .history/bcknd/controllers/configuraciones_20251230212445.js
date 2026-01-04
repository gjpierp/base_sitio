/**
 * Controlador: configuraciones.js
 * Propósito: Endpoints para listar, crear, actualizar y eliminar
 * configuraciones del sistema y configuraciones por usuario.
 *
 * Exporta:
 * - listConfiguraciones(req,res): Listado global (y por usuario si autenticado).
 * - listUserConfigs(req,res): Listado de configuraciones específicas del usuario.
 * - createUserConfig(req,res): Crear configuración para el usuario autenticado.
 * - createConfiguracion(req,res): Crear configuración global (requiere ADMIN).
 * - updateConfiguracion(req,res): Actualizar configuración (global o por usuario).
 * - deleteConfiguracion(req,res): Restablecer o eliminar configuración.
 */
const { response } = require("express");
const AdmConfiguraciones = require("../models/adm_configuraciones");
const Usuario = require("../models/adm_usuarios");

const listConfiguraciones = async (req, res = response) => {
  try {
    const id_usuario = req.uid || null;
    const rows = await AdmConfiguraciones.findAll(id_usuario);
    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("Error listando configuraciones", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const getConfiguracion = async (req, res = response) => {
  try {
    const clave = req.params.clave;
    const forUser = req.query.user === "1";
    const id_usuario = forUser ? req.uid : null;
    const config = await AdmConfiguraciones.findByClave(clave, id_usuario);
    if (!config) {
      return res.status(404).json({ ok: false, msg: "Configuración no encontrada" });
    }
    return res.json({ ok: true, config });
  } catch (error) {
    console.error("Error obteniendo configuración", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

// User-specific configurations: list, create, delete
const listUserConfigs = async (req, res = response) => {
  try {
    const uid = req.uid;
    const rows = await AdmConfiguraciones.findAll(uid);
    // filter only those with id_usuario == uid
    const userRows = rows.filter((r) => r.id_usuario === uid);
    res.json({ ok: true, data: userRows });
  } catch (error) {
    console.error("Error listando configs de usuario", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const createUserConfig = async (req, res = response) => {
  try {
    const uid = req.uid;
    const body = req.body || {};
    if (!body.clave)
      return res.status(400).json({ ok: false, msg: "Clave requerida" });
    const payload = {
      clave: body.clave,
      valor: typeof body.valor !== "undefined" ? body.valor : null,
      descripcion: body.descripcion ?? null,
      tipo: body.tipo ?? "string",
      publico: 0,
      protegido: typeof body.protegido !== "undefined" ? body.protegido : 0,
      id_usuario: uid,
      creado_por: uid,
    };
    const id = await AdmConfiguraciones.create(payload);
    res
      .status(201)
      .json({ ok: true, id, msg: "Configuración de usuario creada" });
  } catch (error) {
    console.error("Error creando config usuario", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const deleteConfiguracion = async (req, res = response) => {
  try {
    const clave = req.params.clave;
    const forUser = req.query.user === "1";
    const id_usuario = forUser ? req.uid : null;
    // simple deletion: delete from table where clave and id_usuario matches
    if (id_usuario === null) {
      // deleting global config — require admin
      const uid = req.uid;
      const esAdmin = uid ? await Usuario.tieneRol(uid, "ADMIN_ROLE") : false;
      if (!esAdmin)
        return res.status(403).json({ ok: false, msg: "Requiere admin" });
    }
    if (id_usuario === null) {
      await AdmConfiguraciones.updateByClave(
        clave,
        { valor: null, protegido: 0 },
        null
      );
      // or optionally delete row — here we null the value
      return res.json({ ok: true, msg: "Configuración global restablecida" });
    }
    // delete user config row
    const db = require("../database/config");
    await db.query(
      "DELETE FROM adm_configuraciones WHERE clave = ? AND id_usuario = ?",
      [clave, id_usuario]
    );
    return res.json({ ok: true, msg: "Configuración de usuario eliminada" });
  } catch (error) {
    console.error("Error eliminando configuración", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const updateConfiguracion = async (req, res = response) => {
  try {
    const clave = req.params.clave;
    // si se pasa query ?user=1 actualizar configuración por usuario
    const forUser = req.query.user === "1";
    const id_usuario = forUser ? req.uid : null;
    const payload = {};
    if (typeof req.body.valor !== "undefined") payload.valor = req.body.valor;
    if (typeof req.body.descripcion !== "undefined")
      payload.descripcion = req.body.descripcion;
    if (typeof req.body.tipo !== "undefined") payload.tipo = req.body.tipo;
    if (typeof req.body.publico !== "undefined")
      payload.publico = req.body.publico;
    if (typeof req.body.protegido !== "undefined")
      payload.protegido = req.body.protegido;
    if (Object.keys(payload).length === 0)
      return res
        .status(400)
        .json({ ok: false, msg: "No hay campos para actualizar" });

    // Si se intenta actualizar configuración global (id_usuario == null) requerir rol ADMIN
    if (!forUser) {
      const uid = req.uid;
      const esAdmin = uid ? await Usuario.tieneRol(uid, "ADMIN_ROLE") : false;
      if (!esAdmin) {
        return res.status(403).json({
          ok: false,
          msg: "Requiere permisos de administrador para actualizar configuración global",
        });
      }
    }

    await AdmConfiguraciones.updateByClave(clave, payload, id_usuario);
    res.json({ ok: true, msg: "Configuración actualizada" });
  } catch (error) {
    console.error("Error actualizando configuración", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const createConfiguracion = async (req, res = response) => {
  try {
    const uid = req.uid;
    const esAdmin = uid ? await Usuario.tieneRol(uid, "ADMIN_ROLE") : false;
    if (!esAdmin)
      return res
        .status(403)
        .json({ ok: false, msg: "Requiere permisos de administrador" });
    const body = req.body || {};
    if (!body.clave)
      return res.status(400).json({ ok: false, msg: "Clave es requerida" });
    const payload = {
      clave: body.clave,
      valor: typeof body.valor !== "undefined" ? body.valor : null,
      descripcion: body.descripcion ?? null,
      tipo: body.tipo ?? "string",
      publico: typeof body.publico !== "undefined" ? body.publico : 1,
      protegido: typeof body.protegido !== "undefined" ? body.protegido : 0,
      creado_por: uid || null,
      id_usuario: null,
    };
    const id = await AdmConfiguraciones.create(payload);
    res.status(201).json({ ok: true, id, msg: "Configuración creada" });
  } catch (error) {
    console.error("Error creando configuración", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

module.exports = {
  listConfiguraciones,
  updateConfiguracion,
  createConfiguracion,
  listUserConfigs,
  createUserConfig,
  deleteConfiguracion,
};
