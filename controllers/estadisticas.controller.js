// controllers/estadisticas.controller.js
const AnalyticsService = require('../controllers/anality.controller');
const { allAgenda } = require('./agenda.controller');
const {feedbackModel} =  require('../models/index');

const analyticsService = new AnalyticsService();


const obtenerEstadisticasSemanales = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    // Obtener sesiones realizadas
    const sesiones = await allAgenda({
      estado: 'REALIZADA',
      fechaRealizada: {
        $gte: inicioSemana,
        $lte: finSemana
      }
    });

    const idsAgendas = sesiones.map(s => s._id);

    // Obtener feedbacks relacionados a esas sesiones
    const feedbacks = await feedbackModel.find({ agenda: { $in: idsAgendas } });

    // Procesar estadísticas
    const estadisticas = analyticsService.processForReport(sesiones, {
      inicio: inicioSemana,
      fin: finSemana
    }, feedbacks);

    res.json({
      ok: true,
      estadisticas
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener estadísticas'
    });
  }
};

module.exports = {
  obtenerEstadisticasSemanales
};