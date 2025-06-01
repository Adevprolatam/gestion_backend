// routes/franjaHoraria.js
const express = require('express');
const { check } = require('express-validator'); 
const router = express.Router();
const { validarJWT, validarTutor } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const {
  crearFranjaHoraria,
  obtenerFranjasTutor,
  obtenerFranjasDisponibles
} = require('../controllers/franjaHoraria.controller');

const {  
  marcarSesionRealizada,
  obtenerSesionesUsuario
} = require("../controllers/agenda.controller");

// Rutas para tutores (requieren autenticación y rol de tutor)
router.post('/', 
  [
    validarJWT, 
    validarTutor, 
    check('materia', 'La materia es obligatoria').not().isEmpty(),
    check('dia', 'El día es obligatorio').not().isEmpty(),
    check('horaInicio', 'La hora de inicio es obligatoria').not().isEmpty(),
    check('horaFin', 'La hora de fin es obligatoria').not().isEmpty(),
    check('horaInicio', 'Formato de hora de inicio inválido').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    check('horaFin', 'Formato de hora de fin inválido').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    check('fechaEspecifica', 'La fecha específica debe ser una fecha válida').optional().isISO8601(),
    validarCampos, 
  ], 
  crearFranjaHoraria
);

// Ruta para obtener las franjas horarias de un tutor
router.get('/mis-franjas', [validarJWT, validarTutor], obtenerFranjasTutor);

// Ruta pública para estudiantes
router.get('/disponibles', obtenerFranjasDisponibles);

// Ruta para marcar sesión realizada
router.patch('/sesion/:id', 
  [
    validarJWT,
    validarTutor, 
    check('id', 'El ID de la agenda es obligatorio').not().isEmpty(),
    validarCampos
  ], 
  marcarSesionRealizada
);
// Ruta para obtener sesiones de un usuario
router.get('/sesiones',[validarJWT], obtenerSesionesUsuario);

module.exports = router;