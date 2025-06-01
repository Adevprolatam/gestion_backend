const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');

const {
    crearMateria,
    getMaterias
} = require("../controllers/materia.controller");

// Rutas para manejar las materias
router.post('/', [
    validarJWT,
    validarCoordinador,
    check('nrc', 'El NRC es obligatorio').not().isEmpty(),
    check('materia', 'El nombre de la materia es obligatorio').not().isEmpty(),
    check('creditos', 'Los créditos son obligatorios y deben ser un número entre 1 y 8').isInt({ min: 1, max: 8 }),
    check('departamento', 'El departamento es obligatorio').not().isEmpty(),
    check('nivel', 'El nivel es obligatorio').not().isEmpty(),
    validarCampos
], crearMateria);

router.get('/',validarJWT,getMaterias);


module.exports = router;
