/**
 * Controlador: menus.js
 * Propósito: Gestionar menús del sistema (árbol, CRUD, asignación de permisos)
 * y endpoints auxiliares de paginación.
 */
const AdmMenuPermiso = require("../models/adm_menus_permisos");

const { response } = require("express");
const Menu = require("../models/adm_menus");
const AdmConfiguraciones = require("../models/adm_configuraciones");

// Endpoint de paginación: recibe desde y hasta como query params
const getMenusPaginados = async (req, res = response) => {
  try {
    let { desde, hasta } = req.query;
    const sortKey = String(req.query.sortKey || "").toLowerCase();
    const sortDir =
      String(req.query.sortDir || "asc").toLowerCase() === "desc"
        ? "DESC"
        : "ASC";
    const sortMap = {
      id: "id_menu",
      id_menu: "id_menu",
      nombre: "nombre",
      url: "url",
      icono: "icono",
      nivel: "nivel",
      orden: "orden",
      visible: "visible",
    };
    const sortColumn = sortMap[sortKey] || "nombre";
    const limiteParam = Number(req.query.limite);
    // Obtener items per page desde la tabla de configuraciones (clave: items_per_page)
    const cfg = await AdmConfiguraciones.findByClave("items_per_page");
    const defaultItemsPerPage = cfg && !isNaN(Number(cfg.valor)) ? Number(cfg.valor) : 10;
    if (desde === undefined && hasta === undefined && isNaN(limiteParam)) {
      // Si no se pasan parámetros, devolver todos los menús y el total real
      const menus = await Menu.listar(
        undefined,
        undefined,
        sortColumn,
        sortDir
      );
      const total = await Menu.contar();
      return res.json({
        ok: true,
        menus,
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
      hasta = desde + (isNaN(limiteParam) ? defaultItemsPerPage : limite);
    if (isNaN(limite) || limite <= 0) limite = defaultItemsPerPage;
    const menus = await Menu.listar(desde, limite, sortColumn, sortDir);
    const total = await Menu.contar();
    res.json({
      ok: true,
      menus,
      total,
      desde,
      hasta,
      limite,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ ok: false, msg: "Error al obtener menús paginados" });
  }
};

const obtenerMenus = async (req, res = response) => {
  try {
    const menus = await Menu.listar(req.db);
    res.json({ ok: true, menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error al obtener menús" });
  }
};

const obtenerArbolMenus = async (req, res = response) => {
  try {
    // Si tienes un usuario autenticado, puedes pasar su id, si no, pásalo como null o 0
    const id_usuario = req.uid || null;
    const arbol = await Menu.buildUserMenuTree(id_usuario);
    res.json({
      ok: true,
      menus: arbol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener árbol de menús",
    });
  }
};

const obtenerMenu = async (req, res = response) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({
        ok: false,
        msg: "Menú no encontrado",
      });
    }
    // Obtener permisos del menú
    const permisos = await Menu.obtenerPermisos(id, req.db);
    res.json({
      ok: true,
      menu: {
        ...menu,
        permisos,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener menú",
    });
  }
};

const crearMenu = async (req, res = response) => {
  try {
    const datos = req.body;
    // Validar nombre único
    const existeNombre = (await Menu.findAll()).some(
      (m) => m.nombre === datos.nombre
    );
    if (existeNombre) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un menú con ese nombre" });
    }
    // Validar url única
    const existeUrl = (await Menu.findAll()).some((m) => m.url === datos.url);
    if (existeUrl) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un menú con esa url" });
    }
    // Validar que el menú padre exista si se especifica
    if (datos.id_menu_padre) {
      const padre = await Menu.findById(datos.id_menu_padre);
      if (!padre) {
        return res
          .status(400)
          .json({ ok: false, msg: "El menú padre especificado no existe" });
      }
    }
    const idMenu = await Menu.create(datos);
    res.status(201).json({
      ok: true,
      id_menu: idMenu,
      msg: "Menú creado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear menú",
    });
  }
};

const actualizarMenu = async (req, res = response) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    // Verificar que el menú existe
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({
        ok: false,
        msg: "Menú no encontrado",
      });
    }
    // Verificar nombre único (excepto el propio)
    if (datos.nombre && datos.nombre !== menu.nombre) {
      const existeNombre = (await Menu.findAll()).some(
        (m) => m.nombre === datos.nombre && m.id_menu !== id
      );
      if (existeNombre) {
        return res
          .status(400)
          .json({ ok: false, msg: "Ya existe un menú con ese nombre" });
      }
    }
    // Verificar url única (excepto el propio)
    if (datos.url && datos.url !== menu.url) {
      const existeUrl = (await Menu.findAll()).some(
        (m) => m.url === datos.url && m.id_menu !== id
      );
      if (existeUrl) {
        return res
          .status(400)
          .json({ ok: false, msg: "Ya existe un menú con esa url" });
      }
    }
    // Verificar que no se está intentando hacer padre de sí mismo
    if (datos.id_menu_padre && parseInt(datos.id_menu_padre) === parseInt(id)) {
      return res.status(400).json({
        ok: false,
        msg: "Un menú no puede ser padre de sí mismo",
      });
    }
    // Validar que el menú padre exista si se especifica
    if (datos.id_menu_padre) {
      const padre = await Menu.findById(datos.id_menu_padre);
      if (!padre) {
        return res
          .status(400)
          .json({ ok: false, msg: "El menú padre especificado no existe" });
      }
    }
    await Menu.update(id, datos);
    res.json({
      ok: true,
      msg: "Menú actualizado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar menú",
    });
  }
};

