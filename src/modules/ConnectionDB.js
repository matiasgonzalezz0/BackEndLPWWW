const { MongoClient } = require('mongodb');
require('dotenv').config();

class ConnectionDB {
	#client;
	#db;

	constructor() {
		this.#client = new MongoClient(process.env.MONGODB_CONN_STRING);
		this.#db = this.#client.db('LPWWW');
	}

	GetColTest() {
		return this.#db.collection('test');
	}

	CloseConn() {
		this.#client.close();
	}
}

module.exports = ConnectionDB;
