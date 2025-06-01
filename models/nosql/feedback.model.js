const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  agenda: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agenda',
    required: true
  },
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comentario: {
    type: String,
    default: ""
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