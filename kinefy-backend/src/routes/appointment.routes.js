const express = require('express');
const router = express.Router();
const { createAppointment, createBulkAppointments, getAppointments, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointment.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, createAppointment);
router.post('/bulk', auth, createBulkAppointments);
router.get('/', auth, getAppointments);
router.patch('/:id/status', auth, updateAppointmentStatus);
router.delete('/:id', auth, deleteAppointment);

module.exports = router;
