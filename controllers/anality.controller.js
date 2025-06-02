// services/analytics.service.js
class AnalyticsService {
  constructor() {
    this.cache = new Map();
  }

  processForReport(sesiones, periodo, feedbacks = []) {
  const stats = {
    periodo,
    totalSesiones: 0,
    totalFeedbacks: 0,
    promedioRating: 0,
    datosPorTutor: {},
    datosPorMateria: {},
    sesionesPorDia: {}
  };

  const feedbackPorAgenda = new Map();
  feedbacks.forEach(fb => {
    feedbackPorAgenda.set(fb.agenda.toString(), fb);
  });

  let sumaRatings = 0;

  sesiones.forEach(sesion => {
    if (!sesion.solicitud || !sesion.solicitud.materia) return;

    const tutor = sesion.solicitud.tutor || sesion.solicitud.materia.tutor;
    const tutorId = tutor?._id?.toString() || 'sin-tutor';
    const tutorNombre = tutor?.nombre || 'Tutor no asignado';
    const materiaId = sesion.solicitud.materia._id.toString();
    const materiaNombre = sesion.solicitud.materia.materia;
    const fecha = sesion.fechaRealizada.toISOString().split('T')[0];

    // Actualizar estadísticas por tutor
    if (!stats.datosPorTutor[tutorId]) {
      stats.datosPorTutor[tutorId] = {
        tutor: {
          id: tutorId,
          nombre: tutorNombre,
          email: tutor?.email || '',
          rol: tutor?.rol || 'tutor'
        },
        materias: {},
        totalSesiones: 0,
        totalFeedbacks: 0,
        promedioRating: 0
      };
    }

    if (!stats.datosPorTutor[tutorId].materias[materiaId]) {
      stats.datosPorTutor[tutorId].materias[materiaId] = {
        materia: { id: materiaId, nombre: materiaNombre },
        sesiones: 0
      };
    }

    stats.datosPorTutor[tutorId].materias[materiaId].sesiones++;
    stats.datosPorTutor[tutorId].totalSesiones++;

    // Actualizar estadísticas por materia
    if (!stats.datosPorMateria[materiaId]) {
      stats.datosPorMateria[materiaId] = {
        materia: { id: materiaId, nombre: materiaNombre },
        tutores: {},
        totalSesiones: 0
      };
    }

    if (!stats.datosPorMateria[materiaId].tutores[tutorId]) {
      stats.datosPorMateria[materiaId].tutores[tutorId] = {
        tutor: { id: tutorId, nombre: tutorNombre },
        sesiones: 0
      };
    }

    stats.datosPorMateria[materiaId].tutores[tutorId].sesiones++;
    stats.datosPorMateria[materiaId].totalSesiones++;

    // Actualizar sesiones por día
    stats.sesionesPorDia[fecha] = (stats.sesionesPorDia[fecha] || 0) + 1;

    stats.totalSesiones++;

    // Si tiene feedback, incluirlo
    const feedback = feedbackPorAgenda.get(sesion._id.toString());
    if (feedback) {
      stats.totalFeedbacks++;
      sumaRatings += feedback.rating;
      stats.datosPorTutor[tutorId].totalFeedbacks++;
    }
  });

  // Promedio general
  stats.promedioRating = stats.totalFeedbacks > 0 ? (sumaRatings / stats.totalFeedbacks).toFixed(2) : 0;

  // Convertir a arrays
  stats.datosPorTutor = Object.values(stats.datosPorTutor).map(tutor => ({
    ...tutor,
    materias: Object.values(tutor.materias),
    promedioRating: tutor.totalFeedbacks > 0 ? (sumaRatings / tutor.totalFeedbacks).toFixed(2) : 0
  }));

  stats.datosPorMateria = Object.values(stats.datosPorMateria).map(materia => ({
    ...materia,
    tutores: Object.values(materia.tutores)
  }));

  stats.sesionesPorDia = Object.entries(stats.sesionesPorDia).map(([fecha, cantidad]) => ({
    fecha,
    cantidad
  }));

  return stats;
}

}

module.exports = AnalyticsService;