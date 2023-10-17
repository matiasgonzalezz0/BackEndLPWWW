const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { json } = require('body-parser');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const cors = require('cors');

const { typeDefsPersona, QueryPersona, MutationPersona } = require('./schema/persona');

mongoose.connect(process.env.MONGODB_CONN_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let typeDefs = ``;

typeDefs += typeDefsPersona;

let Query = {};

Query = { ...Query, ...QueryPersona };

let Mutation = {};

Mutation = { ...Mutation, ...MutationPersona };

const resolvers = {
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

	// apolloServer.applyMiddleware({ app, cors: false });
	app = express();
	app.use('/graphql', cors(), json(), expressMiddleware(apolloServer));
	app.set('port', 8090);

	// sever start
	app.listen(app.get('port'), () => {
		console.log(`[INFO] Servidor escuchando en el puerto: ${app.get('port')}`);
	});
}

startServer();
