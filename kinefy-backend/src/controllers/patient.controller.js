const Patient = require('../models/Patient');

const createPatient = async (req, res) => {
    try {
        const { nombre, fechaInicio, estado } = req.body;

        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({
                error: 'Acceso denegado',
                code: 'FORBIDDEN_ACCESS'
            });
        }

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio', code: 'VALIDATION_ERROR' });
        }

        const newPatient = new Patient({
            nombre,
            fechaInicio,
            estado,
            fisioterapeuta: req.user.id
        });

        const patient = await newPatient.save();
        res.status(201).json(patient);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos inválidos',
                code: 'BAD_REQUEST'
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Error del servidor', code: 'SERVER_ERROR' });
    }
};

const getPatients = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({
                error: 'Acceso denegado',
                code: 'FORBIDDEN_ACCESS'
            });
        }

        const patients = await Patient.find({ fisioterapeuta: req.user.id }).sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor', code: 'SERVER_ERROR' });
    }
};

module.exports = {
    createPatient,
    getPatients
};
