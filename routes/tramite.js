const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');

const {
    crearSolicitudTutoria,
    getSolicitudesEstudiante,
    actualizarEstadoSolicitud
} = require("../controllers/solicitud.contoller");

// Obtener todos los trámites del estudiante autenticado
router.get("/tutoria", [validarJWT,validarCoordinador], getSolicitudesEstudiante);
router.patch("/tutoria/:id",[validarJWT,validarCoordinador], getSolicitudesEstudiante);


// Crear un nuevo trámite con estudiante extraído del token
router.post("/tutoria", [
    validarJWT,
    check('materia', 'La materia es obligatoria').not().isEmpty(),
    check('motivo', 'El motivo es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
    check('horarioPreferido', 'El horario preferido es obligatorio').not().isEmpty(),
    validarCampos
], crearSolicitudTutoria);

// Actualizar el estado de una solicitud de tutoría
router.patch('/:id/estado', [validarJWT, validarCoordinador], actualizarEstadoSolicitud);


module.exports = router;
