const express = require('express')
const app = express()

app.set('port', 3000)

// routes
app.use('/api', require('./routes/index'))

// sever start
app.listen(app.get('port'), () => {
    console.log(`[INFO] Servidor escuchando en el puerto: ${app.get('port')}`)
})