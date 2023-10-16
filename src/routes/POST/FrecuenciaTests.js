const { Router } = require('express');
const bodyParser = require('body-parser');

const ConnectDB = require('../../modules/ConnectDB');
const InsertFrecuenciaDB = require('../../modules/InsertFrecuenciaDB');
const DeleteFrecuenciaDB = require('../../modules/DeleteFrecuenciaDB');

const boyaExistsDB = require('../../modules/boyaExistsDB');

const FrecuenciaMQTT = require('../../modules/FrecuenciaMQTT');

const router = Router();

router.post('/boya/:boyaID/frecuencia', bodyParser.json(), async (req, res) => {
    const { boyaID } = req.params;
    const { dia, hora } = req.body;

    console.log(
        `[INFO]([POST]/boya/${boyaID}/frecuencia) Llamada a API POST.`
    );

    try {
        var db = ConnectDB();
        console.log(`[INFO]([POST]/boya/${boyaID}/frecuencia) Conexion con la base de datos exitosa.`)
    } catch {
        console.error(`[ERROR]([POST]/boya/${boyaID}/frecuencia) Ocurrio un error al conectar la base de datos:`, err);
        res.status(500).json({error: "Ha ocurrido un error."});
        return; 
    }

    // comprobar si el id de la boya y la frecuencia existen
    let exists = true;

    await Promise.all([boyaExistsDB(db, boyaID)])
        .then(() => {})
        .catch(() => {
            console.error(
                `[ERROR]([POST]/boya/${boyaID}/frecuencia) No se ha encontrado la id.`
            );
            res.status(404).json({error: "No se ha encontrado la id."});
    
            db.close();
            exists = false;
        });
    
    if (!exists) {
        return;
    }

    let fechaFrecuenciaTestID;

    try {
        fechaFrecuenciaTestID = await InsertFrecuenciaDB(db, boyaID, dia, hora);
    } catch(err) {
        console.error(
            `[ERROR]([POST]/boya/${boyaID}/frecuencia) Ha ocurrido un error al intentar insertar la fecha en la base de datos:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error al intentar agregar la fecha."});

        db.close();
        return;
    }

    console.log(`[INFO]([POST]/boya/${boyaID}/frecuencia) Esperando respuesta de la boya.`);
    
    try {
        await FrecuenciaMQTT(JSON.stringify({op: 'create', id: fechaFrecuenciaTestID.toString(), dia, hora}));
        console.log(`[INFO]([POST]/boya/${boyaID}/frecuencia) La boya actualizo su frecuencia.`);
    } catch(err) {
        await DeleteFrecuenciaDB(db, fechaFrecuenciaTestID);

        console.error(
            `[ERROR]([POST]/boya/${boyaID}/frecuencia) Ha ocurrido un error en la comunicación con la boya:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error en la comunicación con la boya."});

        db.close();
        return;
    }

    db.close();

    console.log(`[INFO]([POST]/boya/${boyaID}/frecuencia) Frecuencia ingresada con exito.`);
    res.json({'success': 'Frecuencia de tests ingresada.'});
});

module.exports = router;