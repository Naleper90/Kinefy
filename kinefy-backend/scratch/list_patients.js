
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://NataliaKinefy:hABa5CunazYHZXeU@cluster0.hmwm3e5.mongodb.net/kinefy?appName=Cluster0";

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conectado a MongoDB...");
        
        const users = await mongoose.connection.db.collection('users').find({ role: 'paciente' }).toArray();
        
        if (users.length === 0) {
            console.log("No hay pacientes registrados en la tabla de usuarios.");
        } else {
            console.log("--- LISTA DE USUARIOS PACIENTES ---");
            users.forEach(u => {
                console.log(`Nombre: ${u.name} | Email: ${u.email}`);
            });
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

listUsers();
