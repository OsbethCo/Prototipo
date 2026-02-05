const db = require('../config/database');

const create = (user_id, token, expires_at) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`;
    db.run(sql, [user_id, token, expires_at], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const find = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM refresh_tokens WHERE token = ?`;
    db.get(sql, [token], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const remove = (token) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM refresh_tokens WHERE token = ?`;
    db.run(sql, [token], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const removeByUserId = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM refresh_tokens WHERE user_id = ?`;
    db.run(sql, [user_id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = { create, find, remove, removeByUserId };
