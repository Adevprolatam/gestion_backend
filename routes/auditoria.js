const { Router } = require('express');
const router = Router();

const {
    getAuditoriaLogsAll
} = require("../controllers/logAuditoria.controller");

// Obtener todos los logs de auditoría
router.get("/", getAuditoriaLogsAll);

module.exports = router;