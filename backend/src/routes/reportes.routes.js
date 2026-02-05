const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

const {
  reporteClinicoPDF
} = require('../controllers/reportesclinico.controller');

const {
  reporteComercialPDF
} = require('../controllers/reportescomercial.controller');

const reporteInventario = require('../controllers/reportesinventario.controller');

// 🔹 Reporte clínico por paciente
router.get(
  '/clinico/paciente/:id',
  auth,
  role(['trabajador', 'supervisor']),
  reporteClinicoPDF
);

// 🔹 Reporte comercial (todos)
router.get(
  '/comercial',
  auth,
  role(['supervisor']),
  reporteComercialPDF
);

router.get(
  '/inventario',
  auth,
  role(['supervisor']),
  reporteInventario
);

module.exports = router;