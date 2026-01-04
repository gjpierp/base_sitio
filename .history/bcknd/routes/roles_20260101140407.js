/**
 * @openapi
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Listar roles
 *   post:
 *     tags:
 *       - Roles
 *     summary: Crear rol (requiere ADMIN_ROLE)
 */
const { Router } = require("express");
const { check } = require("express-validator");
const {
  campoObligatorio,
  campoLongitud,
  campoNumerico,
  campoArray,
  campoLongitudMax,
} = require("../middlewares/validar-genericas");

const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const {
  validarPermiso,
  validarRol,
} = require("../middlewares/validar-permisos");
const { middlewareRegistrarAccion } = require("../helpers/registrar-accion");

const {
  getRolesPaginados,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  asignarPermisos,
  obtenerPermisosRol,
  obtenerUsuariosRol,
} = require("../controllers/roles");
const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

// Todas las rutas requieren autenticación
router.use(validarJWT);

// GET /api/roles - Obtener todos los roles
router.get("/", validarPermiso("ROLES_VER"), getRolesPaginados);

// GET /api/roles/detalle/:id - Obtener un rol por ID
router.get(
  "/detalle/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_VER"),
  ],
  obtenerRol
);

// REST friendly: GET /api/roles/:id - Obtener rol por ID (compatible con frontend)
router.get(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_VER"),
  ],
  obtenerRol
);

// POST /api/roles - Crear un nuevo rol
router.post(
  "/",
  [
    campoObligatorio("nombre", "El nombre es obligatorio"),
    campoLongitud("nombre", 1, 50, "El nombre debe tener máximo 50 caracteres"),
    validarCampos,
    validarPermiso("ROLES_CREAR"),
    middlewareRegistrarAccion("CREAR", "adm_roles"),
  ],
  crearRol
);

// PUT /api/roles/editar/:id - Actualizar un rol
router.put(
  "/editar/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    campoLongitudMax(
      "nombre",
      50,
      "El nombre debe tener máximo 50 caracteres"
    ).optional(),
    campoLongitudMax(
      "descripcion",
      255,
      "La descripción debe tener máximo 255 caracteres"
    ).optional(),
    validarCampos,
    validarPermiso("ROLES_EDITAR"),
    middlewareRegistrarAccion("ACTUALIZAR", "roles"),
  ],
  actualizarRol
);

// REST friendly: PUT /api/roles/:id - Actualizar rol (compatible con frontend that uses PUT /roles/:id)
router.put(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    campoLongitudMax(
      "nombre",
      50,
      "El nombre debe tener máximo 50 caracteres"
    ).optional(),
    campoLongitudMax(
      "descripcion",
      255,
      "La descripción debe tener máximo 255 caracteres"
    ).optional(),
    validarCampos,
    validarPermiso("ROLES_EDITAR"),
    middlewareRegistrarAccion("ACTUALIZAR", "roles"),
  ],
  actualizarRol
);

// DELETE /api/roles/eliminar/:id - Eliminar un rol
router.delete(
  "/eliminar/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_ELIMINAR"),
    middlewareRegistrarAccion("ELIMINAR", "roles"),
  ],
  eliminarRol
);

// REST friendly: DELETE /api/roles/:id - Eliminar rol (compatible con frontend using DELETE /roles/:id)
router.delete(
  "/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_ELIMINAR"),
    middlewareRegistrarAccion("ELIMINAR", "roles"),
  ],
  eliminarRol
);

// POST /api/roles/permisos/:id - Asignar permisos a un rol
router.post(
  "/permisos/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    campoArray("permisos", "Los permisos deben ser un array"),
    validarCampos,
    validarPermiso("ROLES_EDITAR"),
    middlewareRegistrarAccion("ASIGNAR_PERMISOS", "roles"),
  ],
  asignarPermisos
);

// GET /api/roles/permisos/:id - Obtener permisos de un rol
router.get(
  "/permisos/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_VER"),
  ],
  obtenerPermisosRol
);

// GET /api/roles/usuarios/:id - Obtener usuarios de un rol
router.get(
  "/usuarios/:id",
  [
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
    validarPermiso("ROLES_VER"),
  ],
  obtenerUsuariosRol
);

module.exports = router;
