const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Evolution = require('../models/Evolution');

const dbUri = process.env.MONGO_URI;

if (!dbUri) {
    console.error('ERROR: La variable de entorno MONGO_URI no está definida.');
    console.log('Uso: MONGO_URI="tu_url_de_atlas" node src/scripts/seed-production.js');
    process.exit(1);
}

const mockPatientsData = [
    {
        name: "Elena García",
        email: "elena@kinefy.com",
        password: "Paciente2024!",
        telefono: "+34 612 345 678",
        diagnostico: "Tendinopatía rotuliana izquierda",
        notas: "Dolor EVA 6 en carga unipodal. Buena movilidad articular general.",
        fechaNacimiento: new Date("1993-04-15"),
        profesion: "Arquitecta",
        actividadFisica: "moderado"
    },
    {
        name: "Carlos Mendoza",
        email: "carlos.mendoza@gmail.com",
        password: "Paciente2024!",
        telefono: "+34 689 112 233",
        diagnostico: "Esguince de tobillo derecho (Grado II)",
        notas: "Inestabilidad residual ligera. Se pauta trabajo de propiocepción y fortalecimiento de peroneos.",
        fechaNacimiento: new Date("1988-11-22"),
        profesion: "Informático",
        actividadFisica: "sedentario"
    },
    {
        name: "Sofía Ruiz",
        email: "sofia.ruiz@hotmail.com",
        password: "Paciente2024!",
        telefono: "+34 654 987 321",
        diagnostico: "Cervicalgia mecánica crónica",
        notas: "Carga tensional alta en trapecio superior. Mejora tras tratamiento manual. Se recomiendan estiramientos diarios.",
        fechaNacimiento: new Date("1975-06-05"),
        profesion: "Profesora",
        actividadFisica: "moderado"
    },
    {
        name: "Javier Ortiz",
        email: "javier.ortiz@yahoo.es",
        password: "Paciente2024!",
        telefono: "+34 630 554 433",
        diagnostico: "Rotura fibrilar de isquiotibiales (2cm)",
        notas: "Fase de remodelación de la cicatriz. Dolor EVA 2 al estiramiento pasivo. Comienza carrera suave.",
        fechaNacimiento: new Date("1999-02-18"),
        profesion: "Estudiante de Ciencias del Deporte",
        actividadFisica: "atleta"
    },
    {
        name: "Lucía Sánchez",
        email: "lucia.sanchez@outlook.com",
        password: "Paciente2024!",
        telefono: "+34 622 778 899",
        diagnostico: "Síndrome de túnel carpiano bilateral",
        notas: "Parestesias nocturnas. Indicado uso de férula nocturna y ejercicios de deslizamiento neural.",
        fechaNacimiento: new Date("1982-09-30"),
        profesion: "Diseñadora Gráfica",
        actividadFisica: "sedentario"
    },
    {
        name: "Manuel Gómez",
        email: "manuel.gomez@gmail.com",
        password: "Paciente2024!",
        telefono: "+34 670 445 566",
        diagnostico: "Lumbalgia inespecífica",
        notas: "Dolor incapacitante matutino. Limitación en flexión lumbar. Pauta de ejercicios de movilidad de cadera y CORE.",
        fechaNacimiento: new Date("1964-12-12"),
        profesion: "Conductor de autobús",
        actividadFisica: "moderado"
    },
    {
        name: "Carmen Delgado",
        email: "carmen.delgado@icloud.com",
        password: "Paciente2024!",
        telefono: "+34 605 889 900",
        diagnostico: "Rehabilitación post-quirúrgica LCA de rodilla",
        notas: "Mes 3 post-cirugía. Rango de movilidad: 0º extensión / 120º flexión. Potenciación activa de cuádriceps.",
        fechaNacimiento: new Date("1995-07-25"),
        profesion: "Entrenadora de Atletismo",
        actividadFisica: "activo"
    }
];

async function seed() {
    try {
        console.log('Conectando a base de datos...');
        await mongoose.connect(dbUri);
        console.log('¡Conexión establecida!');

        // Limpieza de colecciones implicadas para evitar datos huérfanos o duplicados
        console.log('\nLimpiando colecciones existentes...');
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await Evolution.deleteMany({});
        console.log('¡Colecciones users, patients, appointments y evolutions limpiadas!');

        // 1. Crear el Fisioterapeuta principal (Natalia López)
        console.log('\nCreando Fisioterapeuta principal...');
        const fisioterapeuta = new User({
            name: "Natalia López",
            email: "natalia@kinefy.com",
            password: "Kinefy2024!", // Será hasheada automáticamente por el pre-save hook
            role: "fisioterapeuta"
        });
        await fisioterapeuta.save();
        console.log(`Fisioterapeuta creado: Natalia López (${fisioterapeuta.email})`);

        // 2. Crear los pacientes
        console.log('\nCreando pacientes de demostración...');
        for (const pData of mockPatientsData) {
            // A. Crear el User correspondiente para su inicio de sesión
            const user = new User({
                name: pData.name,
                email: pData.email,
                password: pData.password, // Será hasheada automáticamente
                role: "paciente"
            });
            await user.save();

            // B. Crear la ficha clínica de Patient vinculada al Fisioterapeuta
            const patient = new Patient({
                nombre: pData.name,
                usuario: user._id,
                fisioterapeuta: fisioterapeuta._id,
                telefono: pData.telefono,
                diagnostico: pData.diagnostico,
                notas: pData.notas,
                fechaNacimiento: pData.fechaNacimiento,
                profesion: pData.profesion,
                actividadFisica: pData.actividadFisica
            });
            await patient.save();

            console.log(`Paciente creado: ${pData.name} - User ID: ${user._id} - Patient ID: ${patient._id}`);
        }

        console.log('\n======================================================');
        console.log('¡PROCESO DE SEED REALIZADO CON ÉXITO EN PRODUCCIÓN!');
        console.log('Se han creado 1 Fisioterapeuta y 7 Pacientes vinculados.');
        console.log('======================================================');

    } catch (error) {
        console.error('Error durante la inserción de datos de seed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión cerrada.');
        process.exit(0);
    }
}

seed();
