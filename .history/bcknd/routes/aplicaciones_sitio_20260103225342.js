/**
 * @openapi
 * /api/aplicaciones_sitio:
 *   get:
 *     tags:
 *       - AplicacionesSitio
 *     summary: Listar aplicaciones del sitio
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
  obtenerAplicaciones,
  obtenerAplicacion,
  crearAplicacion,
  actualizarAplicacion,
  eliminarAplicacion,
} = require("../controllers/aplicaciones_sitio");

const { getDocumentosColeccion } = require("../controllers/busquedas");

const router = Router();

// Listado (opcional filtro por id_sitio via query)
router.get(
  "/",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  obtenerAplicaciones
);

router.get(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
  ],
  obtenerAplicacion
);

// GET /api/aplicaciones_sitio/buscar/:q - Buscar aplicaciones por texto (nombre/clave/descripcion)
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "aplicaciones_sitio";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("id_sitio", "El id_sitio es obligatorio"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "aplicaciones_sitio"),
  ],
  crearAplicacion
);

router.put(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "aplicaciones_sitio"),
  ],
  actualizarAplicacion
);

router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "aplicaciones_sitio"),
  ],
  eliminarAplicacion
);

module.exports = router;
