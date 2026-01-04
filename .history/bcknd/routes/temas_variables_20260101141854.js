const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarRol } = require('../middlewares/validar-permisos');
const { validarCampos } = require('../middlewares/validar-campos');
const {
  listVariables,
  getVariable,
  createVariable,
  updateVariable,
  deleteVariable,
  getValuesForTheme,
  setValueForTheme,
} = require('../controllers/temas_variables');

const router = Router();

// Listar y buscar
router.get('/', listVariables);

// Obtener variable por id
router.get('/:id', [check('id').isInt().withMessage('ID inválido'), validarCampos], getVariable);

// Valores por tema
router.get('/values/:id_tema', getValuesForTheme);

// Mutations: require admin
router.post('/', [validarJWT, validarRol('ADMIN_ROLE'), check('clave', 'Clave requerida').notEmpty(), validarCampos], createVariable);

router.put('/:id', [validarJWT, validarRol('ADMIN_ROLE'), check('id', 'ID inválido').isInt(), validarCampos], updateVariable);

router.delete('/:id', [validarJWT, validarRol('ADMIN_ROLE'), check('id', 'ID inválido').isInt(), validarCampos], deleteVariable);

// Set value for theme (protected)
router.post('/values', [validarJWT, validarRol('ADMIN_ROLE'), check('id_tema').notEmpty(), check('id_tema_var').isInt(), validarCampos], setValueForTheme);

module.exports = router;
