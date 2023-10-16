const { Router } = require('express');
const bodyParser = require('body-parser');

const ConnectDB = require('../../modules/ConnectDB');
const UpdateFrecuenciaDB = require('../../modules/UpdateFrecuenciaDB');

const boyaExistsDB = require('../../modules/boyaExistsDB');
const frecuenciaExistsDB = require('../../modules/frecuenciaExistsDB');

const FrecuenciaMQTT = require('../../modules/FrecuenciaMQTT');

const router = Router();

router.put('/boya/:boyaID/frecuencia/:fechaFrecuenciaTestID', bodyParser.json(), async (req, res) => {
    const { boyaID, fechaFrecuenciaTestID } = req.params;
    const { dia, hora } = req.body;

    console.log(
        `[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Llamada a API PUT.`
    );

    try {
        var db = ConnectDB();
        console.log(`[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Conexion con la base de datos exitosa.`)
    } catch {
        console.error(`[ERROR]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ocurrio un error al conectar la base de datos:`, err);
        res.status(500).json({error: "Ha ocurrido un error."});
        return; 
    }

    // comprobar si el id de la boya y la frecuencia existen
    let exists = true;

    await Promise.all([boyaExistsDB(db, boyaID), frecuenciaExistsDB(db, fechaFrecuenciaTestID)])
        .then(() => {})
        .catch(() => {
            console.error(
                `[ERROR]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) No se ha encontrado la id.`
            );
            res.status(404).json({error: "No se ha encontrado la id."});
    
            db.close();
            exists = false;
        });

    if (!exists) {
        return;
    }

    console.log(`[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Esperando respuesta de la boya.`);

    try {
        await FrecuenciaMQTT(JSON.stringify({op: 'update', id: fechaFrecuenciaTestID, dia, hora}));
        console.log(`[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) La boya actualizo su frecuencia.`);
    } catch(err) {
        console.error(
            `[ERROR]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ha ocurrido un error en la comunicación con la boya:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error en la comunicación con la boya."});
        return;
    }

    try {
        await UpdateFrecuenciaDB(db, dia, hora, fechaFrecuenciaTestID);
        console.log(`[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Frecuencia actualizada con exito en la base de datos.`);
    } catch(err) {
        console.error(
            `[ERROR]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ha ocurrido un error al intentar actualizar la frecuencia en la base de datos:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error al intentar actualizar la frecuencia."});

        db.close();
        return;
    }

    db.close();
        
    console.log(`[INFO]([PUT]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Frecuencia actualizada con exito.`);
    res.json({'success': 'Frecuencia de tests actualizada.'});
});

module.exports = router;