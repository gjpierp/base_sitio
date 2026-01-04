/**
 * @openapi
 * /api/historial_accesos:
 *   get:
 *     tags:
 *       - HistorialAccesos
 *     summary: Listar historial de accesos
 */
const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarRol } = require("../middlewares/validar-permisos");
const { campoNumerico } = require("../middlewares/validar-genericas");
const {
  sanitizarInputs,
  validarPaginacion,
  validarRangoFechasQuery,
} = require("../middlewares/validar-inputs");
const {
  obtenerHistorialAccesos,
  obtenerHistorialAcceso,
  crearHistorialAcceso,
  eliminarHistorialAcceso,
} = require("../controllers/historial_accesos");

const middlewareRegistrarAccion = require("../middlewares/auditoria");
const router = Router();

router.get(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    sanitizarInputs,
    validarPaginacion,
    check("id_usuario")
      .optional()
      .isNumeric()
      .withMessage("id_usuario debe ser numérico"),
    validarRangoFechasQuery,
    validarCampos,
  ],
  obtenerHistorialAccesos
);

router.get(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerHistorialAcceso
);

router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id_usuario", "id_usuario requerido"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "historial_accesos"),
  ],
  crearHistorialAcceso
);

router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "historial_accesos"),
  ],
  eliminarHistorialAcceso
);

module.exports = router;
