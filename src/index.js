const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { json } = require('body-parser');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { GraphQLScalarType, Kind } = require('graphql');

const cors = require('cors');

const { typeDefsUsuario, QueryUsuario, MutationUsuario } = require('./schema/usuario');
const { typeDefsInventario, QueryInventario, MutationInventario } = require('./schema/inventario');
const { typeDefsTicket, QueryTicket, MutationTicket } = require('./schema/ticket');

mongoose.connect(process.env.MONGODB_CONN_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let typeDefs = ``;

typeDefs += typeDefsUsuario + '\n' + typeDefsInventario + '\n' + typeDefsTicket;

const dateScalar = new GraphQLScalarType({
	name: 'Date',
	serialize(value) {
		return value.getTime();
	},
	parseValue(value) {
		return new Date(value);
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			return new Date(parseInt(ast.value, 10));
		}
		return null;
	},
});

const Query = { ...QueryUsuario, ...QueryInventario, ...QueryTicket };

const Mutation = {
	...MutationUsuario,
	...MutationInventario,
	...MutationTicket,
};

const resolvers = {
	Date: dateScalar,
	Query,
	Mutation,
};

let apolloServer = null;
let app;

const corsOptions = {
	origin: 'http://localhost:8090',
	credentials: false,
};

async function startServer() {
	apolloServer = new ApolloServer({ typeDefs, resolvers, corsOptions });
	await apolloServer.start();

	app = express();
	app.use('/graphql', cors(), json(), expressMiddleware(apolloServer));
	app.set('port', 8090);

	// sever start
	app.listen(app.get('port'), () => {
		console.log(`[INFO] Servidor escuchando en el puerto: ${app.get('port')}`);
	});
}

startServer();
