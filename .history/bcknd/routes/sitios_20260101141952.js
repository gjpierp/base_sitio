/**
 * @openapi
 * /api/sitios:
 *   get:
 *     tags:
 *       - Sitios
 *     summary: Listar sitios
 */
const { Router } = require("express");
const {
  campoObligatorio,
  campoNumerico,
} = require("../middlewares/validar-genericas");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarRol } = require("../middlewares/validar-permisos");
const middlewareRegistrarAccion = require("../middlewares/auditoria");
const {
  obtenerSitios,
  obtenerSitio,
  crearSitio,
  actualizarSitio,
  eliminarSitio,
} = require("../controllers/sitios");

const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

router.get(
  "/",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  obtenerSitios
);

// GET /api/sitios/buscar/:q - Buscar sitios por texto (nombre/codigo/dominio)
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "sitios";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

router.get(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerSitio
);

router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "sitios"),
  ],
  crearSitio
);

router.put(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "sitios"),
  ],
  actualizarSitio
);

router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "sitios"),
  ],
  eliminarSitio
);

module.exports = router;
