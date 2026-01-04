/**
 * @openapi
 * /api/tipos_usuario:
 *   get:
 *     tags:
 *       - TiposUsuario
 *     summary: Listar tipos de usuario
 */
const { Router } = require("express");
const { check } = require("express-validator");
const {
  campoObligatorio,
  campoNumerico,
} = require("../middlewares/validar-genericas");
const {
  obtenerTiposUsuario,
  obtenerTipoUsuario,
  crearTipoUsuario,
  actualizarTipoUsuario,
  eliminarTipoUsuario,
} = require("../controllers/tipos_usuario");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarRol } = require("../middlewares/validar-permisos");

const middlewareRegistrarAccion = require("../middlewares/auditoria");
const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

// Obtener todos los tipos de usuario (catálogo público)
// Se deja público para que el frontend pueda cargarlo sin token.
router.get("/", obtenerTiposUsuario);

// GET /api/tipos_usuario/buscar/:q - Buscar tipos de usuario por texto (nombre/descripcion)
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "tipos_usuario";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

// GET /api/tipos_usuario/buscar/id/:id - Buscar tipo de usuario por id (alias a /:id)
router.get(
  "/buscar/id/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerTipoUsuario
);

// GET /api/tipos_usuario/buscar/nombre/:nombre - Buscar por nombre/descripcion
router.get(
  "/buscar/nombre/:nombre",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "tipos_usuario";
    req.params.busqueda = req.params.nombre;
    return getDocumentosColeccion(req, res);
  }
);

// Obtener un tipo de usuario por ID
router.get(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerTipoUsuario
);

// Crear un nuevo tipo de usuario
router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    campoNumerico("id_estado", "El estado es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "tipos_usuario"),
  ],
  crearTipoUsuario
);

// Actualizar un tipo de usuario
router.put(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    campoNumerico("id_estado", "El estado es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "tipos_usuario"),
  ],
  actualizarTipoUsuario
);

// Eliminar un tipo de usuario
router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "tipos_usuario"),
  ],
  eliminarTipoUsuario
);

module.exports = router;
