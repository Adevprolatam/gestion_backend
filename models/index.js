const models = {
     userModel:require('./nosql/user.model'),
     logAuditoriaModel:require('./nosql/logAuditoria.model'),
     solicitudModel:require('./nosql/solicitud.model'),
     materiaModel:require('./nosql/materia.model'),
     franjaHorariaModel:require('./nosql/franjaHoraria.model'),
     
     ///itemModel:require('./nosql/item.model'),
     //facturaModel:require('./nosql/factura.model'),
     //redemptionCodeModel:require('./nosql/redemptionCode'),
     //discountModel:require('./nosql/discount.model')
}

module.exports = models;