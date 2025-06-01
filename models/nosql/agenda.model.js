const mongoose = require("mongoose");

const AgendaSchema = new mongoose.Schema({
  solicitud: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolicitudTutoria',
    required: true,
    unique: true // Relación 1:1 con solicitud aprobada
  },
  fechaRealizada: {
    type: Date,
    default: null // Se actualiza post-tutoría
  },
  estado: {
    type: String,
    enum: ['PROGRAMADA', 'REALIZADA', 'CANCELADA'],
    default: 'PROGRAMADA'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware para actualizar estado de solicitud relacionada
AgendaSchema.post('save', async function(doc) {
  await mongoose.model('SolicitudTutoria').findByIdAndUpdate(
    doc.solicitud,
    { estado: 'COMPLETADA' }
  );
});

module.exports = mongoose.model("Agenda", AgendaSchema);