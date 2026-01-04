/**
 * Controlador: roles.js
 * Propósito: CRUD y gestión de roles (asignación de permisos, consulta de usuarios).
 * Exporta handlers para operaciones sobre roles y utilidades de paginación.
 */
const { parsePagination } = require("../helpers/pagination");

// Endpoint de paginación: recibe desde/hasta o page/per_page
const getRolesPaginados = async (req, res = response) => {
  try {
    let { desde, hasta } = req.query;
    const sortKey = String(req.query.sortKey || "").toLowerCase();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const sortMap = {
      id: "id_rol",
      id_rol: "id_rol",
      nombre: "nombre",
      descripcion: "descripcion",
      id_estado: "id_estado",
    };
    const sortColumn = sortMap[sortKey] || "nombre";
    const { desde: desdeNum, limite, page, per_page } = await parsePagination(req);
    desde = Number(desdeNum);
    const roles = await Rol.listar(desde, limite, sortColumn, sortDir);
    const total = await Rol.contar();
    res.json({
      ok: true,
      roles,
      total,
      desde,
      limite,
      page,
      per_page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener roles paginados",
    });
  }
};
const { response } = require("express");
const Rol = require("../models/adm_roles");

const obtenerRoles = async (req, res = response) => {
  try {
    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    const [roles, total] = await Promise.all([
      Rol.listar(desde, limite, req.db),
      Rol.contar(req.db),
    ]);

    res.json({
      ok: true,
      roles,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener roles",
    });
  }
};

const obtenerRol = async (req, res = response) => {
  try {
    const { id } = req.params;
    const rol = await Rol.obtenerPorId(id, req.db);

    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    // Obtener permisos del rol
    const permisos = await Rol.obtenerPermisos(id, req.db);

    res.json({
      ok: true,
      rol: {
        ...rol,
        permisos,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener rol",
    });
  }
};

const crearRol = async (req, res = response) => {
  try {
    const { nombre, descripcion, id_estado } = req.body;

    // Verificar si ya existe un rol con ese nombre
    const rolExiste = await Rol.obtenerPorNombre(nombre, req.db);
    if (rolExiste) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un rol con ese nombre",
      });
    }

    const idRol = await Rol.crear({
      nombre,
      descripcion,
      id_estado: id_estado ?? 1,
    });

    res.status(201).json({
      ok: true,
      id_rol: idRol,
      msg: "Rol creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear rol",
    });
  }
};

const actualizarRol = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, id_estado } = req.body;

    // Verificar que el rol existe
    const rol = await Rol.obtenerPorId(id, req.db);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    // Verificar si el nuevo nombre ya está en uso por otro rol
    if (nombre !== rol.nombre) {
      const rolExiste = await Rol.obtenerPorNombre(nombre, req.db);
      if (rolExiste && rolExiste.id_rol !== parseInt(id)) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe otro rol con ese nombre",
        });
      }
    }

    await Rol.actualizar(id, {
      nombre,
      descripcion,
      id_estado: id_estado ?? rol.id_estado,
    });

    res.json({
      ok: true,
      msg: "Rol actualizado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar rol",
    });
  }
};

const eliminarRol = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const rol = await Rol.obtenerPorId(id, req.db);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    // Verificar si hay usuarios con este rol
    const usuarios = await Rol.obtenerUsuarios(id, req.db);
    if (usuarios.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: "No se puede eliminar el rol porque tiene usuarios asignados",
      });
    }

    await Rol.eliminar(id, req.db);

    res.json({
      ok: true,
      msg: "Rol eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar rol",
    });
  }
};

const asignarPermisos = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body; // Array de IDs de permisos

    // Verificar que el rol existe
    const rol = await Rol.obtenerPorId(id, req.db);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    await Rol.sincronizarPermisos(id, permisos, req.db);

    res.json({
      ok: true,
      msg: "Permisos asignados exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al asignar permisos",
    });
  }
};

const obtenerPermisosRol = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const rol = await Rol.obtenerPorId(id, req.db);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    const permisos = await Rol.obtenerPermisos(id, req.db);

    res.json({
      ok: true,
      permisos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener permisos del rol",
    });
  }
};

const obtenerUsuariosRol = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const rol = await Rol.obtenerPorId(id, req.db);
    if (!rol) {
      return res.status(404).json({
        ok: false,
        msg: "Rol no encontrado",
      });
    }

    const usuarios = await Rol.obtenerUsuarios(id, req.db);
    res.json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener usuarios del rol",
    });
  }
};

module.exports = {
  obtenerRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  asignarPermisos,
  obtenerPermisosRol,
  obtenerUsuariosRol,
  getRolesPaginados,
};
