const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// Configuración de cabeceras de seguridad HTTP
app.use(helmet());

// Registro de solicitudes HTTP en consola (logs)
app.use(morgan('combined'));

// Crear directorio de archivos clínicos subidos si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Orígenes permitidos para la política de CORS
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, '')) 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const originClean = origin.trim().replace(/\/$/, '');
        if (allowedOrigins.indexOf(originClean) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origen no permitido: "${origin}". Permitidos: ${allowedOrigins.join(', ')}`);
            callback(new Error('Acceso CORS no permitido por la política de seguridad'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Limitador de peticiones para prevenir ataques de fuerza bruta en el login
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 20, // máximo de 20 intentos por minuto
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en un minuto' }
});
app.use('/api/auth/login', loginLimiter);

// Definición y enrutamiento de endpoints
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/exercises', require('./routes/exercise.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
    res.send('Kinefy API is running...');
});

module.exports = app;
