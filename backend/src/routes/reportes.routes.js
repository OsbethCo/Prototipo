const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

const {
  reporteClinicoPDF
} = require('../controllers/reporteClinico.controller');

const {
  reporteComercialPDF
} = require('../controllers/reportescomercial.controller');

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

module.exports = router;