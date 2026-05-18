const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    leida: {
        type: Boolean,
        default: false
    },
    tipo: {
        type: String,
        enum: ['cita_solicitada', 'cita_confirmada', 'cita_cancelada', 'ejercicios_nuevos'],
        default: 'cita_solicitada'
    },
    metadata: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
