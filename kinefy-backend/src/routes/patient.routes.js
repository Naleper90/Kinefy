const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   POST /api/patients
// @desc    Crear un nuevo paciente
// @access  Privado (Solo fisioterapeutas)
router.post('/', authMiddleware, patientController.createPatient);

module.exports = router;
