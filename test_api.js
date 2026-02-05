const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', { usuario: 'admin', password: '123' }, { headers: { 'Content-Type': 'application/json' } });
    const token = loginRes.data.token;
    console.log('TOKEN:', token);

    const prodRes = await axios.get('http://localhost:3001/api/productos', { headers: { Authorization: `Bearer ${token}` } });
    console.log('PRODUCTOS RESPONSE:');
    console.log(JSON.stringify(prodRes.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('ERROR RESPONSE:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
    process.exit(1);
  }
})();
