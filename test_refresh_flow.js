const axios = require('axios');

(async () => {
  try {
    console.log('Login as admin');
    const login = await axios.post('http://localhost:3001/api/auth/login', { usuario: 'admin', password: '123' });
    console.log('Login response:', login.data);

    const refresh = login.data.refreshToken;
    console.log('Calling refresh with token:', refresh);
    const r = await axios.post('http://localhost:3001/api/auth/refresh', { refreshToken: refresh });
    console.log('Refresh response:', r.data);

    console.log('Calling logout');
    await axios.post('http://localhost:3001/api/auth/logout', { refreshToken: refresh });
    console.log('Logout done');
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
    process.exit(1);
  }
})();
