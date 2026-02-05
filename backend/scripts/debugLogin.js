require('dotenv').config({ path: './.env' });
const userModel = require('../src/models/user.Model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

(async () => {
  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const usuario = 'admin';
    const password = '123';
    const user = await userModel.findByUsername(usuario);
    console.log('user:', user && { id: user.id, usuario: user.usuario, rol: user.rol });
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('password valid?', valid);
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' });
    console.log('token length', token.length);
  } catch (err) {
    console.error('DEBUG ERROR', err);
  }
})();
