/**
 * Middleware: validar-permisos.js
 * Propósito: Comprobar que el usuario autenticado posee permisos/roles
 * necesarios para acceder a un recurso. Exporta helpers como validarRol y
 * otros verificadores de permisos.
 */
const { response } = require("express");
const Usuario = require("../models/adm_usuarios");

const validarPermiso = (...permisosRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res.status(401).json({
        ok: false,
        msg: "No hay token en la petición",
      });
    }

    try {
      const permisos = await Usuario.obtenerPermisos(uid);
      const nombresPermisos = permisos.map((p) => p.nombre);
      const codigosPermisos = permisos.map((p) => p.codigo);
      const tienePermiso = permisosRequeridos.some(
        (permiso) =>
          nombresPermisos.includes(permiso) || codigosPermisos.includes(permiso)
      );

      if (!tienePermiso) {

        return res.status(403).json({
          ok: false,
          msg: "No tiene permisos suficientes para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        msg: "Error al validar permisos",
      });
    }
  };
};

const validarRol = (...rolesRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res.status(401).json({
        ok: false,
        msg: "No hay token en la petición",
      });
    }

    try {
      const roles = await Usuario.obtenerRoles(uid);
      const nombresRoles = roles.map((r) => r.nombre);

      const tieneRol = rolesRequeridos.some((rol) =>
        nombresRoles.includes(rol)
      );

      if (!tieneRol) {
        return res.status(403).json({
          ok: false,
          msg: "No tiene el rol necesario para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        msg: "Error al validar rol",
      });
    }
  };
};

const validarPermisoOAdmin = (...permisosRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res.status(401).json({
        ok: false,
        msg: "No hay token en la petición",
      });
    }

    try {
      const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
      if (esAdmin) {
        return next();
      }

      const permisos = await Usuario.obtenerPermisos(uid);
      const codigosPermisos = permisos.map((p) => p.codigo);

      const tienePermiso = permisosRequeridos.some((permiso) =>
        codigosPermisos.includes(permiso)
      );

      if (!tienePermiso) {
        return res.status(403).json({
          ok: false,
          msg: "No tiene permisos suficientes para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        ok: false,
        msg: "Error al validar permisos",
      });
    }
  };
};

module.exports = {
  validarPermiso,
  validarRol,
  validarPermisoOAdmin,
};
