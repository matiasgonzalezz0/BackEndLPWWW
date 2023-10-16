const sqlite3 = require('sqlite3').verbose();

function ConnectDB() {
	const db = new sqlite3.Database('./sqlite/boyas.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			throw new Error(err.message);
		}
	});

	return db;
}

module.exports = { ConnectDB };
