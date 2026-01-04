/**
 * Controlador: permisos.js
 * Propósito: Gestionar permisos del sistema (CRUD, listado paginado y relaciones).
 * Exporta handlers para obtener, crear, actualizar y eliminar permisos, así
 * como utilidades para obtener roles/menus asociados.
 */
const { parsePagination } = require("../helpers/pagination");

// Endpoint de paginación: recibe desde/hasta o page/per_page
const getPermisosPaginados = async (req, res = response) => {
  try {
    let { desde, hasta } = req.query;
    const sortKey = String(req.query.sortKey || "").toLowerCase();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const sortMap = {
      id: "id_permiso",
      id_permiso: "id_permiso",
      codigo: "nombre",
      nombre: "nombre",
      descripcion: "descripcion",
    };
    const sortColumn = sortMap[sortKey] || "nombre";
    const { desde: desdeNum, limite, page, per_page } = await parsePagination(req);
    const desdeNumN = Number(desdeNum);
    const permisos = await Permiso.listar(desdeNumN, limite, sortColumn, sortDir);
    const total = await Permiso.contar();
    res.json({
      ok: true,
      permisos,
      total,
      desde: desdeNumN,
      limite,
      page,
      per_page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener permisos paginados",
    });
  }
};
const { response } = require("express");
const Permiso = require("../models/adm_permisos");

const obtenerPermisos = async (req, res = response) => {
  try {
    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    const [permisos, total] = await Promise.all([
      Permiso.listar(desde, limite, req.db),
      Permiso.contar(req.db),
    ]);

    res.json({
      ok: true,
      permisos,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener permisos",
    });
  }
};

const obtenerPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;
    const permiso = await Permiso.obtenerPorId(id, req.db);

    if (!permiso) {
      return res.status(404).json({
        ok: false,
        msg: "Permiso no encontrado",
      });
    }

    // Obtener roles que tienen este permiso
    const roles = await Permiso.obtenerRoles(id, req.db);

    res.json({
      ok: true,
      permiso: {
        ...permiso,
        roles,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener permiso",
    });
  }
};

const crearPermiso = async (req, res = response) => {
  try {
    const { nombre, descripcion } = req.body;

    // Verificar si ya existe un permiso con ese nombre
    const permisoExiste = await Permiso.obtenerPorCodigo(nombre, req.db);
    if (permisoExiste) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un permiso con ese nombre",
      });
    }

    const idPermiso = await Permiso.crear(nombre, descripcion, req.db);

    res.status(201).json({
      ok: true,
      id_permiso: idPermiso,
      msg: "Permiso creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear permiso",
    });
  }
};

const actualizarPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { codigo, descripcion } = req.body;

    // Verificar que el permiso existe
    const permiso = await Permiso.obtenerPorId(id, req.db);
    if (!permiso) {
      return res.status(404).json({
        ok: false,
        msg: "Permiso no encontrado",
      });
    }

    // Verificar si el nuevo nombre ya está en uso por otro permiso
    if (codigo !== permiso.codigo) {
      const permisoExiste = await Permiso.obtenerPorCodigo(codigo, req.db);
      if (permisoExiste && permisoExiste.id_permiso !== parseInt(id)) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe otro permiso con ese nombre",
        });
      }
    }

    await Permiso.actualizar(id, codigo, descripcion, req.db);

    res.json({
      ok: true,
      msg: "Permiso actualizado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar permiso",
    });
  }
};

const eliminarPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el permiso existe
    const permiso = await Permiso.obtenerPorId(id, req.db);
    if (!permiso) {
      return res.status(404).json({
        ok: false,
        msg: "Permiso no encontrado",
      });
    }

    await Permiso.eliminar(id, req.db);

    res.json({
      ok: true,
      msg: "Permiso eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar permiso",
    });
  }
};

const obtenerRolesPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el permiso existe
    const permiso = await Permiso.obtenerPorId(id, req.db);
    if (!permiso) {
      return res.status(404).json({
        ok: false,
        msg: "Permiso no encontrado",
      });
    }

    const roles = await Permiso.obtenerRoles(id, req.db);

    res.json({
      ok: true,
      roles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener roles del permiso",
    });
  }
};

const obtenerMenusPermiso = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el permiso existe
    const permiso = await Permiso.obtenerPorId(id, req.db);
    if (!permiso) {
      return res.status(404).json({
        ok: false,
        msg: "Permiso no encontrado",
      });
    }

    let menus = await Permiso.obtenerMenus(id, req.db);
    // Asegurar que id_menu esté al final de cada objeto
    menus = menus.map(({ id_menu, ...rest }) => ({ ...rest, id_menu }));

    res.json({
      ok: true,
      menus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener menús del permiso",
    });
  }
};

module.exports = {
  obtenerPermisos,
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
  obtenerRolesPermiso,
  obtenerMenusPermiso,
  getPermisosPaginados,
};
