const express = require('express');
const router = express.Router();
const db = require('../config/database');

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

router.post(
  '/',
  auth,
  role(['trabajador', 'supervisor']),
  (req, res) => {
    const {
      producto_id,
      paciente_id,
      cantidad,
      tipo,
      observacion
    } = req.body;

    const usuario_id = req.user.id;

    if (!producto_id || !cantidad || !tipo) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    if (!['clinico', 'comercial'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    if (cantidad <= 0) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }

    if (tipo === 'clinico' && !paciente_id) {
      return res.status(400).json({ message: 'Paciente requerido' });
    }

    if (tipo === 'comercial' && paciente_id) {
      return res.status(400).json({ message: 'Retiro comercial no lleva paciente' });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.get(
        'SELECT stock_actual FROM productos WHERE id = ?',
        [producto_id],
        (err, producto) => {
          if (err || !producto) {
            db.run('ROLLBACK');
            return res.status(404).json({ message: 'Producto no encontrado' });
          }

          if (producto.stock_actual < cantidad) {
            db.run('ROLLBACK');
            return res.status(400).json({ message: 'Stock insuficiente' });
          }

          db.run(
            'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
            [cantidad, producto_id],
            err => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Error actualizando stock' });
              }

              db.run(
                `INSERT INTO retiros 
                (producto_id, paciente_id, usuario_id, cantidad, tipo, observacion)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  producto_id,
                  tipo === 'clinico' ? paciente_id : null,
                  usuario_id,
                  cantidad,
                  tipo,
                  observacion || null
                ],
                err => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Error registrando retiro' });
                  }

                  if (tipo === 'clinico') {
                    db.run(
                      `
                      INSERT INTO inventario_paciente (paciente_id, producto_id, cantidad)
                      VALUES (?, ?, ?)
                      ON CONFLICT(paciente_id, producto_id)
                      DO UPDATE SET cantidad = cantidad + ?
                      `,
                      [paciente_id, producto_id, cantidad, cantidad],
                      err => {
                        if (err) {
                          db.run('ROLLBACK');
                          return res.status(500).json({
                            message: 'Error inventario paciente'
                          });
                        }

                        db.run('COMMIT');
                        res.json({ message: 'Retiro clínico realizado correctamente' });
                      }
                    );
                  } else {
                    db.run('COMMIT');
                    res.json({ message: 'Retiro comercial realizado correctamente' });
                  }
                }
              );
            }
          );
        }
      );
    });
  }
);

module.exports = router;