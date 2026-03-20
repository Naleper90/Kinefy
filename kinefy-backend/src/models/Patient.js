const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    fisioterapeuta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado', 'pausado'],
        default: 'activo'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
