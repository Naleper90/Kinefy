const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   POST /api/patients
// @desc    Crear un nuevo paciente
// @access  Privado (Solo fisioterapeutas)
router.post('/', authMiddleware, patientController.createPatient);

// @route   GET /api/patients
// @desc    Obtener todos los pacientes del fisioterapeuta
// @access  Privado
router.get('/', authMiddleware, patientController.getPatients);

// @route   PUT /api/patients/:id
// @desc    Actualizar un paciente
// @access  Privado
router.put('/:id', authMiddleware, patientController.updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Eliminar un paciente
// @access  Privado
router.delete('/:id', authMiddleware, patientController.deletePatient);

module.exports = router;
