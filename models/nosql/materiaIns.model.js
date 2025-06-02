const mongoose = require("mongoose");

const InscripcionSchema = new mongoose.Schema({
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  materia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Materia",
    required: true
  },
 // tutor: {
   // type: mongoose.Schema.Types.ObjectId,
   // ref: "Usuario",
   // required: true
  //},
  fechaInscripcion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model("Inscripcion", InscripcionSchema);
