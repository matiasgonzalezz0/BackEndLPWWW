const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const { ApolloServer, gql } = require('apollo-server-express');

const Persona = require('./models/persona');
const cors = require('cors');

mongoose.connect(process.env.MONGODB_CONN_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const typeDefs = gql`
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

const resolvers = {
	Query: {
		async getPersonas(obj, { page, limit }) {
			const personas = await Persona.find();
			return personas;
		},
		async getPersona(obj, { id }) {
			const persona = await Persona.findById(id);
			return persona;
		},
	},
	Mutation: {
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
	},
};

let apolloServer = null;

const corsOptions = {
	origin: 'http://localhost:8090',
	credentials: false,
};

async function startServer() {
	apolloServer = new ApolloServer({ typeDefs, resolvers, corsOptions });
	await apolloServer.start();

	apolloServer.applyMiddleware({ app, cors: false });
}

startServer();

const app = express();
app.use(cors());
app.set('port', 8090);

// sever start
app.listen(app.get('port'), () => {
	console.log(`[INFO] Servidor escuchando en el puerto: ${app.get('port')}`);
});
