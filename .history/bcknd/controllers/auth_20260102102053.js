/**
 * Controlador: auth.js
 * Propósito: Manejar autenticación, inicio de sesión (local, Google, Facebook)
 * y renovación de tokens. También expone endpoints para obtener/actualizar
 * el perfil del usuario autenticado.
 *
 * Funciones exportadas / handlers principales:
 * - login(req,res): Autenticación tradicional con correo + contraseña.
 * - googleSignIn(req,res): Autenticación mediante token de Google.
 * - facebookSignIn(req,res): Autenticación mediante token de Facebook.
 * - renewToken(req,res): Renovación de JWT del usuario autenticado.
 * - getProfile(req,res): Obtener perfil del usuario autenticado.
 * - updateProfile(req,res): Actualizar campos permitidos del perfil.
 */
const { response } = require("express");
const bcrypt = require("bcryptjs");

const AdmUsuario = require("../models/adm_usuarios");
const AdmUsuarioRol = require("../models/adm_usuarios_roles");
const AdmRol = require("../models/adm_roles");
const AdmRolPermiso = require("../models/adm_roles_permisos");
const AdmPermiso = require("../models/adm_permisos");
const { generarJWT } = require("../helpers/jwt");
const { googleVerify } = require("../helpers/google-verify");
const { facebookVerify } = require("../helpers/facebook-verify");
const { getMenuFrontendUsuario } = require("../helpers/menu-frontend");
const { getCookieSettings } = require("../helpers/cookies");

// Opciones de cookie parametrizables por variables de entorno
const cookieCfg = getCookieSettings();

const AdmHistorialAcceso = require("../models/adm_historial_accesos");
const AdmHistorialAccion = require("../models/adm_historial_acciones");

