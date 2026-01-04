/*
    Path: '/api/login'
*/
/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login de usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 * /api/renew:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Renovar token (requiere JWT)
 *     responses:
 *       200:
 *         description: Nuevo token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
const { Router } = require("express");
const {
  validarJWT,
  validarJWTFlexible,
} = require("../middlewares/validar-jwt");
const {
  campoObligatorio,
  campoLongitud,
  campoEmail,
} = require("../middlewares/validar-genericas");
const { check, validationResult } = require("express-validator");
const {
  login,
  googleSignIn,
  facebookSignIn,
  renewToken,
  logout,
  registro,
  cambiarContrasena,
  getProfile,
  updateProfile,
} = require("../controllers/auth");

const router = Router();

// Alias para /api/renew → /api/login/renew
router.get("/", validarJWTFlexible, renewToken);

router.post(
  "/registro",
  [
    campoEmail("correo", "Correo obligatorio y válido"),
    campoObligatorio("nombre_usuario", "Nombre de usuario obligatorio"),
    campoLongitud(
      "nombre_usuario",
      3,
      50,
      "Nombre de usuario mínimo 3 caracteres"
    ),
    campoObligatorio("contrasena", "Contraseña obligatoria"),
    campoLongitud("contrasena", 6, 100, "Contraseña mínima 6 caracteres"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ ok: false, errores: errors.array().map((e) => e.msg) });
      }
      next();
    },
  ],
  registro
);

router.post(
  "/cambiar-contrasena",
  [
    campoEmail("correo", "Correo obligatorio y válido"),
    campoObligatorio("contrasena_actual", "Contraseña actual obligatoria"),
    campoLongitud(
      "contrasena_actual",
      6,
      100,
      "Contraseña actual mínima 6 caracteres"
    ),
    campoObligatorio("contrasena_nueva", "Contraseña nueva obligatoria"),
    campoLongitud(
      "contrasena_nueva",
      6,
      100,
      "Contraseña nueva mínima 6 caracteres"
    ),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ ok: false, errores: errors.array().map((e) => e.msg) });
      }
      next();
    },
  ],
  cambiarContrasena
);

router.post(
  "/",
  [
    (req, res, next) => {
      // Normalizar: si viene correo_electronico, lo copia a correo
      if (!req.body.correo && req.body.correo_electronico) {
        req.body.correo = req.body.correo_electronico;
      }
      next();
    },
    campoEmail(
      "correo",
      "El correo electrónico es obligatorio y debe ser válido"
    ),
    campoObligatorio("contrasena", "La contraseña es obligatoria"),
    campoLongitud(
      "contrasena",
      6,
      100,
      "La contraseña debe tener al menos 6 caracteres"
    ),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ ok: false, errores: errors.array().map((e) => e.msg) });
      }
      next();
    },
  ],
  login
);

function validarGoogleToken(req, res, next) {
  const { token } = req.body;
  if (!token || typeof token !== "string" || token.length < 10) {
    return res.status(400).json({
      ok: false,
      errores: ["El token de Google es obligatorio y debe ser válido"],
    });
  }
  next();
}

function validarFacebookToken(req, res, next) {
  const { accessToken } = req.body;
  if (
    !accessToken ||
    typeof accessToken !== "string" ||
    accessToken.length < 10
  ) {
    return res.status(400).json({
      ok: false,
      errores: ["El token de Facebook es obligatorio y debe ser válido"],
    });
  }
  next();
}

/**
 * Middleware para validar el token de Google en el cuerpo de la petición.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

router.post("/google", validarGoogleToken, googleSignIn);
router.post("/facebook", validarFacebookToken, facebookSignIn);

router.get("/renew", validarJWTFlexible, renewToken);

// Perfil del usuario autenticado
router.get("/profile", validarJWT, getProfile);

router.put("/profile", validarJWT, updateProfile);

// Cerrar sesión y redirigir a la página principal
router.post("/logout", logout);
router.get("/logout", logout);

module.exports = router;

/**
 * @module routes/auth
 * @description Rutas de autenticación: login, registro, renovación, social login,
 * cambio de contraseña y endpoints de perfil. Exporta un `Router` de Express.
 */
