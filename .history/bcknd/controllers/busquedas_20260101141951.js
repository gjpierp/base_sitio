/**
 * Controlador: busquedas.js
 * Propósito: Proveer endpoints de búsqueda y utilidades de paginación para
 * el backend (usuarios, roles, permisos, menus, etc.).
 *
 * Funciones exportadas:
 * - getUsuariosPaginados(req,res): Devuelve usuarios paginados o todos si no hay params.
 * - getTodo(req,res): Búsqueda general en varias colecciones.
 * - getDocumentosColeccion(req,res): Búsqueda específica por tabla/colección.
 */
// Endpoint de paginación: recibe desde y hasta como query params
const getUsuariosPaginados = async (req, res = response) => {
  try {
    let { desde, hasta } = req.query;
    const sortKey = String(req.query.sortKey || "").toLowerCase();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const sortMap = {
      id: "id_usuario",
      id_usuario: "id_usuario",
      nombre: "nombre_usuario",
      nombre_usuario: "nombre_usuario",
      correo: "correo",
      correo_electronico: "correo",
      id_tipo_usuario: "id_tipo_usuario",
      id_estado: "id_estado",
      fecha_creacion: "fecha_creacion",
      fecha_actualizacion: "fecha_actualizacion",
    };
    const sortColumn = sortMap[sortKey] || "nombre_usuario";
    const limiteParam = Number(req.query.limite);
    if (desde === undefined && hasta === undefined && isNaN(limiteParam)) {
      // Si no se pasan parámetros, devolver todos los usuarios y el total real
      const usuarios = await Usuario.listar(null, null, sortColumn, sortDir);
      const safeUsuarios = Array.isArray(usuarios)
        ? usuarios.map((u) => {
            const o = { ...u };
            delete o.contrasena;
            delete o.hash_contrasena;
            delete o.password;
            delete o.hash;
            return o;
          })
        : usuarios;
      const total = await Usuario.contar();
      return res.json({
        ok: true,
        usuarios: safeUsuarios,
        total,
        desde: 0,
        hasta: total,
      });
    }
    desde = Number(desde);
    hasta = Number(hasta);
    let limite = isNaN(limiteParam) ? hasta - desde : limiteParam;
    if (isNaN(desde) || desde < 0) desde = 0;
    if (isNaN(hasta) || hasta <= desde)
      hasta = desde + (isNaN(limiteParam) ? 10 : limite);
    if (isNaN(limite) || limite <= 0) limite = 10;
    const usuarios = await Usuario.listar(desde, limite, sortColumn, sortDir);
    const total = await Usuario.contar();
    const safe = Array.isArray(usuarios)
      ? usuarios.map((u) => {
          const o = { ...u };
          delete o.contrasena;
          delete o.hash_contrasena;
          delete o.password;
          delete o.hash;
          return o;
        })
      : usuarios;
    res.json({ ok: true, usuarios: safe, total, desde, hasta, limite });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener usuarios paginados",
    });
  }
};
const { response } = require("express");
const Usuario = require("../models/adm_usuarios");

const getTodo = async (req, res = response) => {
  try {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, "i");
    const usuarios = await Usuario.listar(1, 100);
    // Filtrar usuarios por el término de búsqueda
    const usuariosFiltrados = usuarios.filter(
      (u) =>
        (u.nombre_usuario && u.nombre_usuario.match(regex)) ||
        (u.nombres && u.nombres.match(regex)) ||
        (u.correo_electronico && u.correo_electronico.match(regex))
    );
    if (usuariosFiltrados.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron usuarios con ese criterio",
      });
    }
    const safeFilt = usuariosFiltrados.map((u) => {
      const o = { ...u };
      delete o.contrasena;
      delete o.hash_contrasena;
      delete o.password;
      delete o.hash;
      return o;
    });
    res.json({ ok: true, usuarios: safeFilt });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al realizar la búsqueda",
    });
  }
};

