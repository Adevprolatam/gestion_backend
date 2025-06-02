// models/Estadistica.js
const mongoose = require('mongoose');

const EstadisticaTutoriaSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  materia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materia',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  sesionesRealizadas: {
    type: Number,
    default: 0
  },
  feedbacksRecibidos: {
    type: Number,
    default: 0
  },
  promedioRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para mejor performance
EstadisticaTutoriaSchema.index({ tutor: 1, materia: 1, fecha: 1 });

module.exports = mongoose.model('EstadisticaTutoria', EstadisticaTutoriaSchema);