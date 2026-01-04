/**
 * @openapi
 * /api/permisos:
 *   get:
 *     tags:
 *       - Permisos
 *     summary: Listar permisos
 */
/**
 * @openapi
 * /api/permisos:
 *   get:
 *     tags:
 *       - Permisos
 *     summary: Listar permisos
 */
const { Router } = require("express");
const { check } = require("express-validator");
const {
  campoObligatorio,
  campoLongitud,
  campoNumerico,
  campoLongitudMax,
} = require("../middlewares/validar-genericas");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarPermiso } = require("../middlewares/validar-permisos");
const { middlewareRegistrarAccion } = require("../helpers/registrar-accion");
const {
  getPermisosPaginados,
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
  obtenerRolesPermiso,
  obtenerMenusPermiso,
} = require("../controllers/permisos");
const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

router.use(validarJWT);

// GET /api/permisos/menus/:id - Obtener menús asociados a un permiso (ruta alternativa)
router.get(
  "/menus/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("PERMISOS_VER"),
  ],
  obtenerMenusPermiso
);

// GET /api/permisos - Obtener todos los permisos
router.get("/", validarPermiso("PERMISOS_VER"), getPermisosPaginados);

// GET /api/permisos/buscar/:q - Buscar permisos por texto (nombre/descripcion)
router.get(
  "/buscar/:q",
  [validarPermiso("PERMISOS_VER")],
  (req, res) => {
    req.params.tabla = "permisos";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

// GET /api/permisos/:id - Obtener un permiso por ID
router.get(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("PERMISOS_VER"),
  ],
  obtenerPermiso
);

// POST /api/permisos - Crear un nuevo permiso
router.post(
  "/",
  [
    campoObligatorio("nombre", "El nombre es obligatorio"),
    campoLongitud("nombre", 1, 50, "El nombre debe tener máximo 50 caracteres"),
    validarCampos,
    validarPermiso("PERMISOS_CREAR"),
    middlewareRegistrarAccion("CREAR", "permisos"),
  ],
  crearPermiso
);

// PUT /api/permisos/:id - Actualizar un permiso
router.put(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    campoLongitudMax(
      "codigo",
      50,
      "El código debe tener máximo 50 caracteres"
    ).optional(),
    campoLongitudMax(
      "descripcion",
      255,
      "La descripción debe tener máximo 255 caracteres"
    ).optional(),
    validarCampos,
    validarPermiso("PERMISOS_EDITAR"),
    middlewareRegistrarAccion("ACTUALIZAR", "permisos"),
  ],
  actualizarPermiso
);

// DELETE /api/permisos/:id - Eliminar un permiso
router.delete(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("PERMISOS_ELIMINAR"),
    middlewareRegistrarAccion("ELIMINAR", "permisos"),
  ],
  eliminarPermiso
);

// GET /api/permisos/:id/roles - Obtener roles que tienen este permiso
router.get(
  "/roles/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("PERMISOS_VER"),
  ],
  obtenerRolesPermiso
);

// GET /api/permisos/:id/menus - Obtener menús que requieren este permiso
router.get(
  "/:id/menus",
  [
    check("id", "El id debe ser numérico").isNumeric(),
    validarCampos,
    validarPermiso("PERMISOS_VER"),
  ],
  obtenerMenusPermiso
);

module.exports = router;
