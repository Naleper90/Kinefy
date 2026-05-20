const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Exercise = require('../models/Exercise');

const dbUri = process.env.MONGO_URI;

if (!dbUri) {
    console.error('ERROR: La variable de entorno MONGO_URI no está definida.');
    console.log('Uso: MONGO_URI="tu_url_de_atlas" node src/scripts/seed-appointments-exercises.js');
    process.exit(1);
}

// Datos de ejercicios realistas
const exercisesData = [
    // 2 ejercicios de hombro
    {
        nombre: "Rotación Externa de Hombro con Banda",
        descripcion: "Sujeta la banda elástica a un poste. Mantén el codo doblado a 90 grados y pegado al costado de tu cuerpo. Rota el antebrazo hacia afuera alejándolo del abdomen, controlando la tensión en todo el recorrido. Nivel: Principiante. Duración: 45s.",
        categoria: "Fuerza",
        seriesDefecto: "3x15",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
        nombre: "Movilidad de Hombro con Pica",
        descripcion: "Sujeta un bastón o pica con ambas manos separadas a una distancia mayor que el ancho de tus hombros. Eleva los brazos estirados por encima de la cabeza y llévalos hacia atrás lentamente hasta donde tu movilidad lo permita. Nivel: Intermedio. Duración: 60s.",
        categoria: "Movilidad",
        seriesDefecto: "3x10"
    },
    // 2 ejercicios de rodilla
    {
        nombre: "Extensión Isométrica de Cuádriceps",
        descripcion: "Sentado en una silla con la espalda recta. Extiende la rodilla derecha por completo levantando el pie hasta la horizontal. Contrae el muslo con fuerza durante 5 segundos y vuelve a bajar lentamente. Nivel: Principiante. Duración: 30s.",
        categoria: "Fuerza",
        seriesDefecto: "3x12"
    },
    {
        nombre: "Sentadilla Goblet",
        descripcion: "Sujeta una mancuerna o peso ligero pegado al pecho. Con los pies al ancho de los hombros, realiza una flexión de rodillas y caderas bajando el tronco de forma erguida hasta que los muslos queden paralelos al suelo. Empuja con fuerza desde los talones para subir. Nivel: Avanzado. Duración: 45s.",
        categoria: "Fuerza",
        seriesDefecto: "4x10",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    // 2 ejercicios de lumbar/core
    {
        nombre: "Plancha Abdominal Clásica",
        descripcion: "Apóyate sobre tus antebrazos y las puntas de los pies. Mantén el cuerpo alineado desde la cabeza hasta los talones, activando intensamente el abdomen y el glúteo. Evita que la cadera caiga. Nivel: Intermedio. Duración: 30 segundos por serie.",
        categoria: "Core",
        seriesDefecto: "3x30s"
    },
    {
        nombre: "Estiramiento Gato-Camello",
        descripcion: "En cuadrupedia, arquea la columna hacia arriba escondiendo la cabeza (gato) y luego deprime la columna lumbar levantando la cabeza y dirigiendo la pelvis hacia arriba (camello). Realiza el movimiento de forma lenta y fluida para aliviar tensión. Nivel: Principiante. Duración: 60s.",
        categoria: "Movilidad",
        seriesDefecto: "3x10"
    },
    // 2 ejercicios de tobillo/equilibrio
    {
        nombre: "Apoyo Monopodal sobre Superficie Estable",
        descripcion: "Ponte de pie con los pies descalzos. Eleva una pierna flexionando la cadera y mantén el equilibrio sobre un solo pie, buscando mantener el tobillo estable. Si te resulta fácil, cierra los ojos para mayor dificultad. Nivel: Intermedio. Duración: 30 segundos por lado.",
        categoria: "Equilibrio",
        seriesDefecto: "3x30s",
        mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
        nombre: "Elevación de Talones (Fuerza de Gemelos)",
        descripcion: "Apoyado ligeramente en una pared para mantener el equilibrio, elévate sobre la punta de ambos pies lo máximo posible de forma explosiva y desciende de manera lenta y controlada (fase excéntrica de 3 segundos). Nivel: Principiante. Duración: 45s.",
        categoria: "Fuerza",
        seriesDefecto: "3x15"
    }
];

const mockAppointmentsInfo = [
    // Pasadas (últimas 2 semanas) - completada
    { diasOffset: -12, hora: "09:30", tipo: "Evaluación Inicial", notas: "Paciente muestra buena disposición. Se definen objetivos del plan terapéutico.", estado: "completada" },
    { diasOffset: -8, hora: "11:00", tipo: "Sesión de Terapia Manual", notas: "Punción seca en trapecio y estiramientos pasivos.", estado: "completada" },
    { diasOffset: -6, hora: "16:30", tipo: "Control de Ejercicios", notas: "Corrección técnica de la sentadilla y plancha abdominal.", estado: "completada" },
    { diasOffset: -3, hora: "10:15", tipo: "Reevaluación de Dolor", notas: "Descenso notable en escala EVA (de 6 a 3). Movilidad mejorada.", estado: "completada" },
    { diasOffset: -1, hora: "12:00", tipo: "Sesión de Fortalecimiento", notas: "Trabajo activo con cargas moderadas sin molestias reseñables.", estado: "completada" },
    
    // Hoy o Mañana - confirmada
    { diasOffset: 0, hora: "09:00", tipo: "Seguimiento Semanal", notas: "Sesión programada para hoy. Control de adherencia a la rutina en casa.", estado: "confirmada" },
    { diasOffset: 0, hora: "17:00", tipo: "Sesión de Movilidad", notas: "Revisión de dolor y ajuste de ejercicios de estiramiento.", estado: "confirmada" },
    { diasOffset: 1, hora: "11:30", tipo: "Tratamiento y Descarga", notas: "Sesión reservada para mañana. Masoterapia de descarga en miembros inferiores.", estado: "confirmada" },
    
    // Futuras (próximas 2 semanas) - pendiente o confirmada
    { diasOffset: 3, hora: "10:00", tipo: "Sesión de Control", notas: "Revisión de ejercicios de estabilidad de tobillo.", estado: "confirmada" },
    { diasOffset: 5, hora: "18:15", tipo: "Seguimiento Clínico", notas: "Evaluación intermedia de la progresión del rango de movimiento.", estado: "pendiente" },
    { diasOffset: 7, hora: "12:30", tipo: "Sesión de Fortalecimiento", notas: "Aumento progresivo de resistencia con bandas elásticas.", estado: "confirmada" },
    { diasOffset: 10, hora: "09:30", tipo: "Reevaluación General", notas: "Pruebas de fuerza funcional y rango articular comparativo.", estado: "pendiente" },
    { diasOffset: 13, hora: "16:00", tipo: "Sesión de Cierre", notas: "Sesión final de valoración y entrega de pauta de alta deportiva.", estado: "pendiente" }
];

async function seed() {
    try {
        console.log('Conectando a base de datos de producción...');
        await mongoose.connect(dbUri);
        console.log('¡Conexión establecida!');

        // 1. Buscar al fisioterapeuta Natalia López
        console.log('Buscando al fisioterapeuta natalia@kinefy.com...');
        const fisioterapeuta = await User.findOne({ email: 'natalia@kinefy.com' });
        if (!fisioterapeuta) {
            console.error('ERROR: No se encontró al fisioterapeuta natalia@kinefy.com en la base de datos.');
            process.exit(1);
        }
        console.log(`Fisioterapeuta encontrado: ${fisioterapeuta.name} (ID: ${fisioterapeuta._id})`);

        // 2. Buscar pacientes existentes
        console.log('Buscando pacientes registrados...');
        const patients = await Patient.find({});
        if (patients.length === 0) {
            console.error('ERROR: No hay pacientes creados en la colección patients.');
            process.exit(1);
        }
        console.log(`Se encontraron ${patients.length} pacientes en la base de datos.`);

        // 3. Crear Ejercicios
        console.log('\nCreando ejercicios en la biblioteca...');
        let exercisesCreatedCount = 0;
        for (const exData of exercisesData) {
            // Verificar si ya existe un ejercicio con ese nombre para evitar duplicados
            const exists = await Exercise.findOne({ nombre: exData.nombre, fisioterapeuta: fisioterapeuta._id });
            if (exists) {
                console.log(`-> El ejercicio "${exData.nombre}" ya existe en la biblioteca. Omitiendo.`);
                continue;
            }

            const exercise = new Exercise({
                nombre: exData.nombre,
                descripcion: exData.descripcion,
                categoria: exData.categoria,
                mediaUrl: exData.mediaUrl,
                seriesDefecto: exData.seriesDefecto,
                fisioterapeuta: fisioterapeuta._id
            });
            await exercise.save();
            exercisesCreatedCount++;
        }
        console.log(`¡Biblioteca de ejercicios procesada! Creados: ${exercisesCreatedCount} ejercicios nuevos.`);

        // 4. Crear Citas
        console.log('\nCreando citas en la agenda...');
        let appointmentsCreatedCount = 0;
        
        // Distribuidor de pacientes secuencial para asegurar que no caigan todas al mismo
        let patientIndex = 0;

        for (const apptInfo of mockAppointmentsInfo) {
            const date = new Date();
            date.setDate(date.getDate() + apptInfo.diasOffset);
            
            // Asignar paciente de forma rotativa
            const patient = patients[patientIndex];
            patientIndex = (patientIndex + 1) % patients.length;

            const appointment = new Appointment({
                paciente: patient._id,
                fisioterapeuta: fisioterapeuta._id,
                fecha: date,
                hora: apptInfo.hora,
                tipo: apptInfo.tipo,
                estado: apptInfo.estado,
                notas: apptInfo.notes || apptInfo.notas
            });

            await appointment.save();
            appointmentsCreatedCount++;
        }

        console.log('\n======================================================');
        console.log('¡PROCESO DE SEED COMPLETADO!');
        console.log(`- Citas creadas e insertadas: ${appointmentsCreatedCount}`);
        console.log(`- Ejercicios creados e insertados: ${exercisesCreatedCount}`);
        console.log('======================================================');

    } catch (error) {
        console.error('Error durante la inserción de datos de citas y ejercicios:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión cerrada.');
        process.exit(0);
    }
}

seed();
