const { response } = require('express');
const { materiaModel } = require('../models/index');
const { registrarAuditoria } = require("../helpers/auditoria");

const crearMateria = async (req, res = response) => {
    const { materia, descripcion, nrc, creditos, departamento, nivel, carreras, tutor } = req.body;
    const coordinadorId = req.uid;

    try {
        // Verificar si ya existe una materia con el mismo NRC
        const materiaExistente = await materiaModel.findOne({ nrc });
        if (materiaExistente) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe una materia con ese NRC'
            });
        }

        const nuevaMateria = new materiaModel({
            coordinador: coordinadorId,
            materia,
            descripcion,
            nrc,
            creditos,
            departamento,
            nivel,
            carreras,
            tutor: tutor || null
        });

        await nuevaMateria.save();

        await registrarAuditoria({
            usuarioId: coordinadorId,
            accion: 'CREAR_MATERIA',
            descripcion: `Materia creada: ${materia} (NRC: ${nrc})`,
            entidad: 'Materia',
            entidadId: nuevaMateria._id,
            req
        });

        res.status(201).json({
            ok: true,
            materia: nuevaMateria
        });
    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: coordinadorId,
            accion: 'ERROR_CREAR_MATERIA',
            descripcion: `Error al crear materia: ${error.message}`,
            entidad: 'Materia',
            req
        });
        res.status(500).json({
            ok: false,
            msg: 'Error al crear materia'
        });
    }
};
const getMaterias = async (req, res = response) => {
  try {
    const materias = await materiaModel.find().populate("tutor", "nombre apellido email rol");
    res.status(200).json({
      ok: true,
      materias
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener las materias'
    });
  }
};


const getMateriasDocente = async (req, res = response) => {
  try {
    const docenteId = req.uid;

    const materias = await materiaModel.find({ tutor: docenteId })
      .select('materia descripcion nrc creditos nivel departamento carreras')
      .populate('coordinador', 'nombre apellido email');

    res.status(200).json({
      ok: true,
      materias
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener materias del docente'
    });
  }
};


module.exports = {
    crearMateria,
    getMaterias,
    getMateriasDocente
};
