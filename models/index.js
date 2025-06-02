const models = {
     userModel:require('./nosql/user.model'),
     logAuditoriaModel:require('./nosql/logAuditoria.model'),
     solicitudModel:require('./nosql/solicitud.model'),
     materiaModel:require('./nosql/materia.model'),
     franjaHorariaModel:require('./nosql/franjaHoraria.model'),
     feedbackModel:require('./nosql/feedback.model'),
     agendaModel:require('./nosql/agenda.model'),
     materiaInsModel:require('./nosql/materiaIns.model'),
     estadisticaModel:require('./nosql/estadistica.model'),
}

module.exports = models;