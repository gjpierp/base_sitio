/**
 * @openapi
 * /api/menus:
 *   get:
 *     tags:
 *       - Menus
 *     summary: Obtener menús disponibles
 */
const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarIdMenu,
  validarNombreMenu,
  validarNombreMenuOptional,
  validarUrlMenu,
  validarUrlMenuOptional,
  validarIconoMenu,
  validarIconoMenuOptional,
  validarNivelMenu,
  validarNivelMenuOptional,
  validarOrdenMenuOptional,
  validarVisibleMenuOptional,
  validarIdMenuPadreOptional,
  validarPermisosArray,
} = require("../middlewares/validar-menus");

const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarPermiso } = require("../middlewares/validar-permisos");
const { middlewareRegistrarAccion } = require("../helpers/registrar-accion");

const {
  getMenusPaginados,
  obtenerArbolMenus,
  obtenerMenu,
  obtenerMenusPorIds,
  crearMenu,
  actualizarMenu,
  eliminarMenu,
  obtenerMenusUsuario,
  asignarPermisos,
  obtenerPermisosMenu,
} = require("../controllers/menus");

const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

// Todas las rutas requieren autenticación
router.use(validarJWT);

// GET /api/menus/usuario - Obtener menús del usuario autenticado
router.get("/usuario", obtenerMenusUsuario);

// GET /api/menus/arbol - Obtener menús en estructura de árbol
router.get("/arbol", validarPermiso("MENUS_VER"), obtenerArbolMenus);

// GET /api/menus - Obtener todos los menús
router.get("/", validarPermiso("MENUS_VER"), getMenusPaginados);

// GET /api/menus/buscar/:q - Buscar menús por texto (nombre/url/icono)
router.get(
  "/buscar/:q",
  [validarPermiso("MENUS_VER")],
  (req, res) => {
    req.params.tabla = "menus";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

// GET /api/menus/:id - Obtener un menú por ID
router.get("/ids", validarPermiso("MENUS_VER"), obtenerMenusPorIds);

// GET /api/menus/:id - Obtener un menú por ID
router.get(
  "/:id",
  [...validarIdMenu, validarPermiso("MENUS_VER")],
  obtenerMenu
);

// POST /api/menus - Crear un nuevo menú
router.post(
  "/",
  [
    ...validarNombreMenu,
    ...validarUrlMenu,
    ...validarIconoMenu,
    ...validarNivelMenu,
    check("orden", "El orden es obligatorio y debe ser numérico")
      .notEmpty()
      .isNumeric(),
    check("visible", "El campo visible es obligatorio y debe ser booleano")
      .notEmpty()
      .isBoolean(),
    validarPermiso("MENUS_CREAR"),
    middlewareRegistrarAccion("CREAR", "menus"),
  ],
  crearMenu
);

// PUT /api/menus/:id - Actualizar un menú
router.put(
  "/:id",
  [
    ...validarIdMenu,
    ...validarNombreMenuOptional,
    ...validarUrlMenuOptional,
    ...validarIconoMenuOptional,
    ...validarNivelMenuOptional,
    ...validarOrdenMenuOptional,
    ...validarVisibleMenuOptional,
    ...validarIdMenuPadreOptional,
    validarPermiso("MENUS_EDITAR"),
    middlewareRegistrarAccion("ACTUALIZAR", "menus"),
  ],
  actualizarMenu
);

// DELETE /api/menus/:id - Eliminar un menú
router.delete(
  "/:id",
  [
    ...validarIdMenu,
    validarPermiso("MENUS_ELIMINAR"),
    middlewareRegistrarAccion("ELIMINAR", "menus"),
  ],
  eliminarMenu
);

// POST /api/menus/:id/permisos - Asignar permisos a un menú
router.post(
  "/permisos/:id",
  [
    ...validarIdMenu,
    ...validarPermisosArray,
    validarPermiso("MENUS_EDITAR"),
    middlewareRegistrarAccion("ASIGNAR_PERMISOS", "menus"),
  ],
  asignarPermisos
);

// GET /api/menus/:id/permisos - Obtener permisos de un menú
router.get(
  "/permisos/:id",
  [...validarIdMenu, validarPermiso("MENUS_VER")],
  obtenerPermisosMenu
);

module.exports = router;
