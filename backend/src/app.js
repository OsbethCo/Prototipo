const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ API Farmacia funcionando');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/retiros', require('./routes/retiros.routes'));
app.use('/api/historial', require('./routes/historial.routes'));
app.use('/api/usuarios', require('./routes/user.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));

module.exports = app;