const express = require('express');
const router = express.Router();
const db = require('../config/database');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const auth = authMiddleware;
const role = roleMiddleware;


router.post(
  '/',
  auth,
  role(['supervisor']),
  (req, res) => {
    const {
      nombre,
      medida,
      lote,
      fechaVencimiento,
      cantidad,
      stock,
      categoria,
      tipoPresentacion,
      unidadMedida,
      ubicacion,
      proveedor,
      condicionesAlmacenamiento,
      codigo,
      tipo
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const sql = `
      INSERT INTO productos 
      (nombre, medida, lote, fecha_vencimiento, stock_actual, stock_minimo, categoria, tipo_presentacion, unidad_medida, ubicacion, proveedor, condiciones_almacenamiento, codigo, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        nombre,
        medida || null,
        lote || null,
        fechaVencimiento || null,
        cantidad || 0,
        stock || 0,
        categoria || 'Medicamento',
        tipoPresentacion || null,
        unidadMedida || null,
        ubicacion || null,
        proveedor || null,
        condicionesAlmacenamiento || null,
        codigo || null,
        tipo || null
      ],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error al crear producto' });
        }

        res.json({
          message: 'Producto creado correctamente',
          id: this.lastID
        });
      }
    );
  }
);


router.get(
  '/',
  auth,
  (req, res) => {
    const sql = `SELECT * FROM productos`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Error al obtener productos' });
      }
      // Map database columns to frontend format
      const productos = rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        medida: row.medida,
        lote: row.lote,
        cantidad: row.stock_actual,
        fechaVencimiento: row.fecha_vencimiento,
        categoria: row.categoria,
        stock: row.stock_minimo,
        tipoPresentacion: row.tipo_presentacion,
        unidadMedida: row.unidad_medida,
        ubicacion: row.ubicacion,
        proveedor: row.proveedor,
        condicionesAlmacenamiento: row.condiciones_almacenamiento,
        codigo: row.codigo,
      }));
      res.json(productos);
    });
  }
);


router.put(
  '/stock/:id',
  auth,
  role(['supervisor']),
  (req, res) => {
    const { cantidad } = req.body;
    const { id } = req.params;

    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ message: 'Cantidad inválida. Debe ser mayor a 0' });
    }

    const sql = `
      UPDATE productos
      SET stock_actual = stock_actual + ?
      WHERE id = ?
    `;

    db.run(sql, [cantidad, id], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al actualizar stock' });
      }

      if (this.changes === 0) {
        return res
          .status(404)
          .json({ message: 'Producto no encontrado' });
      }

      res.json({
        message: 'Stock actualizado correctamente'
      });
    });
  }
);


router.delete(
  '/:id',
  auth,
  role(['supervisor']),
  (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM productos WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al eliminar producto' });
      }

      if (this.changes === 0) {
        return res
          .status(404)
          .json({ message: 'Producto no encontrado' });
      }

      res.json({
        message: 'Producto eliminado correctamente'
      });
    });
  }
);

module.exports = router;