const jwt = require('jsonwebtoken'); 
const { userModel } = require('../models/index');

// Middleware para validar token JWT
const validarJWT = async (req, res, next) => {
    const token = req.header('x-token') || req.query.token;

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no proporcionado'
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;

        // Buscar al usuario y añadir su rol
        const usuario = await userModel.findById(uid);
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }

        req.rol = usuario.rol; // <<--- Aquí estás agregando el rol correctamente

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token inválido o expirado'
        });
    }
};


// Middleware para validar si el usuario es coordinador
const validarCoordinador = async (req, res, next) => {
    try {
        const usuario = await userModel.findById(req.uid);
        
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        if (usuario.rol !== 'coordinador') {
            return res.status(403).json({
                ok: false,
                msg: 'Acceso restringido: se requiere rol de coordinador'
            });
        }

        req.usuario = usuario; // Adjunta el usuario al request
        next();
    } catch (error) {
        console.error('Error en validarCoordinador:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};
// Middleware para validar si el usuario es tutor
const validarTutor = async (req, res, next) => {
    try {
        const usuario = await userModel.findById(req.uid);
        
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        if (usuario.rol !== 'tutor', usuario.rol !== 'coordinador') {
            return res.status(403).json({
                ok: false,
                msg: 'Acceso restringido: se requiere rol de tutor o coordinador'
            });
        }

        req.usuario = usuario; // Adjunta el usuario al request
        next();
    } catch (error) {
        console.error('Error en validarTutor:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};

// Middleware para validar si es admin o el mismo usuario
const validarAdminOMismoUsuario = async (req, res, next) => {
    try {
        const usuario = await userModel.findById(req.uid);
        const idParametro = req.params.id;

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        if (usuario.rol === 'ADMIN_ROLE' || req.uid === idParametro) {
            req.usuario = usuario;
            next();
        } else {
            return res.status(403).json({
                ok: false,
                msg: 'No tienes permisos para esta acción'
            });
        }
    } catch (error) {
        console.error('Error en validarAdminOMismoUsuario:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor'
        });
    }
};

module.exports = {
    validarJWT,
    validarCoordinador,
    validarTutor,
    validarAdminOMismoUsuario
};
