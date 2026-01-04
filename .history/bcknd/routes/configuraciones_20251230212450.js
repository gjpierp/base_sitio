/**
 * @openapi
 * /api/configuraciones:
 *   get:
 *     tags:
 *       - Configuraciones
 *     summary: Listar configuraciones públicas
 *     responses:
 *       200:
 *         description: Lista de configuraciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Configuracion'
 *   post:
 *     tags:
 *       - Configuraciones
 *     summary: Crear configuración (requiere JWT)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Configuracion'
 * /api/configuraciones/{clave}:
 *   put:
 *     tags:
 *       - Configuraciones
 *     summary: Actualizar configuración por clave
 */
const { Router } = require("express");
const { check } = require("express-validator");
const { validarJWT } = require("../middlewares/validar-jwt");
const {
  listConfiguraciones,
  updateConfiguracion,
  createConfiguracion,
  listUserConfigs,
  createUserConfig,
  deleteConfiguracion,
} = require("../controllers/configuraciones");
const { validarRol } = require("../middlewares/validar-permisos");
const {
  campoObligatorio,
  campoLongitudMax,
  campoNumerico,
} = require("../middlewares/validar-genericas");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

// Permitir lectura pública de configuraciones (no requiere JWT)
router.get("/", listConfiguraciones);
router.get("/user", [validarJWT, validarCampos], listUserConfigs);
// GET /api/configuraciones/:clave - Obtener configuración por clave (global o por usuario ?user=1)
router.get(
  "/:clave",
  [check("clave", "La clave es obligatoria").notEmpty(), validarCampos],
  listConfiguraciones ? null : undefined
);

// Crear configuración global (ADMIN)
router.post(
  "/",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoObligatorio("clave", "La clave es obligatoria"),
    campoLongitudMax("clave", 64),
    check("publico").optional().isInt({ min: 0, max: 1 }),
    check("protegido").optional().isInt({ min: 0, max: 1 }),
    validarCampos,
  ],
  createConfiguracion
);

// Crear configuración de usuario (auth)
router.post(
  "/user",
  [
    validarJWT,
    campoObligatorio("clave", "La clave es obligatoria"),
    validarCampos,
  ],
  createUserConfig
);

// Actualizar configuración (global o user via ?user=1)
router.put(
  "/:clave",
  [
    validarJWT,
    check("clave", "La clave es obligatoria").notEmpty(),
    check("publico").optional().isInt({ min: 0, max: 1 }),
    check("protegido").optional().isInt({ min: 0, max: 1 }),
    validarCampos,
  ],
  updateConfiguracion
);

// Eliminar configuración (global o user via ?user=1)
router.delete(
  "/:clave",
  [
    validarJWT,
    check("clave", "La clave es obligatoria").notEmpty(),
    validarCampos,
  ],
  deleteConfiguracion
);

module.exports = router;
