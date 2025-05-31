const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
    },
    apellido: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    rol: {
      type: String,
      enum: ["estudiante", "tutor", "coordinador"],
      default: "estudiante"
    },
    telefono: {
      type: String
    },
    fechaNacimiento: {
      type: Date
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UsuarioSchema.method("toJSON", function () {
  const { _id, password, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
