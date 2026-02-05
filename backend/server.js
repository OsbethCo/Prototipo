const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const retirosRoutes = require('./src/routes/retiros.routes');
const productosRoutes = require('./src/routes/productos.routes');
const historialRoutes = require('./src/routes/historial.routes');
const reportesRoutes = require('./src/routes/reportes.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/retiros', retirosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/reportes', reportesRoutes);


app.get('/', (req, res) => {
  res.send('✅ API Farmacia funcionando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});