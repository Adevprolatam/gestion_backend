
const { Router } = require('express');
const { check } = require('express-validator'); // Importa check aquí
const router = Router();
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');


// MATERIA
const {
    crearInscripcion,
    obtenerMateriasSegunRol
} = require('../controllers/inscripcion.controller');

router.get("/",() => {
    console.log("Ruta de inscripciones");
});

// Rutas para obtener materias según el rol
router.get('/materias', 
    [
        validarJWT
    ], 
    obtenerMateriasSegunRol
);
// Routes para materia
router.post('/inscripcion', 
    [
        validarJWT,
        check('materia', 'La materia es obligatoria').not().isEmpty(),
        validarCampos
    ], 
    crearInscripcion
);


module.exports = router;