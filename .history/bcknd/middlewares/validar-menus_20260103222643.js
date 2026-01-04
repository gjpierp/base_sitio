/**
 * Middleware: validar-menus.js
 * Propósito: Validadores específicos para endpoints de menús (nombre, url,
 * icono, nivel, orden, visibilidad, permisos, etc.). Exporta arrays de
 * middlewares reutilizables basados en express-validator.
 */
// Middlewares personalizados para validación de menús
const { check } = require("express-validator");
const {
  campoObligatorio,
  campoLongitud,
  campoNumerico,
  campoArray,
} = require("../middlewares/validar-genericas");
const { validarCampos } = require("./validar-campos");

const validarIdMenu = [
  campoNumerico("id", "El id debe ser numérico"),
  validarCampos,
];

const validarNombreMenu = [
  campoObligatorio("nombre", "El nombre es obligatorio"),
  check("nombre", "El nombre debe tener máximo 50 caracteres").isLength({
    max: 50,
  }),
  validarCampos,
];

const validarUrlMenu = [
  campoObligatorio("url", "La url es obligatoria"),
  check("url", "La url debe tener máximo 100 caracteres").isLength({
    max: 100,
  }),
  validarCampos,
];

const validarIconoMenu = [
  campoObligatorio("icono", "El icono es obligatorio"),
  check("icono", "El icono debe tener máximo 50 caracteres").isLength({
    max: 50,
  }),
  validarCampos,
];

const validarNombreMenuOptional = [
  check("nombre", "El nombre debe tener máximo 50 caracteres")
    .optional()
    .isLength({ max: 50 }),
  validarCampos,
];

const validarUrlMenuOptional = [
  check("url", "La url debe tener máximo 100 caracteres")
    .optional()
    .isLength({ max: 100 }),
  validarCampos,
];

const validarIconoMenuOptional = [
  check("icono", "El icono debe tener máximo 50 caracteres")
    .optional()
    .isLength({ max: 50 }),
  validarCampos,
];

const validarNivelMenu = [
  campoNumerico("nivel", "El nivel es obligatorio"),
  validarCampos,
];

const validarNivelMenuOptional = [
  check("nivel", "El nivel debe ser numérico").optional().isNumeric(),
  validarCampos,
];

const validarOrdenMenuOptional = [
  check("orden", "El orden debe ser numérico").optional().isNumeric(),
  validarCampos,
];

const validarVisibleMenuOptional = [
  check("visible", "El campo visible debe ser un booleano")
    .optional()
    .isBoolean(),
  validarCampos,
];

const validarIdMenuPadreOptional = [
  check("id_menu_padre", "El id del menú padre debe ser numérico")
    .optional({ nullable: true })
    .isNumeric(),
  validarCampos,
];

const validarPermisosArray = [
  campoArray("permisos", "Los permisos deben ser un array"),
  validarCampos,
];

module.exports = {
  validarIdMenu,
  validarNombreMenu,
  validarNombreMenuOptional,
  validarUrlMenu,
  validarUrlMenuOptional,
  validarIconoMenu,
  validarIconoMenuOptional,
  validarNivelMenu,
  validarNivelMenuOptional,
  validarOrdenMenuOptional,
  validarVisibleMenuOptional,
  validarIdMenuPadreOptional,
  validarPermisosArray,
};
