const express = require('express');
const router = express.Router();
const db = require('../config/database');

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Endpoint para obtener productos disponibles para retiro
router.get('/productos', auth, role(['trabajador', 'supervisor']), (req, res) => {
    const sql = 'SELECT id, nombre, medida, lote, stock_actual as cantidad, fecha_vencimiento, categoria, tipo_presentacion, unidad_medida FROM productos WHERE stock_actual > 0 ORDER BY nombre ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error consultando productos' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener todos los pacientes
router.get('/pacientes', auth, role(['trabajador', 'supervisor']), (req, res) => {
    const sql = 'SELECT id, nombre, cedula, area, cama FROM pacientes ORDER BY nombre ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error consultando pacientes' });
        }
        res.json(rows);
    });
});

router.post(
  '/',
  auth,
  role(['trabajador', 'supervisor']),
  (req, res) => {
    const {
      nombre,
      tipoPresentacion,
      lote,
      cantidad,
      fechaRetiro,
      paciente,
      destino,
      persona
    } = req.body;

    const usuario_id = req.user.id;

    // Validaciones básicas
    if (!nombre || !lote || !cantidad || !persona?.nombre || !persona?.cargo) {
      return res.status(400).json({ message: 'Datos incompletos: nombre, lote, cantidad, persona son requeridos' });
    }

    if (cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    // Determinar tipo de retiro (clínico si hay paciente, comercial si no)
    const tipo = paciente ? 'clinico' : 'comercial';

    // Primero, buscar el producto por nombre, lote y presentación
    const buscarProductoSQL = `
      SELECT id, stock_actual FROM productos 
      WHERE nombre = ? AND lote = ? AND (medida = ? OR tipo_presentacion = ? OR unidad_medida = ?)
      LIMIT 1
    `;

    db.get(
      buscarProductoSQL,
      [nombre, lote, tipoPresentacion || '', tipoPresentacion || '', tipoPresentacion || ''],
      (err, producto) => {
        if (err) {
          return res.status(500).json({ message: 'Error buscando producto' });
        }

        if (!producto) {
          return res.status(404).json({ message: 'Producto no encontrado con esos datos' });
        }

        if (producto.stock_actual < cantidad) {
          return res.status(400).json({ message: 'Stock insuficiente. Disponible: ' + producto.stock_actual });
        }

        // Buscar o crear paciente si es retiro clínico
        const pacienteId = paciente ? 
          new Promise((resolve, reject) => {
            // Buscar paciente existente
            db.get('SELECT id FROM pacientes WHERE nombre = ?', [paciente], (err, row) => {
              if (err) reject(err);
              else if (row) resolve(row.id);
              else {
                // Crear nuevo paciente
                db.run('INSERT INTO pacientes (nombre) VALUES (?)', [paciente], function(err) {
                  if (err) reject(err);
                  else resolve(this.lastID);
                });
              }
            });
          }) 
          : Promise.resolve(null);

        // Continuar con la transacción
        pacienteId
          .then((idPaciente) => {
            db.serialize(() => {
              db.run('BEGIN TRANSACTION');

              // Actualizar stock
              db.run(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
                [cantidad, producto.id],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Error actualizando stock' });
                  }

                  // Insertar retiro
                  const observacion = JSON.stringify({
                    destino,
                    persona,
                    fechaRetiroOriginal: fechaRetiro
                  });

                  db.run(
                    `INSERT INTO retiros 
                    (producto_id, paciente_id, usuario_id, cantidad, tipo, observacion)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                      producto.id,
                      tipo === 'clinico' ? idPaciente : null,
                      usuario_id,
                      cantidad,
                      tipo,
                      observacion
                    ],
                    (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: 'Error registrando retiro' });
                      }

                      // Si es clínico, actualizar inventario del paciente
                      if (tipo === 'clinico' && idPaciente) {
                        db.run(
                          `INSERT INTO inventario_paciente (paciente_id, producto_id, cantidad)
                          VALUES (?, ?, ?)
                          ON CONFLICT(paciente_id, producto_id)
                          DO UPDATE SET cantidad = cantidad + ?`,
                          [idPaciente, producto.id, cantidad, cantidad],
                          (err) => {
                            if (err) {
                              db.run('ROLLBACK');
                              return res.status(500).json({ message: 'Error actualizando inventario del paciente' });
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
            });
          })
          .catch((err) => {
            res.status(500).json({ message: 'Error procesando paciente: ' + err.message });
          });
      }
    );
  }
);

// Debug: Log all requests to this router
router.use((req, res, next) => {
  console.log('retiros router received:', req.method, req.path);
  next();
});

// Endpoint temporal para verificar que la ruta está montada
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Ruta de retiros accesible' });
});

// Endpoint para obtener historial de retiros
router.get('/', auth, role(['trabajador', 'supervisor']), (req, res) => {
  const sql = `
    SELECT 
      r.id,
      r.cantidad,
      r.tipo,
      r.observacion,
      r.fecha_retiro,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      u.nombre as usuario_nombre,
      pa.nombre as paciente_nombre
    FROM retiros r
    LEFT JOIN productos p ON r.producto_id = p.id
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    LEFT JOIN pacientes pa ON r.paciente_id = pa.id
    ORDER BY r.fecha_retiro DESC
    LIMIT 100
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error consultando retiros' });
    }
    res.json(rows);
  });
});

// Endpoint para obtener registros de pacientes (retiros clínicos)
router.get('/registros-pacientes', auth, role(['trabajador', 'supervisor']), (req, res) => {
  const sql = `
    SELECT 
      r.id,
      r.cantidad,
      r.observacion,
      r.fecha_retiro,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      p.unidad_medida,
      pa.nombre as paciente_nombre,
      pa.cedula,
      pa.area,
      pa.cama,
      u.nombre as usuario_nombre
    FROM retiros r
    LEFT JOIN productos p ON r.producto_id = p.id
    LEFT JOIN pacientes pa ON r.paciente_id = pa.id
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    WHERE r.tipo = 'clinico'
    ORDER BY r.fecha_retiro DESC
    LIMIT 500
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error consultando registros de pacientes' });
    }
    res.json(rows);
  });
});

// Endpoint para obtener TODOS los registros (clínicos y comerciales)
router.get('/registros-todos', auth, role(['trabajador', 'supervisor']), (req, res) => {
  const sql = `
    SELECT 
      r.id,
      r.cantidad,
      r.tipo,
      r.observacion,
      r.fecha_retiro,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      p.unidad_medida,
      pa.nombre as paciente_nombre,
      pa.cedula,
      pa.area,
      pa.cama,
      u.nombre as usuario_nombre
    FROM retiros r
    LEFT JOIN productos p ON r.producto_id = p.id
    LEFT JOIN pacientes pa ON r.paciente_id = pa.id
    LEFT JOIN usuarios u ON r.usuario_id = u.id
    ORDER BY r.fecha_retiro DESC
    LIMIT 500
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error consultando registros' });
    }
    res.json(rows);
  });
});

// ========== RUTAS DE INVENTARIO PACIENTE ==========

// Obtener todo el inventario de pacientes
router.get('/inventario-paciente', auth, role(['trabajador', 'supervisor']), (req, res) => {
  const sql = `
    SELECT 
      ip.id,
      ip.paciente_id,
      ip.producto_id,
      ip.cantidad,
      ip.ultima_actualizacion,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      p.tipo_presentacion,
      pa.nombre as paciente_nombre,
      pa.cedula,
      pa.area,
      pa.cama
    FROM inventario_paciente ip
    LEFT JOIN productos p ON ip.producto_id = p.id
    LEFT JOIN pacientes pa ON ip.paciente_id = pa.id
    ORDER BY pa.nombre ASC, p.nombre ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error consultando inventario de pacientes' });
    }
    res.json(rows);
  });
});

// Obtener inventario de un paciente específico
router.get('/inventario-paciente/:pacienteId', auth, role(['trabajador', 'supervisor']), (req, res) => {
  const { pacienteId } = req.params;
  
  const sql = `
    SELECT 
      ip.id,
      ip.paciente_id,
      ip.producto_id,
      ip.cantidad,
      ip.ultima_actualizacion,
      p.nombre as producto_nombre,
      p.lote,
      p.medida,
      p.tipo_presentacion,
      p.fecha_vencimiento,
      pa.nombre as paciente_nombre,
      pa.cedula,
      pa.area,
      pa.cama
    FROM inventario_paciente ip
    LEFT JOIN productos p ON ip.producto_id = p.id
    LEFT JOIN pacientes pa ON ip.paciente_id = pa.id
    WHERE ip.paciente_id = ?
    ORDER BY p.nombre ASC
  `;
  
  db.all(sql, [pacienteId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error consultando inventario del paciente' });
    }
    res.json(rows);
  });
});

// Actualizar cantidad en inventario de paciente
router.put('/inventario-paciente/:id', auth, role(['supervisor']), (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  
  if (cantidad === undefined || cantidad < 0) {
    return res.status(400).json({ message: 'Cantidad inválida' });
  }
  
  const sql = `
    UPDATE inventario_paciente 
    SET cantidad = ?, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(sql, [cantidad, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error actualizando inventario' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Inventario actualizado correctamente' });
  });
});

// Eliminar registro de inventario de paciente
router.delete('/inventario-paciente/:id', auth, role(['supervisor']), (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM inventario_paciente WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error eliminando registro' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado correctamente' });
  });
});

module.exports = router;