const login = async (req, res = response) => {
  // Permitir ambos campos: correo y correo_electronico
  const correo = req.body.correo || req.body.correo_electronico;
  const { contrasena } = req.body;
  try {
    const usuario = await AdmUsuario.obtenerPorCorreo(correo);
    if (!usuario) {
      // Registrar intento fallido en historial de accesos (usuario desconocido: usar 0)
      await AdmHistorialAcceso.create({
        id_usuario: 0,
        fecha_entrada: new Date(),
        fecha_salida: null,
        direccion_ip:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        user_agent: req.headers["user-agent"] || null,
      });
      return res.status(404).json({ ok: false, msg: "Email no encontrado" });
    }
    // Si el usuario está bloqueado, denegar
    if (usuario.bloqueado) {
      return res.status(403).json({
        ok: false,
        msg: "Usuario bloqueado por intentos fallidos. Contacte al administrador.",
      });
    }
    const validPassword = bcrypt.compareSync(
      contrasena,
      usuario.hash_contrasena
    );
    if (!validPassword) {
      // Registrar intento fallido en historial de accesos
      await AdmHistorialAcceso.create({
        id_usuario: usuario.id_usuario,
        fecha_entrada: new Date(),
        fecha_salida: null,
        direccion_ip:
          req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        user_agent: req.headers["user-agent"] || null,
      });
      // Contar intentos fallidos en los últimos 30 minutos
      const desde = new Date(Date.now() - 30 * 60 * 1000);
      const intentos = await AdmHistorialAcceso.search(
        {
          id_usuario: usuario.id_usuario,
          fecha_desde: desde.toISOString().slice(0, 19).replace("T", " "),
        },
        0,
        100
      );
      if (intentos.length >= 5) {
        // Bloquear usuario
        await AdmUsuario.update(usuario.id_usuario, { bloqueado: 1 });
        // Registrar acción de bloqueo
        await AdmHistorialAccion.create({
          id_usuario: usuario.id_usuario,
          accion: "BLOQUEO_AUTOMATICO",
          descripcion:
            "Usuario bloqueado por exceder 5 intentos fallidos de login en 30 minutos",
          fecha: new Date(),
          direccion_ip:
            req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        });
        return res.status(403).json({
          ok: false,
          msg: "Usuario bloqueado por intentos fallidos. Contacte al administrador.",
        });
      }
      return res.status(400).json({ ok: false, msg: "Contraseña no válida" });
    }
    // Si el login es exitoso, registrar acceso exitoso
    await AdmHistorialAcceso.create({
      id_usuario: usuario.id_usuario,
      fecha_entrada: new Date(),
      fecha_salida: null,
      direccion_ip:
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      user_agent: req.headers["user-agent"] || null,
    });
    // Si estaba bloqueado pero logra login (caso improbable), desbloquear
    if (usuario.bloqueado) {
      await AdmUsuario.update(usuario.id_usuario, { bloqueado: 0 });
    }
    // Obtener roles
    const roles = await AdmUsuario.obtenerRolesPorUsuario(usuario.id_usuario);
    const permisos = await AdmUsuario.obtenerPermisosPorUsuario(
      usuario.id_usuario
    );
    // JWT y respuesta
    const token = await generarJWT(usuario.id_usuario, usuario.correo);
    const menu = await getMenuFrontendUsuario(usuario.id_usuario);
    res.cookie(cookieCfg.name, token, cookieCfg.options);
    res.json({
      ok: true,
      token,
      menu,
      roles,
      permisos,
      msg: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const googleSignIn = async (req, res = response) => {
  const googleToken = req.body.token;
  if (!googleToken) {
    return res
      .status(400)
      .json({ ok: false, msg: "Token de Google no proporcionado" });
  }
  try {
    const { name, email, picture } = await googleVerify(googleToken);
    if (!email) {
      return res.status(400).json({
        ok: false,
        msg: "No se pudo obtener el email de Google",
      });
    }
    let usuarioDB = await AdmUsuario.obtenerPorCorreo(email);
    let usuarioId;
    let usuarioData;
    if (!usuarioDB) {
      // Crear nuevo usuario Google
      const nuevoUsuario = {
        nombre_usuario: email.split("@")[0],
        correo: email,
        hash_contrasena: "@@@",
        id_tipo_usuario: 2, // Asignar tipo Google si aplica
        id_estado: 1, // Activo
        google: true,
        img: picture || null,
      };
      const resultado = await AdmUsuario.create(nuevoUsuario);
      usuarioId = resultado.insertId || resultado.id_usuario;
      usuarioData = { id_usuario: usuarioId, ...nuevoUsuario };
    } else {
      usuarioId = usuarioDB.id_usuario;
      usuarioData = { ...usuarioDB };
      // Actualizar si no tenía google
      if (!usuarioDB.google) {
        await AdmUsuario.update(usuarioId, {
          google: true,
          img: picture || usuarioDB.img,
        });
      }
    }
    // Obtener roles y permisos
    const roles = await AdmUsuario.obtenerRolesPorUsuario(usuarioId);
    const permisos = await AdmUsuario.obtenerPermisosPorUsuario(usuarioId);
    const token = await generarJWT(usuarioId, email);
    const menu = await getMenuFrontendUsuario(usuarioId);
    res.cookie(cookieCfg.name, token, cookieCfg.options);
    res.json({
      ok: true,
      token,
      usuario: usuarioData,
      menu,
      roles,
      permisos,
      msg: "Inicio de sesión con Google exitoso",
    });
  } catch (error) {
    console.error("Error en googleSignIn:", error);
    res.status(401).json({
      ok: false,
      msg: "Token de Google no válido o expirado",
      error: error.message,
    });
  }
};

const facebookSignIn = async (req, res = response) => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      ok: false,
      msg: "Token de Facebook no proporcionado",
    });
  }
  try {
    const { name, email, picture, facebookId } = await facebookVerify(
      accessToken
    );
    if (!email) {
      return res.status(400).json({
        ok: false,
        msg: "No se pudo obtener el email de Facebook. Asegúrate de dar permiso de email.",
      });
    }
    let usuarioDB = await AdmUsuario.obtenerPorCorreo(email);
    let usuarioId;
    let usuarioData;
    if (!usuarioDB) {
      // Crear nuevo usuario Facebook
      const nuevoUsuario = {
        nombre_usuario: email.split("@")[0],
        correo: email,
        hash_contrasena: "@@@",
        id_tipo_usuario: 3, // Asignar tipo Facebook si aplica
        id_estado: 1, // Activo
        facebook: true,
        img: picture || null,
      };
      const resultado = await AdmUsuario.create(nuevoUsuario);
      usuarioId = resultado.insertId || resultado.id_usuario;
      usuarioData = { id_usuario: usuarioId, ...nuevoUsuario };
    } else {
      usuarioId = usuarioDB.id_usuario;
      usuarioData = { ...usuarioDB };
      // Actualizar si no tenía facebook
      if (!usuarioDB.facebook) {
        await AdmUsuario.update(usuarioId, {
          facebook: true,
          img: picture || usuarioDB.img,
        });
      }
    }
    // Obtener roles y permisos
    const roles = await AdmUsuario.obtenerRolesPorUsuario(usuarioId);
    const permisos = await AdmUsuario.obtenerPermisosPorUsuario(usuarioId);
    const token = await generarJWT(usuarioId, email);
    const menu = await getMenuFrontendUsuario(usuarioId);
    res.cookie(cookieCfg.name, token, cookieCfg.options);
    res.json({
      ok: true,
      token,
      usuario: usuarioData,
      menu,
      roles,
      permisos,
      msg: "Inicio de sesión con Facebook exitoso",
    });
  } catch (error) {
    console.error("Error en facebookSignIn:", error);
    res.status(401).json({
      ok: false,
      msg: "Token de Facebook no válido o expirado",
      error: error.message,
    });
  }
};

