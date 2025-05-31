const { logAuditoriaModel } = require('../models/index');

const getAuditoriaLogsAll = async (req, res) => {
    try {
        const data = await logAuditoriaModel.find()
            .sort({ fecha: -1 }) // Equivalente a ORDER BY DESC
            .limit(100) // Limitar a 100 registros
            .populate('usuario', 'nombre email'); // Si quieres datos del usuario

        res.status(200).json({
            code: "200",
            ok: true,
            logs: data
        });
    } catch (error) {
        res.status(500).json({
            code: "500",
            ok: false,
            message: "Error al obtener los logs de auditoría",
            error: error.message
        });
    }
};

module.exports = {
    getAuditoriaLogsAll
}