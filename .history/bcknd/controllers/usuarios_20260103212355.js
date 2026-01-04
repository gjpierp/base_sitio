/**
 * Controlador: usuarios.js
 * Propósito: Endpoints para gestionar usuarios (CRUD, cambio/reset de contraseña,
 * asignaciones, listados paginados y seguridad). Contiene las funciones
 * utilizadas por las rutas de `api/usuarios`.
 *
 * Funciones destacadas:
 * - getUsuarios / listarUsuarios: listados y paginación.
 * - getUsuarioPorId: obtener usuario por id.
 * - crearUsuario / actualizarUsuario / borrarUsuario: operaciones CRUD.
 * - cambiarContrasena / resetearContrasena: operaciones de seguridad y auditoría.
 */
const { response } = require("express");
const bcrypt = require("bcryptjs");

const Usuario = require("../models/adm_usuarios");
const { generarJWT } = require("../helpers/jwt");
const { getMenuFrontendUsuario } = require("../helpers/menu-frontend");
const { parsePagination } = require("../helpers/pagination");

const getUsuarios = async (req, res) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const [usuarios, total] = await Promise.all([
      Usuario.listar(desde, limite),
      Usuario.contar(),
    ]);

    const sanitizeUser = (u) => {
      if (!u) return u;
      const out = { ...(Array.isArray(u) ? u[0] : u) };
      // eliminar campos sensibles si existen
      delete out.contrasena;
      delete out.hash_contrasena;
      delete out.password;
      delete out.hash;
      return out;
    };

    const safeUsuarios = Array.isArray(usuarios)
      ? usuarios.map((x) => {
          const o = { ...x };
          delete o.contrasena;
          delete o.hash_contrasena;
          delete o.password;
          delete o.hash;
          return o;
        })
      : usuarios;

    res.json({
      ok: true,
      usuarios: safeUsuarios,
      total,
      page,
      per_page,
      desde,
      limite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener usuarios",
    });
  }
};

const getUsuarioPorId = async (req, res = response) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.obtenerPorId(id);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }
    // Si el modelo devuelve un array, tomar el primer elemento
    const u = Array.isArray(usuario) ? usuario[0] || null : usuario;
    if (u) {
      const safe = { ...u };
      delete safe.contrasena;
      delete safe.hash_contrasena;
      delete safe.password;
      delete safe.hash;
      return res.json({ ok: true, usuario: safe });
    }
    return res.json({ ok: true, usuario: null });
  } catch (error) {
    console.error("Error al obtener usuario por id", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const { desde, limite, page, per_page } = await parsePagination(req);
    const results = await Usuario.listar(desde, limite);
    const safe = Array.isArray(results)
      ? results.map((r) => {
          const o = { ...r };
          delete o.contrasena;
          delete o.hash_contrasena;
          delete o.password;
          delete o.hash;
          return o;
        })
      : results;
    res
      .status(200)
      .send({ ok: true, data: safe, page, per_page, desde, limite });
  } catch (err) {
    res.status(500).send(err);
  }
};

