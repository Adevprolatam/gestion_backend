// controllers/franjaHoraria.controller.js
const { response } = require('express');
const { franjaHorariaModel } = require('../models/index');
const { registrarAuditoria } = require('../helpers/auditoria');

// Crear nueva franja horaria
const crearFranjaHoraria = async (req, res = response) => {
  const { dia, horaInicio, horaFin, fechaEspecifica, materia } = req.body;
  const tutorId = req.uid;

  try {
    const nuevaFranja = new franjaHorariaModel({
      tutor: tutorId,
      dia,
      horaInicio,
      horaFin,
      materia,
      fechaEspecifica: fechaEspecifica || null
    });

    await nuevaFranja.save();

    await registrarAuditoria({
      usuarioId: tutorId,
      accion: 'CREAR_FRANJA_HORARIA',
      descripcion: `Franja creada: ${dia} ${horaInicio}-${horaFin}, Materia: ${materia}`,
      entidad: 'FranjaHoraria',
      entidadId: nuevaFranja._id,
      req
    });

    res.status(201).json({
      ok: true,
      franjaHoraria: await nuevaFranja.populate('materia', 'materia nrc')
    });

  } catch (error) {
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: tutorId,
      accion: 'ERROR_CREAR_FRANJA_HORARIA',
      descripcion: `Error: ${error.message}`,
      entidad: 'FranjaHoraria',
      req
    });
    
    // Respuesta de error detallada
    res.status(400).json({
      ok: false,
      msg: error.message // Envía el mensaje completo del error
    });
  }
};

// Obtener franjas del tutor
const obtenerFranjasTutor = async (req, res = response) => {
  const tutorId = req.uid;

  try {
    const franjas = await franjaHorariaModel.find({ tutor: tutorId })
      .populate('materia', 'materia nrc departamento nivel') // ¡Nuevo populate!
      .sort({ dia: 1, horaInicio: 1 });

    res.json({
      ok: true,
      franjasHorarias: franjas
    });

  } catch (error) {
    console.error('Error al obtener franjas:', error);
    
    await registrarAuditoria({
      usuarioId: tutorId,
      accion: 'ERROR_OBTENER_FRANJAS',
      descripcion: `Error al obtener franjas: ${error.message}`,
      entidad: 'FranjaHoraria',
      req
    });
    
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener franjas horarias'
    });
  }
};

// Obtener franjas disponibles para estudiantes
const obtenerFranjasDisponibles = async (req, res = response) => {
  const { materia, dia } = req.query;

  try {
    const query = { disponible: true };
    if (dia) query.dia = dia;

    const franjas = await franjaHorariaModel.find(query)
      .populate('tutor', 'nombre apellido')
      .populate('materia', 'materia nrc departamento nivel') // ¡Nuevo populate!
      .sort({ dia: 1, horaInicio: 1 });

    // Filtrar por materia si se especificó
    const resultado = materia
      ? franjas.filter(f => f.materia && f.materia._id.toString() === materia)
      : franjas;

    res.json({
      ok: true,
      franjasDisponibles: resultado
    });

  } catch (error) {
    console.error('Error al obtener franjas disponibles:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener franjas disponibles'
    });
  }
};

module.exports = {
  crearFranjaHoraria,
  obtenerFranjasTutor,
  obtenerFranjasDisponibles
};