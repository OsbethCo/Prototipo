const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

const {
  reporteClinicoPDF,
  reporteHistorialPDF,
  reporteInventarioPacientePDF
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

// 🔹 Reporte general de historial de retiros
router.get(
  '/historial',
  auth,
  role(['trabajador', 'supervisor']),
  reporteHistorialPDF
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

// 🔹 Reporte de inventario de pacientes
router.get(
  '/inventario-paciente',
  auth,
  role(['trabajador', 'supervisor']),
  reporteInventarioPacientePDF
);

module.exports = router;
