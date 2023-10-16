const mongoose = require('mongoose');
const personaSchema = new mongoose.Schema({
	rut: Number,
	nombre: String,
});

module.exports = mongoose.model('personas', personaSchema);
