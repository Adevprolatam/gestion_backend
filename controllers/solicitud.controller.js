const { response } = require('express');
const { solicitudModel,agendaModel } = require('../models/index');
const { registrarAuditoria } = require("../helpers/auditoria");

const crearSolicitudTutoria = async (req, res = response) => {
    const { materia, motivo, horarioPreferido, descripcion } = req.body;
    const estudianteId = req.uid;

    try {
        const nuevaSolicitud = new solicitudModel({
            estudiante: estudianteId,
            materia,
            motivo,
            descripcion,
            horarioPreferido,
            estado: 'PENDIENTE' // Estado inicial
        });

        await nuevaSolicitud.save();

        await registrarAuditoria({
            usuarioId: estudianteId,
            accion: 'CREAR_SOLICITUD_TUTORIA',
            descripcion: `Solicitud creada para materia: ${materia}`,
            entidad: 'SolicitudTutoria',
            entidadId: nuevaSolicitud._id,
            req
        });

        res.status(201).json({ 
            ok: true, 
            solicitud: nuevaSolicitud 
        });
    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: estudianteId,
            accion: 'ERROR_CREAR_SOLICITUD_TUTORIA',
            descripcion: `Error al crear solicitud: ${error.message}`,
            entidad: 'SolicitudTutoria',
            req
        });
        res.status(500).json({ 
            ok: false, 
            msg: 'Error al crear solicitud de tutoría' 
        });
    }
};

const getSolicitudesEstudiante = async (req, res = response) => {
    try {
        const solicitudes = await solicitudModel.find();
        res.json({ 
            ok: true, 
            solicitudes 
        });
    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: estudianteId,
            accion: 'ERROR_CONSULTA_SOLICITUDES_ESTUDIANTE',
            descripcion: `Error al obtener solicitudes: ${error.message}`,
            entidad: 'SolicitudTutoria',
            req
        });
        res.status(500).json({ 
            ok: false, 
            msg: 'Error al obtener solicitudes' 
        });
    }
};

const actualizarEstadoSolicitud = async (req, res = response) => {
    const { id } = req.params;
    const { estado } = req.body;
    const usuarioId = req.uid;

    try {
        const estadosPermitidos = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'];
        if (!estadosPermitidos.includes(estado)) {
            await registrarAuditoria({
                usuarioId,
                accion: 'ERROR_ACTUALIZAR_ESTADO',
                descripcion: `Intento de cambio a estado no permitido: ${estado}`,
                entidad: 'SolicitudTutoria',
                entidadId: id,
                req
            });
            return res.status(400).json({ ok: false, msg: 'Estado no válido' });
        }

        const solicitud = await solicitudModel.findById(id);
        if (!solicitud) {
            await registrarAuditoria({
                usuarioId,
                accion: 'ERROR_ACTUALIZAR_ESTADO',
                descripcion: `Solicitud no encontrada: ${id}`,
                entidad: 'SolicitudTutoria',
                req
            });
            return res.status(404).json({ ok: false, msg: 'Solicitud no encontrada' });
        }

        // Validar transición de estados
        if (solicitud.estado === 'APROBADA' && estado === 'PENDIENTE') {
            await registrarAuditoria({
                usuarioId,
                accion: 'INTENTO_REVERTIR_APROBADA',
                descripcion: `Intento de revertir solicitud aprobada a pendiente: ${id}`,
                entidad: 'SolicitudTutoria',
                entidadId: id,
                req
            });
            return res.status(400).json({ 
                ok: false, 
                msg: 'No se puede revertir una solicitud aprobada' 
            });
        }

        const estadoAnterior = solicitud.estado;
        solicitud.estado = estado;

        // CREAR AGENDA SI SE APRUEBA
        if (estado === 'APROBADA') {
            const agendaExistente = await agendaModel.findOne({ solicitud: id });
            if (!agendaExistente) {
                const nuevaAgenda = await agendaModel.create({ solicitud: id });
                
                await registrarAuditoria({
                    usuarioId,
                    accion: 'CREAR_AGENDA',
                    descripcion: `Agenda creada para solicitud ${id}`,
                    entidad: 'Agenda',
                    entidadId: nuevaAgenda._id, // Usar ID de la agenda, no de la solicitud
                    req
                });
            } else {
                await registrarAuditoria({
                    usuarioId,
                    accion: 'AGENDA_DUPLICADA',
                    descripcion: `Intento de crear agenda duplicada para solicitud ${id}`,
                    entidad: 'Agenda',
                    entidadId: agendaExistente._id,
                    req
                });
            }
        }

        await solicitud.save();

        await registrarAuditoria({
            usuarioId,
            accion: 'ACTUALIZAR_ESTADO_SOLICITUD',
            descripcion: `Cambió estado de "${estadoAnterior}" a "${estado}"`,
            entidad: 'SolicitudTutoria',
            entidadId: solicitud._id,
            req
        });

        res.json({ ok: true, solicitud });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId,
            accion: 'ERROR_ACTUALIZAR_ESTADO_SOLICITUD',
            descripcion: `Error: ${error.message} | Solicitud: ${id} | Estado intentado: ${estado}`,
            entidad: 'SolicitudTutoria',
            entidadId: id,
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al actualizar estado' });
    }
};

module.exports = {
    crearSolicitudTutoria,
    getSolicitudesEstudiante,
    actualizarEstadoSolicitud
};