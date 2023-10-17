const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
	nombre: String,
	categoria: String,
	detalle: String,
	cantidad: Number,
	disponibilidad: Boolean,
	image: String,
});

module.exports = mongoose.model('inventario', inventarioSchema);
