const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/farmacia.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a SQLite', err.message);
  } else {
    console.log('✅ Conectado a SQLite');
  }
});

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON;`);
  db.run(`PRAGMA journal_mode = WAL;`);
  db.run(`PRAGMA busy_timeout = 5000;`);
});

module.exports = db;
