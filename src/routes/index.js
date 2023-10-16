const { Router } = require('express');
const rootRouter = Router();

// const DELETEFrecuenciaTest = require('./DELETE/FrecuenciaTests');
// const GETFrecuenciaTest = require('./GET/FrecuenciaTests');
const GETTest = require('./GET/Test');
// const POSTFrecuenciaTest = require('./POST/FrecuenciaTests');
// const PUTFrecuenciaTest = require('./PUT/FrecuenciaTests');

// rootRouter.use('', DELETEFrecuenciaTest);
// rootRouter.use('', GETFrecuenciaTest);
// rootRouter.use('', POSTFrecuenciaTest);
// rootRouter.use('', PUTFrecuenciaTest);
rootRouter.use('', GETTest);

module.exports = rootRouter;
