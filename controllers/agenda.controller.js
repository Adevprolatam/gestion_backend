const { response } = require('express');
const { agendaModel, solicitudModel } = require('../models/index');
const { registrarAuditoria } = require('../helpers/auditoria');

// Marcar sesión como realizada
const marcarSesionRealizada = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.uid;

    try {
        let agenda = await agendaModel.findById(id);
        if (!agenda) {
            return res.status(404).json({ ok: false, msg: 'Sesión no encontrada' });
        }

        // Poblamos correctamente la solicitud
        agenda = await agenda.populate('solicitud');

        if (!agenda.solicitud) {
            return res.status(400).json({ ok: false, msg: 'No se pudo obtener la solicitud asociada' });
        }

        if (agenda.solicitud.estado !== 'APROBADA') {
            return res.status(400).json({ 
                ok: false, 
                msg: 'La solicitud asociada no está aprobada' 
            });
        }

        // Actualizar agenda
        agenda.fechaRealizada = new Date();
        agenda.estado = 'REALIZADA';
        await agenda.save();

        await registrarAuditoria({
            usuarioId,
            accion: 'MARCAR_SESION_REALIZADA',
            descripcion: `Sesión realizada para solicitud: ${agenda.solicitud._id}`,
            entidad: 'Agenda',
            entidadId: agenda._id,
            req
        });

        res.json({ ok: true, agenda });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId,
            accion: 'ERROR_MARCAR_SESION_REALIZADA',
            descripcion: `Error: ${error.message}`,
            entidad: 'Agenda',
            entidadId: id,
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al actualizar sesión' });
    }
};


// Obtener sesiones por usuario
const obtenerSesionesUsuario = async (req, res) => {
    const usuarioId = req.uid;
    const { rol } = req;

    try {
        // Buscar solicitudes asociadas al usuario según el rol
        let solicitudesUsuario = [];
        if (rol === 'estudiante') {
           solicitudesUsuario = await solicitudModel.find({ estudiante: usuarioId }).select('_id');
        } else if (rol === 'tutor') {
            solicitudesUsuario = await solicitudModel.find({ tutor: usuarioId }).select('_id');
        } else {
           return res.status(403).json({ ok: false, msg: 'Rol no autorizado' });
        }
        console.log('Rol no autorizado:', rol);
        const solicitudIds = solicitudesUsuario.map(s => s._id);

        // Buscar agendas relacionadas con las solicitudes del usuario
        const sesiones = await agendaModel.find({ solicitud: { $in: solicitudIds } })
            .populate({
                path: 'solicitud',
                populate: [
                    { path: 'estudiante', select: 'nombre apellido' },
                    { path: 'tutor', select: 'nombre apellido' },
                    { path: 'materia', select: 'materia nrc' }
                ]
            })
            .sort({ fechaRealizada: -1 });

        res.json({ ok: true, sesiones });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener sesiones' });
    }
};


module.exports = {
    marcarSesionRealizada,
    obtenerSesionesUsuario
};