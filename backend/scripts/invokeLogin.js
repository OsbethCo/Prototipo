require('dotenv').config({ path: './.env' });
const authController = require('../src/controllers/auth.controller');

const makeRes = () => {
  return {
    status(code) {
      this._status = code;
      return this;
    },
    json(payload) {
      console.log('RES JSON:', this._status || 200, JSON.stringify(payload, null, 2));
    }
  };
};

(async () => {
  try {
    console.log('Invoking authController.login with admin/123');
    const req = { body: { usuario: 'admin', password: '123' } };
    const res = makeRes();
    await authController.login(req, res);
  } catch (err) {
    console.error('Invocation error:', err);
  }
})();
