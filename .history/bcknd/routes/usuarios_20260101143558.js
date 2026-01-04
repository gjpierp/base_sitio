/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuarios paginados
 *     parameters:
 *       - name: desde
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
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
 *                     $ref: '#/components/schemas/User'
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario creado
 * /api/usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
const { Router } = require("express");
const { check } = require("express-validator");
const {
  campoObligatorio,
  campoLongitud,
  campoEmail,
  campoNumerico,
  campoArray,
} = require("../middlewares/validar-genericas");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarPaginacion } = require("../middlewares/validar-inputs");

const {
  crearUsuario,
  actualizarUsuario,
  borrarUsuario,
  cambiarContrasena,
  resetearContrasena,
} = require("../controllers/usuarios");
const { getUsuarioPorId } = require("../controllers/usuarios");

const {
  getUsuariosPaginados,
  getDocumentosColeccion,
} = require("../controllers/busquedas");
const {
  asignarRoles,
  obtenerRolesUsuario,
  obtenerPermisosUsuario,
} = require("../controllers/usuarios-roles");
const {
  validarJWT,
  validarAdminRole,
  validarAdminRole_O_MismoUsuario,
} = require("../middlewares/validar-jwt");

const middlewareRegistrarAccion = require("../middlewares/auditoria");
const router = Router();

router.get("/", [validarJWT, validarPaginacion], getUsuariosPaginados);

// GET /api/usuarios/buscar/:q - Buscar usuarios por texto (nombre_usuario/nombres/correo)
router.get(
  "/buscar/:q",
  [validarJWT, validarRol("ADMIN_ROLE"), validarCampos],
  (req, res) => {
    req.params.tabla = "usuarios";
    req.params.busqueda = req.params.q;
    return getDocumentosColeccion(req, res);
  }
);

// GET /api/usuarios/buscar/id/:id - Buscar usuario por id (alias para /:id)
router.get(
  "/buscar/id/:id",
  [
    validarJWT,
    validarRol("ADMIN_ROLE"),
    campoNumerico("id", "No es un ID válido"),
    validarCampos,
  ],
  getUsuarioPorId
);

router.post(
  "/",
  [
    campoObligatorio("nombre_usuario", "El nombre de usuario es obligatorio"),
    campoLongitud(
      "nombre_usuario",
      3,
      50,
      "El nombre de usuario debe tener entre 3 y 50 caracteres"
    ),
    campoObligatorio("contrasena", "La contraseña es obligatoria"),
    campoLongitud(
      "contrasena",
      6,
      100,
      "La contraseña debe tener al menos 6 caracteres"
    ),
    campoObligatorio(
      "correo_electronico",
      "El correo electrónico es obligatorio"
    ),
    campoEmail("correo_electronico", "El correo electrónico debe ser válido"),
    campoObligatorio("nombres", "Los nombres son obligatorios"),
    campoLongitud(
      "nombres",
      2,
      100,
      "Los nombres deben tener entre 2 y 100 caracteres"
    ),
    campoObligatorio("apellidos", "Los apellidos son obligatorios"),
    campoLongitud(
      "apellidos",
      2,
      100,
      "Los apellidos deben tener entre 2 y 100 caracteres"
    ),
    validarCampos,
    middlewareRegistrarAccion("CREAR", "usuarios"),
  ],
  crearUsuario
);

router.put(
  "/:id",
  [
    validarJWT,
    validarAdminRole_O_MismoUsuario,
    campoNumerico("id", "No es un ID válido"),
    campoLongitud(
      "nombre_usuario",
      3,
      50,
      "El nombre de usuario debe tener entre 3 y 50 caracteres"
    ).optional(),
    campoEmail(
      "correo_electronico",
      "El correo electrónico debe ser válido"
    ).optional(),
    campoLongitud(
      "nombres",
      2,
      100,
      "Los nombres deben tener entre 2 y 100 caracteres"
    ).optional(),
    campoLongitud(
      "apellidos",
      2,
      100,
      "Los apellidos deben tener entre 2 y 100 caracteres"
    ).optional(),
    validarCampos,
    middlewareRegistrarAccion("ACTUALIZAR", "usuarios"),
  ],
  actualizarUsuario
);

// GET /api/usuarios/:id - obtener usuario por id (para formulario de edición)
router.get(
  "/:id",
  [validarJWT, campoNumerico("id", "No es un ID válido"), validarCampos],
  getUsuarioPorId
);

router.delete(
  "/:id",
  [
    validarJWT,
    validarAdminRole,
    campoNumerico("id", "No es un ID válido"),
    validarCampos,
    middlewareRegistrarAccion("ELIMINAR", "usuarios"),
  ],
  borrarUsuario
);

// Rutas para gestión de roles de usuario
router.post(
  "/roles/:id",
  [
    validarJWT,
    validarAdminRole,
    campoNumerico("id", "No es un ID válido"),
    campoArray("roles", "Los roles deben ser un array"),
    validarCampos,
  ],
  asignarRoles
);
router.post(
  "/roles/:id",
  [
    validarJWT,
    validarAdminRole,
    campoNumerico("id", "No es un ID válido"),
    campoArray("roles", "Los roles deben ser un array"),
    validarCampos,
  ],
  asignarRoles
);

// Eliminar la versión anterior y dejar solo la nueva con el id al final
router.get(
  "/roles/:id",
  [
    validarJWT,
    validarAdminRole_O_MismoUsuario,
    check("id", "No es un ID válido").isNumeric(),
    validarCampos,
  ],
  obtenerRolesUsuario
);

router.get(
  "/permisos/:id",
  [validarJWT, campoNumerico("id", "No es un ID válido"), validarCampos],
  obtenerPermisosUsuario
);

// PUT /api/usuarios/:id/cambiar-contrasena - Cambiar contraseña
router.put(
  "/cambiar-contrasena/:id",
  [
    validarJWT,
    validarAdminRole_O_MismoUsuario,
    campoNumerico("id", "No es un ID válido"),
    campoObligatorio(
      "contrasena_actual",
      "La contraseña actual es obligatoria"
    ),
    campoObligatorio("contrasena_nueva", "La contraseña nueva es obligatoria"),
    campoLongitud(
      "contrasena_nueva",
      6,
      100,
      "La contraseña nueva debe tener al menos 6 caracteres"
    ),
    validarCampos,
  ],
  cambiarContrasena
);

// PUT /api/usuarios/:id/resetear-contrasena - Resetear contraseña (solo admin)
router.put(
  "/resetear-contrasena:id/",
  [
    validarJWT,
    validarAdminRole,
    campoNumerico("id", "No es un ID válido"),
    campoObligatorio("contrasena_nueva", "La contraseña nueva es obligatoria"),
    campoLongitud(
      "contrasena_nueva",
      6,
      100,
      "La contraseña nueva debe tener al menos 6 caracteres"
    ),
    validarCampos,
  ],
  resetearContrasena
);

module.exports = router;
