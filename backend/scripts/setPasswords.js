const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function setPassword(usuario, plain) {
  try {
    const hash = await bcrypt.hash(plain, 10);
    await new Promise((resolve, reject) => {
      db.run('UPDATE usuarios SET password_hash = ? WHERE usuario = ?', [hash, usuario], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
    console.log(`Password actualizado para ${usuario}`);
  } catch (err) {
    console.error('Error actualizando password', usuario, err);
  }
}

(async () => {
  await setPassword('admin', '123');
  await setPassword('javi', 'javi123');
  process.exit(0);
})();
