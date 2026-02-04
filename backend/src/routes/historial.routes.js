const express = require('express');
const router = express.Router();
const db = require('../config/database');

const authMiddleware = require('../middlewares/auth.middleware');


router.get('/mercancias', authMiddleware, (req, res) => {
  db.all('SELECT * FROM retiros', [], (err, rows) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

router.get('/paciente/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      r.id,
      p.nombre AS producto,
      r.cantidad,
      r.tipo,
      r.fecha_retiro,
      u.nombre AS usuario
    FROM retiros r
    JOIN productos p ON r.producto_id = p.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.paciente_id = ?
    ORDER BY r.fecha_retiro DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el historial del paciente' });
    }
    res.json(rows);
  });
});

module.exports = router;