const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// Security HTTP headers
app.use(helmet());

// HTTP request logger
app.use(morgan('combined'));

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
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

// Rate limiter for login route (DWES/Despliegue)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // max 20 requests per minute
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en un minuto' }
});
app.use('/api/auth/login', loginLimiter);

// Routes
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
