const Evolution = require('../models/Evolution');
const Patient = require('../models/Patient');

exports.createEntry = async (req, res) => {
    try {
        const { pacienteId, nivelDolor, observaciones } = req.body;

        const patient = await Patient.findById(pacienteId);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        let patientProfileId = null;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (patientProfile) {
                patientProfileId = patientProfile._id.toString();
            }
        }

        const isAssignedPhysio = patient.fisioterapeuta.toString() === req.user.id;
        const isOwnProfile = patientProfileId && patient._id.toString() === patientProfileId;

        if (!isAssignedPhysio && !isOwnProfile) {
            return res.status(403).json({ error: 'Acceso denegado: No estás autorizado para añadir evolución a este paciente' });
        }

        const newEntry = new Evolution({
            paciente: pacienteId,
            nivelDolor,
            observaciones
        });

        const entry = await newEntry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al guardar evolución');
    }
};

exports.getHistory = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        let patientProfileId = null;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (patientProfile) {
                patientProfileId = patientProfile._id.toString();
            }
        }

        const isAssignedPhysio = patient.fisioterapeuta.toString() === req.user.id;
        const isOwnProfile = patientProfileId && patient._id.toString() === patientProfileId;

        if (!isAssignedPhysio && !isOwnProfile) {
            return res.status(403).json({ error: 'Acceso denegado: No estás autorizado para ver el historial de este paciente' });
        }

        // Obtenemos las últimas 10 entradas ordenadas por fecha
        const history = await Evolution.find({ paciente: req.params.patientId })
            .sort({ fecha: 1 })
            .limit(10);
            
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor al obtener historial');
    }
};
