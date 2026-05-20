const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    categoria: {
        type: String,
        enum: ['Movilidad', 'Fuerza', 'Core', 'Estiramiento', 'Equilibrio', 'Otro'],
        default: 'Otro'
    },
    mediaUrl: {
        type: String, // URL de YouTube/Vimeo o imagen
        trim: true
    },
    seriesDefecto: {
        type: String, // Ej: "3x12"
        trim: true
    },
    fisioterapeuta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
