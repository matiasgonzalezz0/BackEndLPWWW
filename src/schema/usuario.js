const Usuario = require('../models/usuario');

const typeDefsUsuario = `
	type Usuario {
		id: ID!
		rut: Int!
		nombre: String!
        apellido1: String!
        apellido2: String
        carrera: String!
        correo: String!
        telefono: Int!
        tipoUsuario: String!
        contrasena: String!
        moroso: Boolean!
        bloqueado: Boolean!
        disponibilidad: Boolean!
	}
	input UsuarioInput {
		rut: Int
		nombre: String
        apellido1: String
        apellido2: String
        carrera: String
        correo: String
        telefono: Int
        contrasena: String
        tipoUsuario: String
	}
	type Alert {
		message: String
	}
	type Query {
		getUsuarios(page: Int, limit: Int = 1): [Usuario]
		getUsuario(id: ID): Usuario
	}
	type Mutation {
		addUsuario(input: UsuarioInput): Usuario
		updUsuario(id: ID, input: UsuarioInput): Usuario
		delUsuario(id: ID): Alert
	}
`;

const QueryUsuario = {
	async getUsuarios(obj, { page, limit }) {
		const usuarios = await Usuario.find()
			.skip((page - 1) * limit)
			.limit(limit);
		return usuarios;
	},
	async getUsuario(obj, { id }) {
		const usuario = await Usuario.findById(id);
		return usuario;
	},
};

const MutationUsuario = {
	async addUsuario(obj, { input }) {
		const usuario = new Usuario(input);
		usuario.save();
		return usuario;
	},
	async updUsuario(obj, { id, input }) {
		const usuario = await Usuario.findByIdAndUpdate(id, input);
		return usuario;
	},
	async delUsuario(obj, { id }) {
		const usuario = await Usuario.findByIdAndUpdate(id, { disponibilidad: false });
		return usuario;
	},
};

module.exports = { typeDefsUsuario, QueryUsuario, MutationUsuario };