const crearUsuario = async (req, res = response) => {
  // Accept several alias names from clients (frontends or API consumers)
  const body = req.body || {};
  const correo_electronico =
    body.correo_electronico || body.correo || body.email;
  const contrasena = body.contrasena || body.password;
  let id_rol = body.id_rol || body.rol || body.role || body.idRol || body.idRol;
  let id_jerarquia =
    body.id_jerarquia || body.jerarquia || body.jerarquiaId || body.idJerarquia;
  let id_tipo_usuario =
    body.id_tipo_usuario ||
    body.tipoUsuario ||
    body.idTipoUsuario ||
    body.id_tipoUsuario ||
    body.tipo_usuario;

  // Normalize numeric strings to numbers when possible
  if (typeof id_rol === "string" && id_rol.trim() !== "")
    id_rol = Number(id_rol);
  if (typeof id_jerarquia === "string" && id_jerarquia.trim() !== "")
    id_jerarquia = Number(id_jerarquia);
  if (typeof id_tipo_usuario === "string" && id_tipo_usuario.trim() !== "")
    id_tipo_usuario = Number(id_tipo_usuario);

  try {
    // Validar que se envíen rol, jerarquía y tipo de usuario
    if (!id_rol || !id_jerarquia || !id_tipo_usuario) {
      return res.status(400).json({
        ok: false,
        msg: "El rol, la jerarquía y el tipo de usuario son obligatorios",
      });
    }

    // Validar que el tipo de usuario exista
    const AdmTipoUsuario = require("../models/adm_tipos_usuario");
    const tipoUsuario = await AdmTipoUsuario.findById(id_tipo_usuario);
    if (!tipoUsuario) {
      return res.status(400).json({
        ok: false,
        msg: "El tipo de usuario especificado no existe",
      });
    }

    const existeEmail = await Usuario.obtenerPorCorreo(correo_electronico);
    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya está registrado",
      });
    }

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    const contrasenaHash = bcrypt.hashSync(contrasena, salt);

    // Mapear correo_electronico a correo y asegurar campos requeridos
    const usuarioData = {
      nombre_usuario: req.body.nombre_usuario,
      correo: correo_electronico,
      hash_contrasena: contrasenaHash,
      id_tipo_usuario,
      id_estado: req.body.id_estado || 1,
    };

    // Guardar usuario
    const insertId = await Usuario.create(usuarioData);

    // Asociar rol
    const AdmUsuarioRol = require("../models/adm_usuarios_roles");
    await AdmUsuarioRol.create({ id_usuario: insertId, id_rol });

    // Asociar jerarquía
    const AdmUsuarioJerarquia = require("../models/adm_usuarios_jerarquias");
    await AdmUsuarioJerarquia.create({ id_usuario: insertId, id_jerarquia });

    // Generar el TOKEN - JWT
    const token = await generarJWT(insertId, correo_electronico);

    // Cargar menú y seguridad desde BDD
    const menu = await getMenuFrontendUsuario(insertId);
    const roles = await Usuario.obtenerRoles(insertId);
    const permisos = await Usuario.obtenerPermisos(insertId);

    // Obtener jerarquía
    const AdmUsuarioJerarquiaExt = require("../models/adm_usuarios_jerarquia_ext");
    const jerarquia = await AdmUsuarioJerarquiaExt.obtenerJerarquiaPorUsuario(
      insertId
    );

    const respUsuario = {
      id_usuario: insertId,
      ...(req.body || {}),
    };
    // eliminar campos sensibles
    delete respUsuario.contrasena;
    delete respUsuario.hash_contrasena;
    delete respUsuario.password;
    delete respUsuario.hash;

    res.json({
      ok: true,
      usuario: respUsuario,
      token,
      menu,
      roles,
      permisos,
      jerarquia,
      msg: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado... revisar logs",
    });
  }
};

