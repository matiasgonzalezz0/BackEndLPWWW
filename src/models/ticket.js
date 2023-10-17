const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
	producto: { type: mongoose.Schema.Types.ObjectId, ref: 'inventario' },
	ticketEspecial: { type: mongoose.Schema.Types.ObjectId, ref: 'ticketEspecial' },
	estadoPrestamo: String,
	rut: Number,
	estadoTicket: String,
	fechaPrestamo: Date,
});

module.exports = mongoose.model('ticket', ticketSchema);
