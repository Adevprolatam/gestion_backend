// models/franjaHoraria.model.js
const mongoose = require('mongoose');

const FranjaHorariaSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  dia: {
    type: String,
    enum: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
    required: true
  },
  horaInicio: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // Formato HH:MM
  },
  horaFin: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  },
  disponible: {
    type: Boolean,
    default: true
  },
  materia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Materia',
    required: true
  },
  fechaEspecifica: {
    type: Date,
    required: false
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

// Validación para evitar solapamientos
FranjaHorariaSchema.pre('save', async function(next) {
  const franja = this;
  
  if (franja.horaInicio >= franja.horaFin) {
    throw new Error('La hora de fin debe ser mayor a la hora de inicio');
  }

  const query = {
    tutor: franja.tutor,
    $or: [
      { 
        horaInicio: { $lt: franja.horaFin },
        horaFin: { $gt: franja.horaInicio }
      }
    ]
  };

  if (franja.fechaEspecifica) {
    query.fechaEspecifica = franja.fechaEspecifica;
  } else {
    query.dia = franja.dia;
  }

  if (!franja.isNew) {
    query._id = { $ne: franja._id };
  }

  const solapamiento = await this.constructor.findOne(query)
    .populate('materia', 'materia nrc'); // Populate para mensaje más útil

  if (solapamiento) {
    throw new Error(`Ya tienes una franja horaria en ese rango: ${solapamiento.dia} ${solapamiento.horaInicio}-${solapamiento.horaFin} (${solapamiento.materia.materia} - NRC: ${solapamiento.materia.nrc})`);
  }

  next();
});

module.exports = mongoose.model('FranjaHoraria', FranjaHorariaSchema);