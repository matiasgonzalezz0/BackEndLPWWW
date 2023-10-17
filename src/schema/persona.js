const Persona = require('../models/persona');

const typeDefsPersona = `
	type Persona {
		id: ID!
		rut: Int!
		nombre: String!
	}
	input PersonaInput {
		rut: Int!
		nombre: String!
	}
	type Alert {
		message: String
	}
	type Query {
		getPersonas(page: Int, limit: Int = 1): [Persona]
		getPersona(id: Int): Persona
	}
	type Mutation {
		addPersona(input: PersonaInput): Persona
		updPersona(id: Int, input: PersonaInput): Persona
		delPersona(id: Int): Alert
	}
`;

const QueryPersona = {
	async getPersonas(obj, { page, limit }) {
		const personas = await Persona.find();
		return personas;
	},
	async getPersona(obj, { id }) {
		const persona = await Persona.findById(id);
		return persona;
	},
};

const MutationPersona = {
	async addPersona(obj, { input }) {
		const persona = new Persona(input);
		persona.save();
		return persona;
	},
	async updPersona(obj, { id, input }) {
		const persona = await Persona.findByIdAndUpdate(id, input);
		return persona;
	},
	async delPersona(obj, { id }) {
		await Persona.deleteOne({ _id: id });
		return {
			message: `La persona ${id} fue eliminada`,
		};
	},
};

module.exports = { typeDefsPersona, QueryPersona, MutationPersona };
