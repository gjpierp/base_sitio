/**
 * Middleware: validar-permisos.js
 * Propósito: Comprobar que el usuario autenticado posee permisos/roles
 * necesarios para acceder a un recurso. Exporta helpers como validarRol y
 * otros verificadores de permisos.
 */
const { response } = require("express");
const Usuario = require("../models/adm_usuarios");

const buildPermisoIdents = (permisos) => {
  const s = new Set();
  (permisos || []).forEach((p) => {
    if (!p) return;
    const push = (v) => {
      if (v === undefined || v === null) return;
      s.add(String(v).toUpperCase());
    };
    push(p.nombre);
    push(p.codigo);
    push(p.clave);
    push(p.slug);
    if (typeof p.id_permiso !== "undefined") push(p.id_permiso);
    if (typeof p.id !== "undefined") push(p.id);
  });
  return s;
};

const validarPermiso = (...permisosRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res
        .status(401)
        .json({ ok: false, msg: "No hay token en la petición" });
    }

    try {
      const permisos = await Usuario.obtenerPermisos(uid);
      const permisoIdents = buildPermisoIdents(permisos);

      // Allow admins to bypass permission checks
      const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
      if (esAdmin) {
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

      const tienePermiso = permisosRequeridos.some((permiso) =>
        permisoIdents.has(String(permiso).toUpperCase())
      );

      if (!tienePermiso) {
        console.debug(
          "[validarPermiso] uid=",
          uid,
          "permisos=",
          Array.from(permisoIdents),
          "requeridos=",
          permisosRequeridos
        );
        return res
          .status(403)
          .json({
            ok: false,
            msg: "No tiene permisos suficientes para realizar esta acción",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Error al validar permisos" });
    }
  };
};

const validarRol = (...rolesRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res
        .status(401)
        .json({ ok: false, msg: "No hay token en la petición" });
    }

    try {
      const roles = await Usuario.obtenerRoles(uid);
      const nombresRoles = (roles || []).map((r) => String(r.nombre));

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
        return res
          .status(403)
          .json({
            ok: false,
            msg: "No tiene el rol necesario para realizar esta acción",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Error al validar rol" });
    }
  };
};

const validarPermisoOAdmin = (...permisosRequeridos) => {
  return async (req, res = response, next) => {
    const uid = req.uid;

    if (!uid) {
      return res
        .status(401)
        .json({ ok: false, msg: "No hay token en la petición" });
    }

    try {
      const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
      if (esAdmin) return next();

      const permisos = await Usuario.obtenerPermisos(uid);
      const permisoIdents = buildPermisoIdents(permisos);

      const tienePermiso = permisosRequeridos.some((permiso) =>
        permisoIdents.has(String(permiso).toUpperCase())
      );

      if (!tienePermiso) {
        console.debug(
          "[validarPermisoOAdmin] uid=",
          uid,
          "esAdmin=",
          esAdmin,
          "permisos=",
          Array.from(permisoIdents),
          "requeridos=",
          permisosRequeridos
        );
        return res
          .status(403)
          .json({
            ok: false,
            msg: "No tiene permisos suficientes para realizar esta acción",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Error al validar permisos" });
    }
  };
};

module.exports = {
  validarPermiso,
  validarRol,
  validarPermisoOAdmin,
};
