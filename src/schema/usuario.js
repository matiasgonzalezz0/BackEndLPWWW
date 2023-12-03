const Usuario = require('../models/usuario');

const typeDefsUsuario = `
	type Usuario {
		id: ID!
		rut: String!
		nombre: String!
        apellido1: String!
        apellido2: String
        carrera: String!
        correo: String!
        telefono: String!
        tipoUsuario: String!
        contrasena: String!
        moroso: Boolean!
        bloqueado: Boolean!
        disponibilidad: Boolean!
	}
	input UsuarioInput {
		rut: String
		nombre: String
        apellido1: String
        apellido2: String
        carrera: String
        correo: String
        telefono: String
        contrasena: String
        tipoUsuario: String
		moroso: Boolean
        bloqueado: Boolean
        disponibilidad: Boolean
	}
	type Alert {
		message: String
	}
	type TipoUsuario {
		tipoUsuario: String
	}
	type UsuarioPag {
        usuarios: [Usuario]
        totalUsuarios: Int
    }
	type Query {
		getUsuarios(
			page: Int
			limit: Int = 1
			search: String
			tipoFilter: [String]
			disponibilidadFilter: [String]
			morosoFilter: [String]
			bloqueadoFilter: [String]
		): UsuarioPag
		getAllUsers: [Usuario]
		getUsuario(id: ID): Usuario
		loginUsuario(rut: String, contrasena: String): TipoUsuario
	}
	type Mutation {
		addUsuario(input: UsuarioInput): Usuario
		updUsuario(id: ID, input: UsuarioInput): Usuario
		delUsuario(id: ID): Alert
		updPass(rut: String, contrasena: String, nuevaContrasena: String): Usuario
	}
`;

const QueryUsuario = {
	async getUsuarios(
		obj,
		{ page, limit, search, tipoFilter, disponibilidadFilter, morosoFilter, bloqueadoFilter },
	) {
		let findQuery = {
			$or: [
				{ rut: { $regex: search } },
				{ apellido1: { $regex: search } },
				{ apellido2: { $regex: search } },
				{ nombre: { $regex: search } },
				{ correo: { $regex: search } },
			],
		};

		if (tipoFilter.length > 0) {
			findQuery = { ...findQuery, tipoUsuario: { $in: tipoFilter } };
		}

		if (disponibilidadFilter.length !== 0 && disponibilidadFilter.length !== 2) {
			if (disponibilidadFilter.includes('disponible')) {
				findQuery = { ...findQuery, disponibilidad: true };
			}
			if (disponibilidadFilter.includes('no_disponible')) {
				findQuery = { ...findQuery, disponibilidad: false };
			}
		}

		if (morosoFilter.length !== 0 && morosoFilter.length !== 2) {
			if (morosoFilter.includes('moroso')) {
				findQuery = { ...findQuery, moroso: true };
			}
			if (morosoFilter.includes('no_moroso')) {
				findQuery = { ...findQuery, moroso: false };
			}
		}

		if (bloqueadoFilter.length !== 0 && bloqueadoFilter.length !== 2) {
			if (bloqueadoFilter.includes('bloqueado')) {
				findQuery = { ...findQuery, bloqueado: true };
			}
			if (bloqueadoFilter.includes('no_bloqueado')) {
				findQuery = { ...findQuery, bloqueado: false };
			}
		}

		const [usuarios, totalUsuarios] = await Promise.all([
			Usuario.find(findQuery)
				.skip((page - 1) * limit)
				.limit(limit),
			Usuario.countDocuments(findQuery),
		]);

		return {
			usuarios,
			totalUsuarios,
		};
	},
	async getAllUsers(obj) {
		const usuarios = await Usuario.find();
		return usuarios;
	},
	async getUsuario(obj, { id }) {
		const usuario = await Usuario.findById(id);
		return usuario;
	},
	async loginUsuario(obj, { rut, contrasena }) {
		const usuario = await Usuario.findOne({ rut, contrasena }, { tipoUsuario: 1 });

		if (usuario === null) {
			return { tipoUsuario: 'error' };
		}

		return { tipoUsuario: usuario.tipoUsuario };
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
	async updPass(obj, { rut, contrasena, nuevaContrasena }) {
		const usuario = await Usuario.findOneAndUpdate(
			{ rut, contrasena },
			{ contrasena: nuevaContrasena },
		);
		return usuario;
	},
};

module.exports = { typeDefsUsuario, QueryUsuario, MutationUsuario };
