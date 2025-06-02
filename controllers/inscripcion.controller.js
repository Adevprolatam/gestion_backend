const { materiaModel, materiaInsModel } = require("../models/index");
const { registrarAuditoria } = require("../helpers/auditoria");

const crearInscripcion = async (req, res) => {
  try {
    const { materia } = req.body;
    const estudianteId = req.uid; 

    // Verificar si la materia existe y está activa
    const materiaData = await materiaModel.findById(materia);
    if (!materiaData || !materiaData.activa) {
      return res.status(400).json({ msg: "La materia no existe o está inactiva" });
    }

    // Verificar si ya está inscrito en esa materia
    const yaInscrito = await materiaInsModel.findOne({ estudiante: estudianteId, materia });
    if (yaInscrito) {
      return res.status(400).json({ msg: "Ya estás inscrito en esta materia" });
    }

    // Crear inscripción
    const nuevaInscripcion = new materiaInsModel({
      estudiante: estudianteId,
      materia
    });

    await nuevaInscripcion.save();

    // Auditoría
    await registrarAuditoria({
      usuarioId: estudianteId,
      accion: 'INSCRIBIR_MATERIA',
      descripcion: `Inscripción creada para materia: ${materiaData.materia}`,
      entidad: 'Inscripcion',
      entidadId: nuevaInscripcion._id,
      req
    });

    res.status(201).json({
      msg: "Inscripción realizada exitosamente",
      inscripcion: nuevaInscripcion
    });
  } catch (error) {
    console.error("Error al inscribirse:", error);
    res.status(500).json({ msg: "Error del servidor al inscribirse" });
  }
};

const obtenerMateriasSegunRol = async (req, res) => {
  try {
    const usuarioId = req.uid;
    const rol = req.rol; 

    if (rol === 'estudiante') {
      // Traer materias inscritas del estudiante
      const inscripciones = await materiaInsModel.find({ estudiante: usuarioId })
        .populate({
          path: 'materia',
          select: 'nrc materia creditos departamento nivel tipo activa',
          populate: {
            path: 'tutor',
            select: 'nombre apellido email'
          }
        });

      const materias = inscripciones.map(ins => ({
        id: ins._id,
        nrc: ins.materia.nrc,
        nombre: ins.materia.materia,
        creditos: ins.materia.creditos,
        nivel: ins.materia.nivel,
        tipo: ins.materia.tipo,
        departamento: ins.materia.departamento,
        tutor: ins.materia.tutor ? {
          nombre: ins.materia.tutor.nombre,
          apellido: ins.materia.tutor.apellido,
          email: ins.materia.tutor.email
        } : null
      }));

      return res.json({ materias });

    } else if (rol === 'tutor') {
      // Traer estudiantes inscritos en las materias del tutor
      const materias = await materiaModel.find({ tutor: usuarioId });

      const inscripciones = await materiaInsModel.find({
        materia: { $in: materias.map(m => m._id) }
      }).populate('estudiante', 'nombre apellido email')
        .populate('materia', 'nrc materia');

      const agrupado = {};

      inscripciones.forEach(ins => {
        const materiaId = ins.materia._id.toString();
        if (!agrupado[materiaId]) {
          agrupado[materiaId] = {
            materia: ins.materia.materia,
            nrc: ins.materia.nrc,
            estudiantes: []
          };
        }
        agrupado[materiaId].estudiantes.push({
          nombre: ins.estudiante.nombre,
          apellido: ins.estudiante.apellido,
          email: ins.estudiante.email
        });
      });

      return res.json(Object.values(agrupado));
    } else {
      return res.status(403).json({ msg: "Rol no autorizado para esta operación" });
    }
  } catch (error) {
    console.error("Error al obtener materias o estudiantes:", error);
    return res.status(500).json({ msg: "Error del servidor" });
  }
};


module.exports = {
  crearInscripcion,
  obtenerMateriasSegunRol
};