const eliminarMenu = async (req, res = response) => {
  try {
    const { id } = req.params;
    // Verificar que el menú existe
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({
        ok: false,
        msg: "Menú no encontrado",
      });
    }
    // Verificar si tiene menús hijos
    const hijos = await Menu.obtenerJerarquia(id, req.db);
    if (hijos.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: "No se puede eliminar el menú porque tiene submenús",
      });
    }
    await Menu.delete(id);
    res.json({
      ok: true,
      msg: "Menú eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar menú",
    });
  }
};

const obtenerMenusUsuario = async (req, res = response) => {
  let conn;
  try {
    const { id } = req.params;
    const { permisos } = req.body; // Array de IDs de permisos

    // Verificar que el menú existe
    const menu = await Menu.findById(id);
    if (!menu)
      return res.status(404).json({ ok: false, msg: "Menú no encontrado" });

    if (!Array.isArray(permisos))
      return res
        .status(400)
        .json({ ok: false, msg: "El campo permisos debe ser un array de ids" });

    // Normalizar ids
    const permisosIds = permisos.map((p) => Number(p)).filter((n) => !isNaN(n));
    if (permisosIds.length === 0)
      return res
        .status(400)
        .json({ ok: false, msg: "No se enviaron ids de permisos válidos" });

    // Verificar existencia de permisos en la tabla adm_permisos
    const dbPool = require("../database/config");
    const [foundPerms] = await dbPool.query(
      `SELECT id_permiso FROM adm_permisos WHERE id_permiso IN (${permisosIds
        .map(() => "?")
        .join(",")})`,
      permisosIds
    );
    const existingIds = (foundPerms || []).map((r) => Number(r.id_permiso));
    const invalid = permisosIds.filter((p) => !existingIds.includes(p));
    if (invalid.length)
      return res
        .status(400)
        .json({ ok: false, msg: "Algunos permisos no existen", invalid });

    const replace = req.body.replace === true || req.body.replace === "true";

    // Transaction
    conn = await dbPool.getConnection();
    await conn.beginTransaction();

    if (replace) {
      await conn.query("DELETE FROM adm_menus_permisos WHERE id_menu = ?", [
        id,
      ]);
    }

    const created = [];
    for (const id_permiso of permisosIds) {
      const [rows] = await conn.query(
        "SELECT 1 FROM adm_menus_permisos WHERE id_menu = ? AND id_permiso = ? LIMIT 1",
        [id, id_permiso]
      );
      const exists = Array.isArray(rows) ? rows.length > 0 : !!rows;
      if (!exists) {
        await conn.query(
          "INSERT INTO adm_menus_permisos (id_menu, id_permiso, activo) VALUES (?, ?, ?)",
          [id, id_permiso, 1]
        );
        created.push(id_permiso);
      }
    }

    await conn.commit();
    res.json({
      ok: true,
      msg: "Permisos asignados/actualizados",
      created,
      total: created.length,
    });
  } catch (error) {
    console.error(error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (e) {}
    }
    res.status(500).json({ ok: false, msg: "Error al asignar permisos" });
  } finally {
    if (conn)
      try {
        conn.release();
      } catch (e) {}
  }
};

// Alias mantenido por compatibilidad: antiguamente `asignarPermisos`.
const asignarPermisos = obtenerMenusUsuario;

const obtenerMenusPorIds = async (req, res = response) => {
  try {
    const idsParam = req.query.ids || (req.body && req.body.ids);
    if (!idsParam) {
      return res.status(400).json({ ok: false, msg: "Faltan ids" });
    }
    const ids = String(idsParam)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const menus = await Menu.findByIds(ids);
    res.json({ ok: true, menus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error al obtener menus por ids" });
  }
};

const obtenerPermisosMenu = async (req, res = response) => {
  try {
    const { id } = req.params;
    // Verificar que el menú existe
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({
        ok: false,
        msg: "Menú no encontrado",
      });
    }
    const AdmMenuPermiso = require("../models/adm_menus_permisos");
    const permisos = await AdmMenuPermiso.obtenerPermisos(id);
    res.json({
      ok: true,
      permisos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener permisos del menú",
    });
  }
};

const eliminarPermisoMenu = async (req, res = response) => {
  try {
    const { id, permId } = req.params;
    const menu = await Menu.findById(id);
    if (!menu)
      return res.status(404).json({ ok: false, msg: "Menú no encontrado" });
    const AdmMenuPermiso = require("../models/adm_menus_permisos");
    // comprobar existencia de permiso
    const [found] = await require("../database/config").query(
      "SELECT 1 FROM adm_permisos WHERE id_permiso = ? LIMIT 1",
      [permId]
    );
    const existsPerm = Array.isArray(found) ? found.length > 0 : !!found;
    if (!existsPerm)
      return res.status(404).json({ ok: false, msg: "Permiso no encontrado" });
    await AdmMenuPermiso.deleteByMenuAndPerm(id, permId);
    res.json({ ok: true, msg: "Permiso eliminado del menú" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ ok: false, msg: "Error al eliminar permiso del menú" });
  }
};

module.exports = {
  obtenerMenus,
  obtenerArbolMenus,
  obtenerMenu,
  crearMenu,
  actualizarMenu,
  eliminarMenu,
  obtenerMenusUsuario,
  eliminarPermisoMenu,
  obtenerMenusPorIds,
  asignarPermisos,
  obtenerPermisosMenu,
  getMenusPaginados,
};
