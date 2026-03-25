const Patient = require('../models/Patient');

const createPatient = async (req, res) => {
    try {
        const { nombre, fechaInicio, estado } = req.body;

        // Seguridad: Solo los fisioterapeutas pueden dar de alta pacientes
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({
                error: 'Acceso denegado. Solo los fisioterapeutas pueden realizar esta acción.',
                code: 'FORBIDDEN_ACCESS'
            });
        }

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del paciente es obligatorio', code: 'VALIDATION_ERROR' });
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
        // Manejar errores de validación de Mongoose (como valores inválidos de enum en 'estado')
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Datos inválidos transmitidos en la petición',
                code: 'BAD_REQUEST'
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Error al crear el paciente', code: 'SERVER_ERROR' });
    }
};

module.exports = {
    createPatient
};
