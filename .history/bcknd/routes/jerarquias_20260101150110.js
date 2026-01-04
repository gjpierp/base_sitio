/**
 * @openapi
 * /api/jerarquias:
 *   get:
 *     tags:
 *       - Jerarquias
 *     summary: Listar jerarquías
 */
const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarRol } = require("../middlewares/validar-permisos");
const {
  campoObligatorio,
  campoNumerico,
} = require("../middlewares/validar-genericas");
const {
  obtenerJerarquias,
  obtenerJerarquia,
  crearJerarquia,
  actualizarJerarquia,
  eliminarJerarquia,
} = require("../controllers/jerarquias");
const { getDocumentosColeccion } = require("../controllers/busquedas");

const middlewareRegistrarAccion = require("../middlewares/auditoria");
const router = Router();

router.get(
  "/",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  obtenerJerarquias
);

// Rutas de búsqueda: texto y id (compatibles con frontend 'todo/coleccion')
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE")],
  (req, res) => {
    req.params.tabla = "jerarquias";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

router.get(
  "/buscar/id/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "El id debe ser numérico"),
    validarCampos,
  ],
  obtenerJerarquia
);

router.get(
  "/buscar/nombre/:nombre",
  [validarJWT, validarRol("ADMIN_ROLE")],
  (req, res) => {
    req.params.tabla = "jerarquias";
    req.params.busqueda = req.params.nombre;
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
  obtenerJerarquia
);

router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "jerarquias"),
  ],
  crearJerarquia
);

router.put(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    campoObligatorio("nombre", "El nombre es obligatorio"),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "jerarquias"),
  ],
  actualizarJerarquia
);

router.delete(
  "/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "ID inválido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "jerarquias"),
  ],
  eliminarJerarquia
);

module.exports = router;
