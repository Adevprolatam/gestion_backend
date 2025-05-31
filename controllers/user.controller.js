const { response } = require('express');
const bcrypt = require('bcryptjs');
const { userModel } = require('../models/index');
const { generarJWT } = require('../helpers/jwt');
const { registrarAuditoria } = require("../helpers/auditoria");

const getUsuarios = async (req, res) => {
    const desde = Number(req.query.desde) || 0;

    try {
        const [usuarios, total] = await Promise.all([
            userModel.find({}, 'nombre apellido email rol').skip(desde).limit(5),
            userModel.countDocuments()
        ]);

        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'CONSULTA_USUARIOS',
            descripcion: `Consultó listado de usuarios desde ${desde}`,
            entidad: 'Usuario',
            req
        });

        res.json({ ok: true, usuarios, total });
    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: req.uid || null,
            accion: 'ERROR_CONSULTA_USUARIOS',
            descripcion: `Error al obtener usuarios: ${error.message}`,
            entidad: 'Usuario',
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al obtener usuarios' });
    }
};

const getUsuariosByID = async (req, res = response) => {
    const id = req.params.id;

    try {
        const usuario = await userModel.findById(id);
        if (!usuario) {
            await registrarAuditoria({
                usuarioId: req.uid,
                accion: 'USUARIO_NO_ENCONTRADO',
                descripcion: `Intento de acceder a usuario inexistente: ${id}`,
                entidad: 'Usuario',
                entidadId: id,
                req
            });
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'CONSULTA_USUARIO',
            descripcion: `Consultó datos del usuario ${usuario.email}`,
            entidad: 'Usuario',
            entidadId: id,
            req
        });

        res.json({ ok: true, usuario });
    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: req.uid || null,
            accion: 'ERROR_OBTENER_USUARIO',
            descripcion: `Error al obtener usuario por ID: ${error.message}`,
            entidad: 'Usuario',
            entidadId: id,
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al obtener usuario' });
    }
};

const crearUsuario = async (req, res = response) => {
    const { email, password, nombre } = req.body;

    try {
        const existeEmail = await userModel.findOne({ email });
        if (existeEmail) {
            await registrarAuditoria({
                accion: 'EMAIL_DUPLICADO',
                descripcion: `Intento de registro con email existente: ${email}`,
                entidad: 'Usuario',
                req,
                contextoCreacion: true
            });
            return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
        }

        const usuario = new userModel(req.body);
        
        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

        // Auditoría post-creación con el nuevo ID
        await registrarAuditoria({
            usuarioId: usuario._id,
            accion: 'USUARIO_CREADO',
            descripcion: `Usuario ${nombre} creado exitosamente`,
            entidad: 'Usuario',
            entidadId: usuario._id,
            req
        });

        // Generar JWT
        const token = await generarJWT(usuario._id);

        res.status(201).json({ 
            ok: true, 
            usuario: {
                uid: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }, 
            token 
        });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            accion: 'ERROR_CREACION_USUARIO',
            descripcion: `Error al crear usuario: ${error.message}`,
            entidad: 'Usuario',
            req,
            contextoCreacion: true
        });
        res.status(500).json({ 
            ok: false, 
            msg: 'Error al crear usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const actualizarUsuario = async (req, res = response) => {
    const uid = req.params.id;
    const { password, google, email, ...campos } = req.body;

    try {
        const usuarioDB = await userModel.findById(uid);
        if (!usuarioDB) {
            await registrarAuditoria({
                usuarioId: req.uid,
                accion: 'ACTUALIZACION_USUARIO_INEXISTENTE',
                descripcion: `Intento de actualizar usuario no encontrado: ${uid}`,
                entidad: 'Usuario',
                req
            });
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        // Validación email
        if (usuarioDB.email !== email) {
            const existeEmail = await userModel.findOne({ email });
            if (existeEmail) {
                await registrarAuditoria({
                    usuarioId: req.uid,
                    accion: 'ACTUALIZACION_EMAIL_DUPLICADO',
                    descripcion: `Intento de cambiar a email existente: ${email}`,
                    entidad: 'Usuario',
                    entidadId: uid,
                    req
                });
                return res.status(400).json({ ok: false, msg: 'Email ya registrado' });
            }
            campos.email = email;
        }

        // Actualización
        const usuarioActualizado = await userModel.findByIdAndUpdate(uid, campos, { 
            new: true,
            runValidators: true
        });

        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'USUARIO_ACTUALIZADO',
            descripcion: `Actualización exitosa del usuario ${usuarioActualizado.email}`,
            entidad: 'Usuario',
            entidadId: uid,
            req
        });

        res.json({ ok: true, usuario: usuarioActualizado });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'ERROR_ACTUALIZACION_USUARIO',
            descripcion: `Error al actualizar usuario ${uid}: ${error.message}`,
            entidad: 'Usuario',
            entidadId: uid,
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al actualizar usuario' });
    }
};

const borrarUsuario = async (req, res = response) => {
    const uid = req.params.id;

    try {
        const usuario = await userModel.findByIdAndDelete(uid);
        if (!usuario) {
            await registrarAuditoria({
                usuarioId: req.uid,
                accion: 'ELIMINACION_USUARIO_INEXISTENTE',
                descripcion: `Intento de eliminar usuario no encontrado: ${uid}`,
                entidad: 'Usuario',
                req
            });
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'USUARIO_ELIMINADO',
            descripcion: `Usuario ${usuario.email} eliminado`,
            entidad: 'Usuario',
            entidadId: uid,
            req
        });

        res.json({ ok: true, msg: 'Usuario eliminado correctamente' });

    } catch (error) {
        console.error(error);
        await registrarAuditoria({
            usuarioId: req.uid,
            accion: 'ERROR_ELIMINACION_USUARIO',
            descripcion: `Error al eliminar usuario ${uid}: ${error.message}`,
            entidad: 'Usuario',
            entidadId: uid,
            req
        });
        res.status(500).json({ ok: false, msg: 'Error al eliminar usuario' });
    }
};

module.exports = {
    getUsuarios,
    getUsuariosByID,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
};