const { Router } = require('express');
const bodyParser = require('body-parser');

const ConnectDB = require('../../modules/ConnectDB');
const DeleteFrecuenciaDB = require('../../modules/DeleteFrecuenciaDB');

const boyaExistsDB = require('../../modules/boyaExistsDB');
const frecuenciaExistsDB = require('../../modules/frecuenciaExistsDB');

const FrecuenciaMQTT = require('../../modules/FrecuenciaMQTT');

const router = Router();

router.delete('/boya/:boyaID/frecuencia/:fechaFrecuenciaTestID', bodyParser.json(), async (req, res) => {
    const { boyaID, fechaFrecuenciaTestID } = req.params;

    console.log(
        `[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Llamada a API DELETE.`
    );

    try {
        var db = ConnectDB();
        console.log(`[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Conexion con la base de datos exitosa.`)
    } catch {
        console.error(`[ERROR]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ocurrio un error al conectar la base de datos:`, err);
        res.status(500).json({error: "Ha ocurrido un error."});
        return; 
    }

    // comprobar si el id de la boya y la frecuencia existen
    let exists = true;

    await Promise.all([boyaExistsDB(db, boyaID), frecuenciaExistsDB(db, fechaFrecuenciaTestID)])
        .then(() => {})
        .catch(() => {
            console.error(
                `[ERROR]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) No se ha encontrado la id.`
            );
            res.status(404).json({error: "No se ha encontrado la id."});
    
            db.close();
            exists = false;
        });
    
    if (!exists) {
        return;
    }

    console.log(`[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Esperando respuesta de la boya.`);

    try {
        await FrecuenciaMQTT(JSON.stringify({op: 'delete', id: fechaFrecuenciaTestID}));
        console.log(`[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) La boya eliminó la frecuencia.`);
    } catch(err) {
        console.error(
            `[ERROR]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ha ocurrido un error en la comunicación con la boya:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error en la comunicación con la boya."});
        return;
    }

    try {
        await DeleteFrecuenciaDB(db, fechaFrecuenciaTestID);
        console.log(`[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Frecuencia eliminada con exito en la base de datos.`);
    } catch(err) {
        console.error(
            `[ERROR]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Ha ocurrido un error al intentar eliminar la frecuencia en la base de datos:`,
            err
        );
        res.status(500).json({error: "Ha ocurrido un error al intentar eliminar la frecuencia."});

        db.close();
        return;
    }

    db.close();
        
    console.log(`[INFO]([DELETE]/boya/${boyaID}/frecuencia/${fechaFrecuenciaTestID}) Frecuencia eliminada con exito.`);
    res.json({'success': 'Frecuencia de tests eliminada.'});
});

module.exports = router;