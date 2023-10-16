const { Router } = require('express');

const ConnectionDB = require('../../modules/ConnectionDB');

const router = Router();

router.get('/test', async (req, res) => {
	const apiRoute = `[INFO]([GET]/test)`;

	console.log(`${apiRoute} Llamada a API GET.`);

	let connDB;

	try {
		connDB = new ConnectionDB();
		console.log(`${apiRoute} Conexion con la base de datos exitosa.`);
	} catch (err) {
		console.error(`${apiRoute} Ocurrio un error al conectar la base de datos:`, err);
		res.status(500).json({ error: 'Ha ocurrido un error.' });
		return;
	}

	let dbData;

	try {
		dbData = await connDB.GetColTest().find({}).toArray();
		console.log(`${apiRoute} Frecuencia obtenida con exito.`);
	} catch (err) {
		console.error(
			`${apiRoute} Ha ocurrido un error al intentar obtener la frecuencia desde la base de datos:`,
			err,
		);
		res.status(500).json({ error: 'Ha ocurrido un error al intentar obtener la frecuencia.' });

		connDB.CloseConn();
		return;
	}

	if (dbData === undefined) {
		console.error(`${apiRoute} No se encontro la id de la boya.`);
		res.status(404).json({ error: 'No se ha encontrado la id de la boya.' });

		connDB.CloseConn();
		return;
	}

	connDB.CloseConn();

	console.log(`${apiRoute} Respuesta:`, dbData);

	res.json({ success: dbData });
});

module.exports = router;
