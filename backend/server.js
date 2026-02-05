const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
let retirosRoutes;
try {
  retirosRoutes = require('./src/routes/retiros.routes');
  console.log('retirosRoutes loaded successfully');
} catch (error) {
  console.error('Error loading retirosRoutes:', error.message);
}
const productosRoutes = require('./src/routes/productos.routes');
const historialRoutes = require('./src/routes/historial.routes');
const reportesRoutes = require('./src/routes/reportes.routes');

console.log('Routes loaded successfully');

console.log('Routes loaded successfully');

const app = express();

// Log ALL requests
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/retiros', retirosRoutes);
console.log('Mounted /api/retiros');
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