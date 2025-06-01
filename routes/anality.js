const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');

const {
    submitFeedback,
} = require("../controllers/feedback.controller");


router.post('/feedback', [
    validarJWT,
    check('solicitudId', 'El ID de la solicitud es obligatorio').not().isEmpty(),
    check('rating', 'La calificación es obligatoria').isInt({ min: 1, max: 5 }),
    check('comentario', 'El comentario es opcional pero debe ser una cadena si se proporciona').optional().isString(),
    validarCampos
], submitFeedback);
// http://localhost:3000/api/anality/feedback


module.exports = router;