const actualizarUsuario = async (req, res = response) => {
  // Si el body incluye campos de roles o permisos, solo admin puede modificarlos
  const camposRoles = ["roles", "permisos", "id_rol", "id_permisos"];
  const camposEnRequest = Object.keys(req.body);
  const modificaRolesOPermisos = camposEnRequest.some((k) =>
    camposRoles.includes(k)
  );
  if (modificaRolesOPermisos) {
    // Verificar si el usuario autenticado es admin
    const esAdmin = await Usuario.tieneRol(req.uid, "ADMIN_ROLE");
    if (!esAdmin) {
      return res.status(403).json({
        ok: false,
        msg: "Solo el usuario admin puede modificar roles o permisos de otros usuarios",
      });
    }
  }
  const uid = req.params.id;

  try {
    const usuario = await Usuario.obtenerPorId(uid);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario por ese id",
      });
    }

    // Excluir correo y contrasena de la actualización
    const { correo, contrasena, hash_contrasena, ...campos } = req.body;
    // Mantener el correo original y no permitir cambiarlo aquí
    const datosActualizacion = { ...usuario, ...campos };
    datosActualizacion.correo = usuario.correo;
    // Eliminar cualquier intento de cambiar la contraseña
    delete datosActualizacion.contrasena;
    delete datosActualizacion.hash_contrasena;
    await Usuario.update(uid, datosActualizacion);
    const usuarioActualizado = await Usuario.obtenerPorId(uid);
    // Sanitizar campos sensibles antes de devolver
    const u = Array.isArray(usuarioActualizado)
      ? usuarioActualizado[0] || null
      : usuarioActualizado;
    if (u) {
      const safe = { ...u };
      delete safe.contrasena;
      delete safe.hash_contrasena;
      delete safe.password;
      delete safe.hash;
      return res.json({
        ok: true,
        usuario: safe,
        msg: "Usuario actualizado exitosamente",
      });
    }
    return res.json({
      ok: true,
      usuario: null,
      msg: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

const borrarUsuario = async (req, res = response) => {
  const uid = req.params.id;

  try {
    const usuarioDB = await Usuario.obtenerPorId(uid);

    if (!usuarioDB || usuarioDB.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario por ese id",
      });
    }

    await Usuario.softDelete(uid);

    res.json({
      ok: true,
      msg: "Usuario eliminado",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const AdmHistorialContrasena = require("../models/adm_historial_contrasenas");
const AdmHistorialAccion = require("../models/adm_historial_acciones");

const cambiarContrasena = async (req, res = response) => {
  const uid = req.params.id;
  const { contrasena_actual, contrasena_nueva } = req.body;

  try {
    // Verificar que el usuario existe
    const usuario = await Usuario.obtenerPorId(uid);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // Validar permisos: solo ADMIN_ROLE puede cambiar la contraseña de cualquier usuario,
    // USER_ROLE solo puede cambiar la suya propia
    if (req.uid !== parseInt(uid)) {
      const esAdmin = await Usuario.tieneRol(req.uid, "ADMIN_ROLE");
      if (!esAdmin) {
        return res.status(403).json({
          ok: false,
          msg: "Solo un administrador puede cambiar la contraseña de otro usuario",
        });
      }
    }

    // Obtener IP y User-Agent
    const ipOrigen =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Validar intentos fallidos de cambio de contraseña en los últimos 30 minutos
    const desde = new Date(Date.now() - 30 * 60 * 1000);
    const intentos = await AdmHistorialAccion.search(
      {
        id_usuario: uid,
        accion: "CAMBIO_CONTRASENA_FALLIDO",
        fecha_desde: desde.toISOString().slice(0, 19).replace("T", " "),
      },
      0,
      100
    );
    if (intentos.length >= 5) {
      await Usuario.update(uid, { bloqueado: 1 });
      await AdmHistorialAccion.create({
        id_usuario: uid,
        accion: "BLOQUEO_AUTOMATICO",
        descripcion:
          "Usuario bloqueado por exceder 5 intentos fallidos de cambio de contraseña en 30 minutos",
        fecha: new Date(),
        direccion_ip: ipOrigen,
      });
      return res.status(403).json({
        ok: false,
        msg: "Usuario bloqueado por intentos fallidos de cambio de contraseña. Contacte al administrador.",
      });
    }

    // Cambiar contraseña
    const resultado = await Usuario.cambiarContrasena(
      uid,
      contrasena_actual,
      contrasena_nueva
    );
    if (resultado && resultado.error) {
      // Registrar intento fallido en historial de acciones
      await AdmHistorialAccion.create({
        id_usuario: uid,
        accion: "CAMBIO_CONTRASENA_FALLIDO",
        descripcion: resultado.msg || "Intento fallido de cambio de contraseña",
        fecha: new Date(),
        direccion_ip: ipOrigen,
      });
      return res.status(400).json({ ok: false, msg: resultado.msg });
    }
    // Registrar cambio exitoso en historial de contraseñas
    await AdmHistorialContrasena.create({
      id_usuario: uid,
      hash_contrasena: resultado.hash_contrasena || "[hash]",
      fecha_cambio: new Date(),
    });
    // Registrar acción exitosa
    await AdmHistorialAccion.create({
      id_usuario: uid,
      accion: "CAMBIO_CONTRASENA",
      descripcion: "Cambio de contraseña exitoso",
      fecha: new Date(),
      direccion_ip: ipOrigen,
    });
    if (req.uid === parseInt(uid)) {
      // Si el usuario cambia su propia contraseña, devolver token
      const token = await generarJWT(uid);
      return res.json({
        ok: true,
        msg: "Contraseña actualizada exitosamente",
        token,
      });
    } else {
      // Si un admin cambia la contraseña de otro usuario, no devolver token
      return res.json({
        ok: true,
        msg: "Contraseña actualizada exitosamente",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al cambiar contraseña",
    });
  }
};

const resetearContrasena = async (req, res = response) => {
  const uid = req.params.id;
  const { contrasena_nueva } = req.body;

  try {
    // Verificar que el usuario existe
    const usuarioDB = await Usuario.obtenerPorId(uid);

    if (!usuarioDB || usuarioDB.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // Obtener IP y User-Agent
    const ipOrigen =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Resetear contraseña (sin validar la actual)
    const salt = bcrypt.genSaltSync();
    const nuevaContrasenaHash = bcrypt.hashSync(contrasena_nueva, salt);

    const connection = await Usuario.obtenerConexion();
    try {
      await connection.beginTransaction();

      // Registrar en historial
      await connection.query(
        `INSERT INTO adm_historial_contrasenas (id_usuario, contrasena, motivo, ip_origen, user_agent) VALUES (?, ?, ?, ?, ?)`,
        [uid, nuevaContrasenaHash, "RESET_ADMIN", ipOrigen, userAgent]
      );

      // Actualizar contraseña
      await connection.query(
        `UPDATE adm_usuarios SET contrasena = ?, fecha_cambio_contrasena = NOW() WHERE id_usuario = ?`,
        [nuevaContrasenaHash, uid]
      );

      await connection.commit();
      connection.release();

      res.json({
        ok: true,
        msg: "Contraseña reseteada exitosamente",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al resetear contraseña",
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  borrarUsuario,
  listarUsuarios,
  cambiarContrasena,
  resetearContrasena,
};
