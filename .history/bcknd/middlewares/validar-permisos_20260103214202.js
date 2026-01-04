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

      // Allow admins to bypass permission checks
      const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
      if (esAdmin) {
        console.debug(
          "[validarPermiso] uid=",
          uid,
          "esAdmin=true — permitiendo bypass"
        );
        return next();
      }
      // Also log roles for debugging
      try {
        const rolesUsuario = await Usuario.obtenerRoles(uid);
        console.debug(
          "[validarPermiso] rolesUsuario=",
          rolesUsuario.map((r) => r.nombre)
        );
      } catch (e) {
        // ignore
      }
      const tienePermiso = permisosRequeridos.some(
        (permiso) =>
          nombresPermisos.includes(permiso) || codigosPermisos.includes(permiso)
      );

      if (!tienePermiso) {
        console.debug(
          "[validarPermiso] uid=",
          uid,
          "permisos=",
          nombresPermisos,
          codigosPermisos,
          "requeridos=",
          permisosRequeridos
        );
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
      // Build a set of all known identifiers for the user's permissions
      const permisoIdents = new Set();
      permisos.forEach((p) => {
        if (!p) return;
        const push = (v) => {
          if (v === undefined || v === null) return;
          permisoIdents.add(String(v).toUpperCase());
        };
        push(p.nombre);
        push(p.codigo);
        push(p.clave);
        push(p.slug);
        // also include id and any numeric codes
        if (typeof p.id_permiso !== 'undefined') push(p.id_permiso);
        if (typeof p.id !== 'undefined') push(p.id);
      });


    try {
      const roles = await Usuario.obtenerRoles(uid);
      const nombresRoles = roles.map((r) => r.nombre);

      const tieneRol = rolesRequeridos.some((rol) =>
        nombresRoles.includes(rol)
      );

      if (!tieneRol) {
        console.debug(
          "[validarRol] uid=",
          uid,
          "roles=",
          nombresRoles,
          "requeridos=",
          rolesRequeridos
        );
        return res.status(403).json({
          ok: false,
      const tienePermiso = permisosRequeridos.some((permiso) =>
        permisoIdents.has(String(permiso).toUpperCase())
      );
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
        console.debug(
          "[validarPermisoOAdmin] uid=",
          uid,
          "esAdmin=",
          esAdmin,
          "permisos=",
          codigosPermisos,
          "requeridos=",
          permisosRequeridos
        );
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
