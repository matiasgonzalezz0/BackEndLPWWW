const { Router } = require('express');

const ConnectDB = require('../../modules/ConnectDB');
const GetFrecuenciaDB = require('../../modules/GetFrecuenciaDB');

const boyaExistsDB = require('../../modules/boyaExistsDB');

const router = Router();

router.get('/boya/:boyaID/frecuencia', async (req, res) => {
    const { boyaID } = req.params

    console.log(
        `[INFO]([GET]/boya/${boyaID}/frecuencia) Llamada a API GET.`
    );

    try {
        var db = ConnectDB();
        console.log(`[INFO]([GET]/boya/${boyaID}/frecuencia) Conexion con la base de datos exitosa.`)
    } catch {
        console.error(`[ERROR]([GET]/boya/${boyaID}/frecuencia) Ocurrio un error al conectar la base de datos:`, err);
        res.status(500).json({error: "Ha ocurrido un error."});
        return; 
    }

    // comprobar si el id de la boya existe
    let exists = true;

    await Promise.all([boyaExistsDB(db, boyaID)])
        .then(() => {})
        .catch(() => {
            console.error(
                `[ERROR]([GET]/boya/${boyaID}/frecuencia) No se encontro la id de la boya.`
            );
            res.status(404).json({error: "No se ha encontrado la id de la boya."});
    
            db.close();
            exists = false;
        });

    if (!exists) {
        return;
    }

    let dbData;

    try {
        dbData = await GetFrecuenciaDB(db, boyaID);
        console.log(`[INFO]([GET]/boya/${boyaID}/frecuencia) Frecuencia obtenida con exito.`);
    } catch(err) {
        console.error(
            `[ERROR]([GET]/boya/${boyaID}/frecuencia) Ha ocurrido un error al intentar obtener la frecuencia desde la base de datos:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error al intentar obtener la frecuencia."});

        db.close();
        return;
    }

    if (dbData === undefined) {
        console.error(
            `[ERROR]([GET]/boya/${boyaID}/frecuencia) No se encontro la id de la boya.`
        );
        res.status(404).json({error: "No se ha encontrado la id de la boya."});

        db.close();
        return;
    }

    db.close();

    console.log(
        `[INFO]([GET]/boya/${boyaID}/frecuencia) Respuesta:`, dbData
    );

    res.json({ 'success': dbData });
});

module.exports = router;