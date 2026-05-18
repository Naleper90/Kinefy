require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const path = require('path');
const fs = require('fs');

const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
