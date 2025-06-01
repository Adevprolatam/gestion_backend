const { feedbackModel, agendaModel } = require('../models/index'); 

const submitFeedback = async (req, res) => {
  const { agendaId, rating, comentario } = req.body; 
  const estudianteId = req.uid;

  try {
    // 1. Verificar si la agenda existe y está REALIZADA
    const agenda = await agendaModel.findOne({
      _id: agendaId,
      estado: 'REALIZADA'
    }).populate({
      path: 'solicitud',
      match: { estudiante: estudianteId }
    });

    if (!agenda || !agenda.solicitud) {
      return res.status(400).json({
        ok: false,
        msg: "No puedes calificar esta sesión (no existe, no realizada o no es tuya)"
      });
    }

    // 2. Evitar feedback duplicado
    const feedbackExistente = await feedbackModel.findOne({ agenda: agendaId });
    if (feedbackExistente) {
      return res.status(400).json({ ok: false, msg: "Ya calificaste esta tutoría" });
    }

    // 3. Crear feedback vinculado a AGENDA
    const nuevoFeedback = new feedbackModel({
      agenda: agendaId,
      estudiante: estudianteId,
      tutor: agenda.solicitud.tutor,
      materia: agenda.solicitud.materia,
      rating,
      comentario: comentario || ""
    });

    await nuevoFeedback.save();

    res.status(201).json({
      ok: true,
      feedback: {
        id: nuevoFeedback._id,
        rating: nuevoFeedback.rating,
        comentario: nuevoFeedback.comentario,
        createdAt: nuevoFeedback.createdAt
      }
    });

  } catch (error) {
    console.error('Error en submitFeedback:', error);
    res.status(500).json({ ok: false, msg: "Error al registrar feedback" });
  }
};

module.exports = { submitFeedback };