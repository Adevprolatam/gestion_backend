const { Router } = require('express');
const router = Router();
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');

const {
    getAuditoriaLogsAll
} = require("../controllers/logAuditoria.controller");

// Obtener todos los logs de auditoría
router.get("/",[validarJWT,validarCoordinador], getAuditoriaLogsAll);

module.exports = router;