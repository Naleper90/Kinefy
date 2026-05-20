const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const evolutionController = require('../controllers/evolution.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   POST /api/patients
// @desc    Crear un nuevo paciente
// @access  Privado (Solo fisioterapeutas)
router.post('/', authMiddleware, patientController.createPatient);

// @route   GET /api/patients
// @desc    Obtener todos los pacientes del fisioterapeuta
// @access  Privado
router.get('/', authMiddleware, patientController.getPatients);

// @route   GET /api/patients/me
// @desc    Obtener datos del paciente logueado
// @access  Privado
router.get('/me', authMiddleware, patientController.getMyPatientData);

// @route   PUT /api/patients/:id
// @desc    Actualizar un paciente
// @access  Privado
router.put('/:id', authMiddleware, patientController.updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Eliminar un paciente
// @access  Privado
router.delete('/:id', authMiddleware, patientController.deletePatient);

// @route   POST /api/patients/:id/reset-password
// @desc    Generar contraseña temporal para el paciente
// @access  Privado (Solo Fisioterapeutas)
router.post('/:id/reset-password', authMiddleware, patientController.resetPatientPassword);

// @route   POST /api/patients/:id/exercises
// @desc    Asignar ejercicios a un paciente
// @access  Privado (Fisios)
router.post('/:id/exercises', authMiddleware, patientController.assignExercises);

// @route   PUT /api/patients/exercises/:exerciseId
// @desc    Actualizar estado de un ejercicio
// @access  Privado (Pacientes)
router.put('/exercises/:exerciseId', authMiddleware, patientController.updateExerciseStatus);

// --- Rutas de Evolución Clínica ---

// @route   POST /api/patients/evolution
// @desc    Registrar una entrada de dolor/evolución
// @access  Privado
router.post('/evolution', authMiddleware, evolutionController.createEntry);

// @route   GET /api/patients/evolution/:patientId
// @desc    Obtener historial de evolución de un paciente
// @access  Privado
router.get('/evolution/:patientId', authMiddleware, evolutionController.getHistory);

// --- Rutas de Gestión Documental ---

// @route   POST /api/patients/:id/documents
// @desc    Añadir un documento a la ficha
// @access  Privado (Fisios)
router.post('/:id/documents', authMiddleware, patientController.addDocument);

// @route   DELETE /api/patients/:id/documents/:documentId
// @desc    Eliminar un documento de la ficha
// @access  Privado (Fisios)
router.delete('/:id/documents/:documentId', authMiddleware, patientController.deleteDocument);

module.exports = router;
