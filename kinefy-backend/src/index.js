require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
