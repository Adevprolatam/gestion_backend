const mongoose = require("mongoose");

const SolicitudTutoriaSchema = new mongoose.Schema({
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    materia: {
        type: String,
        required: true
    },
    motivo: {
        type: String,
        required: true
    },
    descripcion: String,
    horarioPreferido: String,
    estado: {
        type: String,
        enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA'],
        default: 'PENDIENTE'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date
    }
});

// Middleware para actualizar fecha de modificación
SolicitudTutoriaSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

module.exports = mongoose.model("SolicitudTutoria", SolicitudTutoriaSchema);
