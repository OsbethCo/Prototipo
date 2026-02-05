require('dotenv').config();
const app = require('./app');

app.listen(3001, () => {
  console.log('Servidor corriendo en port 3001');
});