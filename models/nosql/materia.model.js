const mongoose = require("mongoose");

const MateriaSchema = new mongoose.Schema({
  nrc: {
    type: Number,
    unique: true,
    required: true
  },
  materia: {
    type: String,
    required: true,
    trim: true
  },
  creditos: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },
  departamento: {
    type: String,
    enum: ['Computacion', 'Electronica', 'Mecanica', 'Administracion'],
    required: true
  },
  nivel: {
    type: String,
    enum: ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto'],
    required: true
  },
  tipo: {
    type: String,
    enum: ['Teórica', 'Práctica', 'Teórico-Práctica', 'Laboratorio'],
    default: 'Teórico-Práctica'
  },
  carreras: {
    type: String,
    enum: ['Software', 'Electronica', 'Mecanica'],
  },
  activa: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model("Materia", MateriaSchema);
