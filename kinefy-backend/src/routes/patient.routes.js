const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas de pacientes deben estar protegidas por el middleware
// router.use(authMiddleware);

module.exports = router;
