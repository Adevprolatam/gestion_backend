const { response } = require('express');
const { solicitudModel } = require('../models/index');
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
        // Validar estados permitidos
        const estadosPermitidos = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                ok: false,
                msg: 'Estado no válido'
            });
        }

        const solicitud = await solicitudModel.findById(id);
        if (!solicitud) {
            return res.status(404).json({
                ok: false,
                msg: 'Solicitud no encontrada'
            });
        }

        // Guardar el estado anterior para el registro de auditoría
        const estadoAnterior = solicitud.estado;

        // Actualizar el estado
        solicitud.estado = estado;
        await solicitud.save();

        // Registrar auditoría del cambio
        await registrarAuditoria({
            usuarioId: usuarioId,
            accion: 'ACTUALIZAR_ESTADO_SOLICITUD',
            descripcion: `Cambió estado de "${estadoAnterior}" a "${estado}"`,
            entidad: 'SolicitudTutoria',
            entidadId: solicitud._id,
            req
        });

        res.json({
            ok: true,
            solicitud
        });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: usuarioId,
            accion: 'ERROR_ACTUALIZAR_ESTADO_SOLICITUD',
            descripcion: `Error al actualizar estado: ${error.message}`,
            entidad: 'SolicitudTutoria',
            req
        });
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar estado de la solicitud'
        });
    }
};

module.exports = {
    crearSolicitudTutoria,
    getSolicitudesEstudiante,
    actualizarEstadoSolicitud
};