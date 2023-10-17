const mongoose = require('mongoose');

const ticketEspecialSchema = new mongoose.Schema({
	fechaTermino: Date,
});

module.exports = mongoose.model('ticketEspecial', ticketEspecialSchema);