const renewToken = async (req, res = response) => {
  const uid = req.uid;
  try {
    // Obtener el usuario autenticado
    const usuario = await AdmUsuario.obtenerPorId(uid);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }
    // Obtener roles
    const roles = await AdmUsuario.obtenerRolesPorUsuario(usuario.id_usuario);
    const permisos = await AdmUsuario.obtenerPermisosPorUsuario(
      usuario.id_usuario
    );
    // JWT y respuesta
    const token = await generarJWT(usuario.id_usuario, usuario.correo);
    const menu = await getMenuFrontendUsuario(usuario.id_usuario);
    res.cookie(cookieCfg.name, token, cookieCfg.options);
    res.status(200).json({
      ok: true,
      token,
      menu,
      roles,
      permisos,
      msg: "Token renovado exitosamente",
    });
  } catch (error) {
    console.error("Error renovando token:", error);
    res.status(500).json({ ok: false, msg: "Error renovando el token" });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res = response) => {
  const uid = req.uid;
  try {
    const usuario = await AdmUsuario.obtenerPorId(uid);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }
    // Normalizar salida para el frontend
    const user = {
      id_usuario: usuario.id_usuario,
      nombres: usuario.nombres ?? usuario.nombre_usuario ?? "",
      apellidos: usuario.apellidos ?? "",
      correo_electronico: usuario.correo ?? "",
      img: usuario.img || null,
    };
    return res.json({ ok: true, user });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

// Actualizar perfil del usuario autenticado (no permite cambiar correo aquí)
const updateProfile = async (req, res = response) => {
  const uid = req.uid;
  try {
    const payload = {};
    if (typeof req.body.nombres !== "undefined")
      payload.nombres = req.body.nombres;
    if (typeof req.body.apellidos !== "undefined")
      payload.apellidos = req.body.apellidos;
    // No permitimos actualizar el correo por seguridad desde este endpoint
    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ ok: false, msg: "No hay campos válidos para actualizar" });
    }
    await AdmUsuario.update(uid, payload);
    const usuarioActualizado = await AdmUsuario.obtenerPorId(uid);
    const user = {
      id_usuario: usuarioActualizado.id_usuario,
      nombres:
        usuarioActualizado.nombres ?? usuarioActualizado.nombre_usuario ?? "",
      apellidos: usuarioActualizado.apellidos ?? "",
      correo_electronico: usuarioActualizado.correo ?? "",
      img: usuarioActualizado.img || null,
    };
    return res.json({ ok: true, user, msg: "Perfil actualizado" });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

// Cierre de sesión (stateless): limpia cookie si existe y sugiere redirección
const logout = async (req, res = response) => {
  try {
    // Limpiar cookie con misma config (nombre/sameSite/secure/path/domain)
    const clearOpts = { ...cookieCfg.options };
    // clearCookie ignora maxAge; mantener resto para que coincida la firma
    delete clearOpts.maxAge;
    res.clearCookie(cookieCfg.name, clearOpts);

    // Si el cliente espera HTML, redirigimos directamente
    if (req.accepts(["html"]) && !req.accepts(["json"])) {
      return res.redirect(302, "/");
    }

    return res.status(200).json({
      ok: true,
      msg: "Sesión cerrada",
      redirect: "/",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error en el servidor",
    });
  }
}; // Registro de usuario con contraseña segura
const registro = async (req, res = response) => {
  const { correo, contrasena, nombre_usuario } = req.body;
  if (!correo || !contrasena || !nombre_usuario) {
    return res
      .status(400)
      .json({ ok: false, msg: "Faltan datos obligatorios" });
  }
  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = (await AdmUsuario.findAll()).find(
      (u) => u.correo === correo
    );
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ ok: false, msg: "El correo ya está registrado" });
    }
    // Hashear la contraseña
    const hash_contrasena = bcrypt.hashSync(contrasena, 10);
    // Crear usuario
    const nuevoUsuario = {
      nombre_usuario,
      correo,
      hash_contrasena,
      id_tipo_usuario: 1, // tipo normal
      id_estado: 1, // activo
    };
    const resultado = await AdmUsuario.create(nuevoUsuario);
    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado exitosamente",
      usuario: resultado,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

// Cambio de contraseña seguro
const cambiarContrasena = async (req, res = response) => {
  const { correo, contrasena_actual, contrasena_nueva } = req.body;
  if (!correo || !contrasena_actual || !contrasena_nueva) {
    return res
      .status(400)
      .json({ ok: false, msg: "Faltan datos obligatorios" });
  }
  try {
    const usuario = (await AdmUsuario.findAll()).find(
      (u) => u.correo === correo
    );
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }
    // Validar contraseña actual
    const validPassword = bcrypt.compareSync(
      contrasena_actual,
      usuario.hash_contrasena
    );
    if (!validPassword) {
      return res
        .status(400)
        .json({ ok: false, msg: "Contraseña actual incorrecta" });
    }
    // Hashear nueva contraseña
    const hash_contrasena = bcrypt.hashSync(contrasena_nueva, 10);
    // Actualizar usuario
    await AdmUsuario.update(usuario.id_usuario, { hash_contrasena });
    return res.json({ ok: true, msg: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en cambio de contraseña:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

module.exports = {
  login,
  logout,
  googleSignIn,
  facebookSignIn,
  renewToken,
  registro,
  cambiarContrasena,
  getProfile,
  updateProfile,
};
