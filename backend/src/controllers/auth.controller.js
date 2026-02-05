const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.Model');
const refreshModel = require('../models/refreshToken.Model');
const { v4: uuidv4 } = require('uuid');

exports.login = async (req, res) => {
  const { usuario, password } = req.body;

  console.log('Login recibido', usuario);
  console.log('auth.login body:', JSON.stringify(req.body));

  try {
    console.log('auth: buscando usuario:', usuario);
    const user = await userModel.findByUsername(usuario);
    console.log('auth: usuario encontrado:', !!user);

    if (!user) {
      console.log('auth: usuario no encontrado ->', usuario);
      return res.status(401).json({ message: 'Usuario incorrecto' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('auth: validPassword=', validPassword);

    if (!validPassword) {
      console.log('auth: contraseña inválida para usuario', usuario);
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // access token (short-lived)
    console.log('DEBUG auth: user id=', user.id, 'rol=', user.rol);
    console.log('DEBUG auth: JWT_SECRET present?', !!process.env.JWT_SECRET);
    const accessToken = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // refresh token (random UUID stored in DB, associated to user)
    const refreshToken = uuidv4();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshModel.create(user.id, refreshToken, refreshExpires.toISOString());

    res.json({
      token: accessToken,
      refreshToken,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error.stack || error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

  try {
    const row = await refreshModel.find(refreshToken);
    if (!row) return res.status(401).json({ message: 'Refresh token inválido' });

    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAt) {
      await refreshModel.remove(refreshToken);
      return res.status(401).json({ message: 'Refresh token expirado' });
    }

    const user = await userModel.findById(row.user_id);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const accessToken = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.json({ token: accessToken });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token requerido' });

  try {
    await refreshModel.remove(refreshToken);
    res.json({ message: 'Logged out' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};