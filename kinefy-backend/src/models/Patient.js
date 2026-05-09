const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    series: { type: String },
    mediaUrl: { type: String },
    completado: { type: Boolean, default: false },
    fechaCompletado: { type: Date }
});

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
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    telefono: String,
    diagnostico: String,
    notas: String,
    fechaNacimiento: Date,
    profesion: String,
    actividadFisica: {
        type: String,
        enum: ['sedentario', 'moderado', 'activo', 'atleta'],
        default: 'moderado'
    },
    informes: [{
        nombre: String,
        url: String,
        fecha: { type: Date, default: Date.now }
    }],
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado', 'pausado'],
        default: 'activo'
    },
    ejercicios: [exerciseSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
