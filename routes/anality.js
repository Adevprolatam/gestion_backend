const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');

const {
    submitFeedback,
} = require("../controllers/feedback.controller");

const {
    obtenerEstadisticasSemanales,
} = require("../controllers/estadisticas.controller");

// Ruta para feedback (existente)
router.post('/feedback', [
    validarJWT,
    check('agendaId', 'El ID de la agenda es obligatorio').not().isEmpty(),
    check('rating', 'La calificación es obligatoria').isInt({ min: 1, max: 5 }),
    check('comentario', 'El comentario es opcional pero debe ser una cadena si se proporciona').optional().isString(),
    validarCampos
], submitFeedback);

// Nuevas rutas para estadísticas
router.get('/estadisticas/semanal', [
    validarJWT,
    validarCoordinador
], obtenerEstadisticasSemanales);
;

module.exports = router;