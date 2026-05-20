const express = require('express');
const router = express.Router();
const { 
    createAppointment, 
    createBulkAppointments, 
    getAppointments, 
    updateAppointmentStatus, 
    deleteAppointment, 
    getOccupiedAppointments,
    updateAppointment 
} = require('../controllers/appointment.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, createAppointment);
router.post('/bulk', auth, createBulkAppointments);
router.get('/', auth, getAppointments);
router.get('/occupied', auth, getOccupiedAppointments);
router.patch('/:id/status', auth, updateAppointmentStatus);
router.put('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);

module.exports = router;
