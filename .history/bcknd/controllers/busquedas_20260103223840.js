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
const { parsePagination } = require("../helpers/pagination");
const db = require("../database/config");

// Endpoint de paginación: recibe desde/hasta o page/per_page
const getUsuariosPaginados = async (req, res = response) => {
  try {
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
    const { desde, limite, page, per_page } = await parsePagination(req);

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
    res.json({
      ok: true,
      usuarios: safe,
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
      msg: "Error al obtener usuarios paginados",
    });
  }
};
const { response } = require("express");
const Usuario = require("../models/adm_usuarios");

const getTodo = async (req, res = response) => {
  try {
    const busqueda = req.params.busqueda;
    const isNumeric = /^\d+$/.test(String(busqueda));
    // Search users by DB (limit 100 by default)
    if (isNumeric) {
      const byId =
        typeof Usuario.findById === "function"
          ? await Usuario.findById(Number(busqueda))
          : typeof Usuario.obtenerPorId === "function"
          ? await Usuario.obtenerPorId(Number(busqueda))
          : null;
      if (byId) {
        const o = { ...byId };
        delete o.contrasena;
        delete o.hash_contrasena;
        delete o.password;
        delete o.hash;
        return res.json({ ok: true, usuarios: [o] });
      }
    }

    const q = `%${String(busqueda).toLowerCase()}%`;
    const sql = `SELECT * FROM adm_usuarios WHERE LOWER(nombre_usuario) LIKE ? OR LOWER(nombres) LIKE ? OR LOWER(correo_electronico) LIKE ? LIMIT 100`;
    const [rows] = await db.query(sql, [q, q, q]);
    const safe = (rows || []).map((u) => {
      const o = { ...u };
      delete o.contrasena;
      delete o.hash_contrasena;
      delete o.password;
      delete o.hash;
      return o;
    });
    if (safe.length === 0) {
      return res
        .status(404)
        .json({
          ok: false,
          msg: "No se encontraron usuarios con ese criterio",
        });
    }
    res.json({ ok: true, usuarios: safe });
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
    // pagination params handled by parsePagination
    // const desdeParam = req.query.desde;
    // const limiteParam = req.query.limite;
    // const paginaParam = req.query.pagina;
    const { desde, limite, page, per_page } = await parsePagination(req);
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_usuarios WHERE LOWER(nombre_usuario) LIKE ? OR LOWER(nombres) LIKE ? OR LOWER(correo_electronico) LIKE ?`,
          [qLike, qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_usuarios WHERE LOWER(nombre_usuario) LIKE ? OR LOWER(nombres) LIKE ? OR LOWER(correo_electronico) LIKE ? ORDER BY nombre_usuario LIMIT ? OFFSET ?`,
          [qLike, qLike, qLike, limite, desde]
        );
        data = (rows || []).map((u) => {
          const o = { ...u };
          delete o.contrasena;
          delete o.hash_contrasena;
          delete o.password;
          delete o.hash;
          return o;
        });
        // attach total for pagination later
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_roles WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ?`,
          [qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_roles WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_permisos WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ?`,
          [qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_permisos WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_menus WHERE LOWER(nombre) LIKE ? OR LOWER(url) LIKE ? OR LOWER(icono) LIKE ?`,
          [qLike, qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_menus WHERE LOWER(nombre) LIKE ? OR LOWER(url) LIKE ? OR LOWER(icono) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_aplicaciones_sitio WHERE LOWER(nombre) LIKE ? OR LOWER(clave) LIKE ? OR LOWER(descripcion) LIKE ?`,
          [qLike, qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_aplicaciones_sitio WHERE LOWER(nombre) LIKE ? OR LOWER(clave) LIKE ? OR LOWER(descripcion) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_sitios WHERE LOWER(nombre) LIKE ? OR LOWER(codigo) LIKE ? OR LOWER(COALESCE(descripcion, '')) LIKE ?`,
          [qLike, qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_sitios WHERE LOWER(nombre) LIKE ? OR LOWER(codigo) LIKE ? OR LOWER(COALESCE(descripcion, '')) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_configuraciones WHERE LOWER(clave) LIKE ? OR LOWER(COALESCE(valor, '')) LIKE ? OR LOWER(COALESCE(descripcion, '')) LIKE ?`,
          [qLike, qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_configuraciones WHERE LOWER(clave) LIKE ? OR LOWER(COALESCE(valor, '')) LIKE ? OR LOWER(COALESCE(descripcion, '')) LIKE ? ORDER BY clave LIMIT ? OFFSET ?`,
          [qLike, qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_tipos_usuario WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ?`,
          [qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_tipos_usuario WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_estados WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ?`,
          [qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_estados WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
        break;
      }
      case "jerarquias": {
        const AdmJerarquia = require("../models/adm_jerarquias");
        if (isNumeric) {
          const byId =
            typeof AdmJerarquia.findById === "function"
              ? await AdmJerarquia.findById(Number(busqueda))
              : null;
          if (byId) {
            data = [byId];
            break;
          }
        }
        const qLike = `%${busqueda.toLowerCase()}%`;
        const [countRows] = await db.query(
          `SELECT COUNT(*) as total FROM adm_jerarquias WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ?`,
          [qLike, qLike]
        );
        const total = countRows[0]?.total || 0;
        const [rows] = await db.query(
          `SELECT * FROM adm_jerarquias WHERE LOWER(nombre) LIKE ? OR LOWER(COALESCE(descripcion,'')) LIKE ? ORDER BY nombre LIMIT ? OFFSET ?`,
          [qLike, qLike, limite, desde]
        );
        data = rows;
        data._total = total;
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

    // Use SQL-provided pagination metadata (if available)
    const total =
      typeof data._total === "number"
        ? data._total
        : Array.isArray(data)
        ? data.length
        : 0;
    const resultados = Array.isArray(data) ? data : [];
    res.json({
      ok: true,
      resultados,
      meta: { total, desde, limite, page, per_page },
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
