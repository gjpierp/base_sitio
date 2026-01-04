/**
 * Middleware: validar-jwt.js
 * Propósito: Extraer y validar JWT de la petición (cookies, Authorization, x-token)
 * y exponer `req.uid`. También provee middlewares auxiliares para roles.
 */
const { response } = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/adm_usuarios");

function getTokenFromRequest(req) {
  // 1) Cookie "token"
  const cookieHeader = req.headers["cookie"] || "";
  if (cookieHeader) {
    const parts = cookieHeader.split(";");
    for (const part of parts) {
      const [k, ...rest] = part.trim().split("=");
      if (k === "token") {
        const v = rest.join("=");
        if (v) return decodeURIComponent(v);
      }
    }
  }
  // 2) Authorization: Bearer <token>
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  if (
    auth &&
    typeof auth === "string" &&
    auth.toLowerCase().startsWith("bearer ")
  ) {
    return auth.substring(7).trim();
  }
  // 3) x-token header
  const xtoken = req.header("x-token");
  if (xtoken && xtoken !== "null" && xtoken !== "undefined") return xtoken;
  return null;
}

const validarJWT = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    const { uid, email } = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = uid;
    req.email = email;

    next();
  } catch (error) {
    console.log("Error validando JWT:", error.message);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }
};

/**
 * Middleware alternativo que permite aceptar un JWT expirado únicamente
 * para casos controlados como la renovación de token. Si el token está
 * expirado pero la firma es válida, expone `req.uid` y marca
 * `req.tokenExpired = true` para que el controlador pueda decidir.
 */
const validarJWTFlexible = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res
      .status(401)
      .json({ ok: false, msg: "No hay token en la petición" });
  }

  try {
    const { uid, email } = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = uid;
    req.email = email;
    req.tokenExpired = false;
    return next();
  } catch (error) {
    // Si el error es sólo que el token expiró, intentar recuperar payload
    if (error && error.name === "TokenExpiredError") {
      try {
        const { uid, email } = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });
        req.uid = uid;
        req.email = email;
        req.tokenExpired = true;
        return next();
      } catch (err2) {
        console.log("Error validando JWT ignorando expiración:", err2.message);
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(401).json({ ok: false, msg: "Token no válido" });
      }
    }

    console.log("Error validando JWT:", error.message);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(401).json({ ok: false, msg: "Token no válido" });
  }
};

const validarAdminRole = async (req, res, next) => {
  const uid = req.uid;
  try {
    const usuarioResult = await Usuario.obtenerPorId(uid);
    if (!usuarioResult || usuarioResult.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no existe",
      });
    }
    // Verificar rol ADMIN_ROLE desde tablas relacionales
    const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
    if (!esAdmin) {
      return res.status(403).json({
        ok: false,
        msg: "No tiene privilegios para hacer eso",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const validarAdminRole_O_MismoUsuario = async (req, res, next) => {
  const uid = req.uid;
  const id = req.params.id;
  try {
    const usuarioResult = await Usuario.obtenerPorId(uid);
    if (!usuarioResult || usuarioResult.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no existe",
      });
    }
    const esAdmin = await Usuario.tieneRol(uid, "ADMIN_ROLE");
    if (esAdmin || String(uid) === String(id)) {
      return next();
    }
    return res.status(403).json({
      ok: false,
      msg: "No tiene privilegios para hacer eso",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  validarJWT,
  validarJWTFlexible,
  validarAdminRole,
  validarAdminRole_O_MismoUsuario,
};
