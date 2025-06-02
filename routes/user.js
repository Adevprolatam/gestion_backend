const { Router } = require('express');
const { check } = require('express-validator'); // Importa check aquí
const router = Router();
const { validarJWT, validarCoordinador } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

// USUARIO
const {
    crearUsuario,
    getUsuarios,
    getUsuariosByID,
    actualizarUsuario,
    borrarUsuario
} = require("../controllers/user.controller");



// Routes para usuario
router.get("/",[validarJWT,validarCoordinador], getUsuarios);
router.get("/:id",[validarJWT,validarCoordinador], getUsuariosByID);

// Crear usuario
router.post('/', 
    [
        check('nombre', 'El nombre es obligatorio').not().isEmpty(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        validarCampos,
    ], 
    crearUsuario
);

// Actualizar usuario
//router.put("/:id", actualizarUsuario);

// Borrar usuario
router.delete("/:id",[validarJWT,validarCoordinador], borrarUsuario);

module.exports = router;