const getDocumentosColeccion = async (req, res = response) => {
  try {
    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, "i");
    const isNumeric = /^\d+$/.test(String(busqueda));
    let data = [];
    // pagination params: desde, limite, pagina
    const desdeParam = req.query.desde;
    const limiteParam = req.query.limite;
    const paginaParam = req.query.pagina;
    switch (tabla) {
      case "usuarios": {
        if (isNumeric) {
          const byId =
            typeof Usuario.findById === "function"
              ? await Usuario.findById(Number(busqueda))
              : typeof Usuario.obtenerPorId === "function"
              ? await Usuario.obtenerPorId(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const usuarios = await Usuario.findAll();
        const dataRaw = usuarios.filter(
          (u) =>
            (u.nombre_usuario && u.nombre_usuario.match(regex)) ||
            (u.nombres && u.nombres.match(regex)) ||
            (u.correo_electronico && u.correo_electronico.match(regex))
        );
        data = dataRaw.map((u) => {
          const o = { ...u };
          delete o.contrasena;
          delete o.hash_contrasena;
          delete o.password;
          delete o.hash;
          return o;
        });
        break;
      }
      case "roles": {
        const AdmRol = require("../models/adm_roles");
        if (isNumeric) {
          const byId =
            typeof AdmRol.findById === "function"
              ? await AdmRol.findById(Number(busqueda))
              : typeof AdmRol.obtenerPorId === "function"
              ? await AdmRol.obtenerPorId(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const roles = await AdmRol.findAll();
        data = roles.filter(
          (r) =>
            (r.nombre && r.nombre.match(regex)) ||
            (r.descripcion && r.descripcion.match(regex))
        );
        break;
      }
      case "permisos": {
        const AdmPermiso = require("../models/adm_permisos");
        if (isNumeric) {
          const byId =
            typeof AdmPermiso.findById === "function"
              ? await AdmPermiso.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const permisos = await AdmPermiso.findAll();
        data = permisos.filter(
          (p) =>
            (p.nombre && p.nombre.match(regex)) ||
            (p.descripcion && p.descripcion.match(regex))
        );
        break;
      }
      case "menus": {
        const AdmMenu = require("../models/adm_menus");
        if (isNumeric) {
          const byId =
            typeof AdmMenu.findById === "function"
              ? await AdmMenu.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const menus = await AdmMenu.findAll();
        data = menus.filter(
          (m) =>
            (m.nombre && m.nombre.match(regex)) ||
            (m.url && m.url.match(regex)) ||
            (m.icono && m.icono.match(regex))
        );
        break;
      }
      case "aplicaciones_sitio": {
        const AdmApp = require("../models/adm_aplicaciones_sitio");
        if (isNumeric) {
          const byId =
            typeof AdmApp.findById === "function"
              ? await AdmApp.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const apps = await AdmApp.findAllBySitio();
        data = apps.filter(
          (a) =>
            (a.nombre && a.nombre.match(regex)) ||
            (a.clave && a.clave.match(regex)) ||
            (a.descripcion && a.descripcion.match(regex))
        );
        break;
      }
      case "sitios": {
        const AdmSitio = require("../models/adm_sitios");
        if (isNumeric) {
          const byId =
            typeof AdmSitio.findById === "function"
              ? await AdmSitio.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const sitios = await AdmSitio.findAll();
        data = sitios.filter(
          (s) =>
            (s.nombre && s.nombre.match(regex)) ||
            (s.codigo && s.codigo.match(regex)) ||
            (s.dominio && s.dominio.match(regex))
        );
        break;
      }
      case "configuraciones": {
        const AdmConf = require("../models/adm_configuraciones");
        // If search is exact clave, try direct lookup
        if (!isNumeric) {
          const byClave = await AdmConf.findByClave(busqueda);
          if (byClave) {
            data = [byClave];
            break;
          }
        }
        const confs = await AdmConf.findAll();
        data = confs.filter(
          (c) =>
            (c.clave && c.clave.match(regex)) ||
            (c.valor && String(c.valor).match(regex)) ||
            (c.descripcion && c.descripcion.match(regex))
        );
        break;
      }
      case "tipos_usuario": {
        const AdmTipo = require("../models/adm_tipos_usuario");
        if (isNumeric) {
          const byId =
            typeof AdmTipo.findById === "function"
              ? await AdmTipo.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const tipos = await AdmTipo.findAll();
        data = tipos.filter(
          (t) =>
            (t.nombre && t.nombre.match(regex)) ||
            (t.descripcion && t.descripcion.match(regex))
        );
        break;
      }
      case "estados": {
        const AdmEstado = require("../models/adm_estados");
        if (isNumeric) {
          const byId =
            typeof AdmEstado.findById === "function"
              ? await AdmEstado.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const estados = await AdmEstado.findAll();
        data = estados.filter(
          (e) =>
            (e.nombre && e.nombre.match(regex)) ||
            (e.descripcion && e.descripcion.match(regex))
        );
        break;
      }
      default:
        return res.status(400).json({
          ok: false,
          msg: "La tabla tiene que ser usuarios, roles, permisos o menus",
        });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontraron resultados con ese criterio",
      });
    }

    // Apply pagination on filtered data
    const total = data.length;
    let desde =
      typeof desdeParam !== "undefined" ? Number(desdeParam) : undefined;
    let limite =
      typeof limiteParam !== "undefined" ? Number(limiteParam) : undefined;
    const pagina =
      typeof paginaParam !== "undefined" ? Number(paginaParam) : undefined;
    if (!isNaN(pagina)) {
      const p = Math.max(1, pagina);
      limite = isNaN(limite) ? 10 : Math.max(1, limite);
      desde = (p - 1) * limite;
    }
    if (typeof desde === "undefined") desde = 0;
    if (isNaN(desde) || desde < 0) desde = 0;
    if (isNaN(limite) || limite <= 0) limite = total - desde;
    const resultados = data.slice(desde, Math.min(desde + limite, total));

    res.json({
      ok: true,
      resultados,
      meta: { total, desde, limite, pagina: pagina || null },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al realizar la búsqueda",
    });
  }
};

module.exports = {
  getTodo,
  getDocumentosColeccion,
  getUsuariosPaginados,
};
