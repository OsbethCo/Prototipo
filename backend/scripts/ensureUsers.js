const bcrypt = require('bcryptjs');
const userModel = require('../src/models/user.Model');

async function ensureUser({ nombre, usuario, password, rol }) {
  try {
    const existing = await userModel.findByUsername(usuario);
    if (existing) {
      console.log(`Usuario existente: ${usuario} (id=${existing.id})`);
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const id = await userModel.createUser({ nombre, usuario, password_hash, rol });
    console.log(`Usuario creado: ${usuario} (id=${id})`);
  } catch (err) {
    console.error('Error asegurando usuario', usuario, err);
  }
}

(async () => {
  // Ajusta las contraseñas para desarrollo según necesites
  await ensureUser({ nombre: 'Administrador', usuario: 'admin', password: '123', rol: 'supervisor' });
  await ensureUser({ nombre: 'Javier Trabajador', usuario: 'javi', password: 'javi123', rol: 'trabajador' });
  process.exit(0);
})();
