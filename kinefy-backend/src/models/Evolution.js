const mongoose = require('mongoose');

const evolutionSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    nivelDolor: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    observaciones: {
        type: String,
        trim: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Evolution', evolutionSchema);
