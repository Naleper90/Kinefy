const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    fisioterapeuta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        default: 'Seguimiento'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'],
        default: 'pendiente'
    },
    notas: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
