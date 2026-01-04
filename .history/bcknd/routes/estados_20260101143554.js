/**
 * @openapi
 * /api/estados:
 *   get:
 *     tags:
 *       - Estados
 *     summary: Obtener lista de estados
 */
const { Router } = require("express");
const { check } = require("express-validator");
const {
  obtenerEstados,
  obtenerEstado,
  crearEstado,
  actualizarEstado,
  eliminarEstado,
} = require("../controllers/estados");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarRol } = require("../middlewares/validar-permisos");
const {
  campoObligatorio,
  campoNumerico,
} = require("../middlewares/validar-genericas");

const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

// Obtener todos los estados
router.get(
  "/",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  obtenerEstados
);

// GET /api/estados/buscar/:q - Buscar estados por texto (nombre/descripcion)
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "estados";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

// Obtener un estado por ID
router.get(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerEstado
);

// Crear un nuevo estado
const middlewareRegistrarAccion = require("../middlewares/auditoria");
router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    // id_applicaciones_sitio es opcional; validar si se entrega
    check("id_applicaciones_sitio")
      .optional()
      .isInt()
      .withMessage("ID inválido"),
    check("activo")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("Valor de activo inválido"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "estados"),
  ],
  crearEstado
);

// Actualizar un estado
router.put(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    check("id_applicaciones_sitio")
      .optional()
      .isInt()
      .withMessage("ID inválido"),
    check("activo")
      .optional()
      .isInt({ min: 0, max: 1 })
      .withMessage("Valor de activo inválido"),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "estados"),
  ],
  actualizarEstado
);

// Eliminar un estado
router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "estados"),
  ],
  eliminarEstado
);

module.exports = router;
