const mongoose = require('mongoose');
const usuarioSchema = new mongoose.Schema({
	rut: String,
	nombre: String,
	apellido1: String,
	apellido2: String,
	carrera: String,
	correo: String,
	telefono: String,
	tipoUsuario: String,
	contrasena: String,
	moroso: {
		type: Boolean,
		default: false,
	},
	bloqueado: {
		type: Boolean,
		default: false,
	},
	disponibilidad: {
		type: Boolean,
		default: true,
	},
});

module.exports = mongoose.model('usuarios', usuarioSchema);
