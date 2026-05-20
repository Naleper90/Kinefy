const Evolution = require('../models/Evolution');

exports.createEntry = async (req, res) => {
    try {
        const { pacienteId, nivelDolor, observaciones } = req.body;

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
