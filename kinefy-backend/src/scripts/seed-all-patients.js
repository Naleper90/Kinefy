const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Exercise = require('../models/Exercise');
const Appointment = require('../models/Appointment');
const Evolution = require('../models/Evolution');

const dbUri = process.env.MONGO_URI;
if (!dbUri) {
    console.error('ERROR: MONGO_URI no definida.');
    process.exit(1);
}

const pacientesData = {
    "elena@kinefy.com": {
        ejercicios: [
            { nombre: "Extensión Isométrica de Cuádriceps", series: "3x12", completado: true },
            { nombre: "Sentadilla Goblet", series: "4x10", completado: true },
            { nombre: "Apoyo Monopodal sobre Superficie Estable", series: "3x30s", completado: false },
            { nombre: "Plancha Abdominal Clásica", series: "3x30s", completado: false }
        ],
        dolor: [
            { diasAtras: 30, nivel: 7, obs: "Dolor intenso en rodilla izquierda al bajar escaleras. Carga unipodal imposible." },
            { diasAtras: 25, nivel: 6, obs: "Leve mejoría. Inflamación reducida. Inicio de ejercicios isométricos." },
            { diasAtras: 21, nivel: 6, obs: "Tolerancia al ejercicio isométrico buena. Sin dolor agudo en reposo." },
            { diasAtras: 17, nivel: 5, obs: "Primera sentadilla goblet sin dolor. Musculatura más activa." },
            { diasAtras: 14, nivel: 5, obs: "Camino sin cojear. Evito aún correr o saltar." },
            { diasAtras: 10, nivel: 4, obs: "Bicicleta estática 20 min sin molestias. Buen progreso." },
            { diasAtras: 7, nivel: 3, obs: "Jogging suave 10 min. Ligera incomodidad al final." },
            { diasAtras: 4, nivel: 3, obs: "EVA 3/10. Cuádriceps notablemente más fuertes." },
            { diasAtras: 2, nivel: 2, obs: "Casi sin dolor. Solo rigidez matutina leve." },
            { diasAtras: 0, nivel: 2, obs: "Hoy completé todos los ejercicios sin molestias." }
        ],
        citas: [
            { diasOffset: -28, hora: "10:00", tipo: "Valoración Inicial", estado: "completada", notas: "Tendinopatía rotuliana confirmada. EVA 7. Se pauta reposo relativo y ejercicios isométricos." },
            { diasOffset: -21, hora: "11:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Mejora de inflamación. Inicio de sentadilla goblet con carga baja." },
            { diasOffset: -14, hora: "10:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 5. Tolerancia a la carga en progresión. Aumentamos repeticiones." },
            { diasOffset: -7, hora: "09:00", tipo: "Reevaluación Funcional", estado: "completada", notas: "Jogging suave iniciado. Propiocepción estable. EVA 3." },
            { diasOffset: 3, hora: "10:00", tipo: "Sesión de Seguimiento", estado: "confirmada", notas: "Valorar retorno a actividad deportiva." },
            { diasOffset: 10, hora: "11:00", tipo: "Sesión de Fisioterapia", estado: "pendiente", notas: null },
            { diasOffset: 17, hora: "10:00", tipo: "Alta Provisional", estado: "pendiente", notas: null }
        ]
    },
    "sofia.ruiz@hotmail.com": {
        ejercicios: [
            { nombre: "Estiramiento Gato-Camello", series: "3x10", completado: true },
            { nombre: "Plancha Abdominal Clásica", series: "3x30s", completado: false },
            { nombre: "Rotación Externa de Hombro con Banda", series: "3x15", completado: true },
            { nombre: "Movilidad de Hombro con Pica", series: "3x10", completado: false }
        ],
        dolor: [
            { diasAtras: 30, nivel: 6, obs: "Cervicalgia intensa. Limitación de rotación hacia la derecha. Contractura trapecio superior bilateral." },
            { diasAtras: 24, nivel: 5, obs: "Tras primera sesión de terapia manual mejora notable. Menos tensión en trapecios." },
            { diasAtras: 18, nivel: 5, obs: "Estiramientos diarios mantenidos. Dolor más localizado, menos difuso." },
            { diasAtras: 12, nivel: 4, obs: "Rotación cervical al 80% del rango normal. Trabajo de hombro sin dolor." },
            { diasAtras: 6, nivel: 3, obs: "EVA 3. Solo molestia al final del día con mucho trabajo en pantalla." },
            { diasAtras: 0, nivel: 2, obs: "Mucho mejor. Control postural mejorado. Pausa cada hora frente al ordenador." }
        ],
        citas: [
            { diasOffset: -25, hora: "12:00", tipo: "Valoración Inicial", estado: "completada", notas: "Cervicalgia mecánica crónica. Alta carga tensional en trapecio. EVA 6. Punción seca pautada." },
            { diasOffset: -18, hora: "11:30", tipo: "Punción Seca + Terapia Manual", estado: "completada", notas: "Respuesta muy positiva. Reducción inmediata de tensión muscular." },
            { diasOffset: -11, hora: "10:00", tipo: "Control y Ejercicios", estado: "completada", notas: "EVA 4. Inicio de ejercicios de movilidad cervical y hombro." },
            { diasOffset: -4, hora: "12:30", tipo: "Seguimiento Clínico", estado: "completada", notas: "EVA 3. Buena adherencia a los ejercicios en casa. Se espacian las visitas." },
            { diasOffset: 7, hora: "11:00", tipo: "Revisión Mensual", estado: "confirmada", notas: null },
            { diasOffset: 21, hora: "10:00", tipo: "Alta si evolución positiva", estado: "pendiente", notas: null }
        ]
    },
    "javier.ortiz@yahoo.es": {
        ejercicios: [
            { nombre: "Estiramiento Gato-Camello", series: "3x10", completado: true },
            { nombre: "Plancha Abdominal Clásica", series: "3x30s", completado: true },
            { nombre: "Elevación de Talones (Fuerza de Gemelos)", series: "3x15", completado: false },
            { nombre: "Apoyo Monopodal sobre Superficie Estable", series: "3x30s", completado: false }
        ],
        dolor: [
            { diasAtras: 21, nivel: 5, obs: "Rotura fibrilar confirmada por eco. EVA 5 al estiramiento pasivo. Inicio fase inflamatoria." },
            { diasAtras: 17, nivel: 4, obs: "Crioterapia y reposo relativo. Reducción del hematoma." },
            { diasAtras: 14, nivel: 4, obs: "Inicio de ejercicios isométricos. Sin dolor en reposo." },
            { diasAtras: 10, nivel: 3, obs: "Camino sin cojear. Ligera tensión al estiramiento." },
            { diasAtras: 7, nivel: 3, obs: "Bicicleta estática sin molestias. Progresión estable." },
            { diasAtras: 4, nivel: 2, obs: "Trote suave 10 min. Sin dolor agudo." },
            { diasAtras: 0, nivel: 2, obs: "EVA 2. Listo para retomar entrenamientos con precaución." }
        ],
        citas: [
            { diasOffset: -20, hora: "09:30", tipo: "Valoración Inicial", estado: "completada", notas: "Rotura fibrilar 2cm en isquiotibiales. Fase aguda. PRICE y electroterapia." },
            { diasOffset: -14, hora: "10:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Fase subaguda. Inicio de cargas excéntricas suaves." },
            { diasOffset: -7, hora: "11:00", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Trote suave iniciado. Cicatriz en remodelación." },
            { diasOffset: 2, hora: "09:00", tipo: "Test de Retorno Deportivo", estado: "confirmada", notas: "Valorar retorno al entrenamiento completo." },
            { diasOffset: 9, hora: "10:00", tipo: "Alta Deportiva", estado: "pendiente", notas: null }
        ]
    },
    "lucia.sanchez@outlook.com": {
        ejercicios: [
            { nombre: "Movilidad de Hombro con Pica", series: "3x10", completado: true },
            { nombre: "Estiramiento Gato-Camello", series: "3x10", completado: false },
            { nombre: "Plancha Abdominal Clásica", series: "3x20s", completado: false }
        ],
        dolor: [
            { diasAtras: 20, nivel: 6, obs: "Parestesias nocturnas intensas. Hormigueo en dedos 1-3. Uso de férula nocturna iniciado." },
            { diasAtras: 14, nivel: 5, obs: "Mejora parcial con férula. Menos despertares nocturnos." },
            { diasAtras: 9, nivel: 4, obs: "Ejercicios de deslizamiento neural iniciados. Sensación de alivio post-ejercicio." },
            { diasAtras: 4, nivel: 3, obs: "Parestesias solo al final de jornada laboral intensa." },
            { diasAtras: 0, nivel: 3, obs: "EVA 3. Ajuste del ratón ergonómico ha ayudado mucho." }
        ],
        citas: [
            { diasOffset: -18, hora: "16:00", tipo: "Valoración Inicial", estado: "completada", notas: "Síndrome túnel carpiano bilateral. Test de Phalen positivo. Se indica férula y ejercicios neurales." },
            { diasOffset: -11, hora: "17:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Movilización neural. Mejoría subjetiva notable tras sesión." },
            { diasOffset: -4, hora: "16:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Reducción de parestesias nocturnas. Continuar pauta domiciliaria." },
            { diasOffset: 5, hora: "16:00", tipo: "Revisión y ajuste de pauta", estado: "confirmada", notas: null },
            { diasOffset: 19, hora: "17:00", tipo: "Seguimiento Mensual", estado: "pendiente", notas: null }
        ]
    },
    "manuel.gomez@gmail.com": {
        ejercicios: [
            { nombre: "Estiramiento Gato-Camello", series: "3x10", completado: true },
            { nombre: "Plancha Abdominal Clásica", series: "3x30s", completado: true },
            { nombre: "Sentadilla Goblet", series: "3x10", completado: false },
            { nombre: "Extensión Isométrica de Cuádriceps", series: "3x12", completado: false }
        ],
        dolor: [
            { diasAtras: 25, nivel: 8, obs: "Lumbalgia muy incapacitante. No puede conducir más de 30 min. Flexión lumbar muy limitada." },
            { diasAtras: 20, nivel: 7, obs: "Primera sesión de terapia manual. Alivio temporal. Se inician ejercicios de movilidad de cadera." },
            { diasAtras: 15, nivel: 6, obs: "Gato-camello diario mantenido. Mejora de flexión lumbar al 60%." },
            { diasAtras: 10, nivel: 5, obs: "Puede conducir hasta 1h sin dolor agudo. Progreso notable." },
            { diasAtras: 5, nivel: 4, obs: "Plancha abdominal tolerada bien. CORE más activo." },
            { diasAtras: 0, nivel: 4, obs: "EVA 4. Jornada laboral completa con pausas cada 2h. Mucho mejor." }
        ],
        citas: [
            { diasOffset: -22, hora: "09:00", tipo: "Valoración Inicial", estado: "completada", notas: "Lumbalgia inespecífica grave. Limitación severa en flexión. EVA 8. Electroterapia y terapia manual." },
            { diasOffset: -15, hora: "09:30", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Mejoría progresiva. Inicio de ejercicios de CORE." },
            { diasOffset: -8, hora: "10:00", tipo: "Control y Ejercicios", estado: "completada", notas: "EVA 5. Conducción mejorada. Sentadilla sin dolor." },
            { diasOffset: -1, hora: "09:00", tipo: "Seguimiento Semanal", estado: "completada", notas: "EVA 4. Buena adherencia a ejercicios. Se reduce frecuencia de visitas." },
            { diasOffset: 6, hora: "09:30", tipo: "Revisión Quincenal", estado: "confirmada", notas: null },
            { diasOffset: 20, hora: "09:00", tipo: "Seguimiento Mensual", estado: "pendiente", notas: null }
        ]
    },
    "carmen.delgado@icloud.com": {
        ejercicios: [
            { nombre: "Extensión Isométrica de Cuádriceps", series: "4x15", completado: true },
            { nombre: "Sentadilla Goblet", series: "4x10", completado: true },
            { nombre: "Apoyo Monopodal sobre Superficie Estable", series: "3x30s", completado: true },
            { nombre: "Elevación de Talones (Fuerza de Gemelos)", series: "3x15", completado: false }
        ],
        dolor: [
            { diasAtras: 30, nivel: 6, obs: "Mes 3 post-cirugía LCA. Inflamación residual. Rango 0-120°. Inicio de potenciación activa." },
            { diasAtras: 24, nivel: 5, obs: "Cuádriceps activándose bien. Sentadilla isométrica sin dolor." },
            { diasAtras: 18, nivel: 4, obs: "Bicicleta estática 30 min sin molestias. Rango de movilidad mejorado a 130°." },
            { diasAtras: 12, nivel: 4, obs: "Trote suave en línea recta iniciado. Sin inestabilidad aparente." },
            { diasAtras: 6, nivel: 3, obs: "Cambios de dirección suaves realizados. Confianza en la rodilla aumentando." },
            { diasAtras: 0, nivel: 2, obs: "EVA 2. Entrenamiento casi normal. Pendiente test de salto para alta." }
        ],
        citas: [
            { diasOffset: -28, hora: "08:30", tipo: "Inicio Fase 3 Rehabilitación", estado: "completada", notas: "Mes 3 post-cirugía. Rango 0-120°. Inicio potenciación activa de cuádriceps." },
            { diasOffset: -21, hora: "08:30", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Bicicleta estática tolerada. Rango mejorado a 130°." },
            { diasOffset: -14, hora: "09:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Trote suave iniciado. Propiocepción en progresión." },
            { diasOffset: -7, hora: "08:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Cambios de dirección suaves. Muy buena evolución." },
            { diasOffset: 1, hora: "08:30", tipo: "Test de Salto y Retorno Deportivo", estado: "confirmada", notas: "Valorar retorno al entrenamiento de atletismo." },
            { diasOffset: 8, hora: "09:00", tipo: "Alta Deportiva Provisional", estado: "pendiente", notas: null },
            { diasOffset: 30, hora: "08:30", tipo: "Revisión Post-Alta", estado: "pendiente", notas: null }
        ]
    }
};

async function seedAllPatients() {
    try {
        await mongoose.connect(dbUri);
        console.log("✓ Conectado a MongoDB\n");

        const fisio = await User.findOne({ email: "natalia@kinefy.com" });
        if (!fisio) throw new Error("Fisioterapeuta Natalia no encontrada. Ejecuta seed-production.js primero.");
        console.log(`✓ Fisioterapeuta: ${fisio.name}\n`);

        // Obtener todos los ejercicios de la biblioteca del fisio
        const biblioteca = await Exercise.find({ fisioterapeuta: fisio._id });
        console.log(`✓ Ejercicios en biblioteca: ${biblioteca.length}\n`);

        let totalCitas = 0;
        let totalEvoluciones = 0;

        for (const [email, datos] of Object.entries(pacientesData)) {
            const userDoc = await User.findOne({ email });
            if (!userDoc) { console.log(`⚠ Usuario ${email} no encontrado, omitiendo.`); continue; }

            const patientDoc = await Patient.findOne({ usuario: userDoc._id });
            if (!patientDoc) { console.log(`⚠ Ficha de paciente ${email} no encontrada, omitiendo.`); continue; }

            console.log(`─── Procesando: ${userDoc.name} ───`);

            // Asignar ejercicios
            patientDoc.ejercicios = datos.ejercicios.map(ej => {
                const biblio = biblioteca.find(b => b.nombre === ej.nombre);
                return {
                    nombre: ej.nombre,
                    series: ej.series,
                    mediaUrl: biblio?.mediaUrl || null,
                    completado: ej.completado
                };
            });
            await patientDoc.save();
            console.log(`  ✓ ${datos.ejercicios.length} ejercicios asignados`);

            // Evolución/dolor
            await Evolution.deleteMany({ paciente: patientDoc._id });
            const hoy = new Date();
            for (const r of datos.dolor) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() - r.diasAtras);
                fecha.setHours(9, 0, 0, 0);
                await Evolution.create({ paciente: patientDoc._id, nivelDolor: r.nivel, observaciones: r.obs, fecha });
            }
            totalEvoluciones += datos.dolor.length;
            console.log(`  ✓ ${datos.dolor.length} registros de evolución`);

            // Citas
            await Appointment.deleteMany({ paciente: patientDoc._id });
            for (const c of datos.citas) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() + c.diasOffset);
                fecha.setHours(8, 0, 0, 0);
                await Appointment.create({
                    paciente: patientDoc._id,
                    fisioterapeuta: fisio._id,
                    fecha, hora: c.hora, tipo: c.tipo, estado: c.estado,
                    notas: c.notas || undefined
                });
            }
            totalCitas += datos.citas.length;
            console.log(`  ✓ ${datos.citas.length} citas creadas`);
        }

        console.log("\n══════════════════════════════════════════");
        console.log("✅ SEED COMPLETO DE TODOS LOS PACIENTES");
        console.log(`   Pacientes procesados: ${Object.keys(pacientesData).length}`);
        console.log(`   Total citas creadas: ${totalCitas}`);
        console.log(`   Total evoluciones creadas: ${totalEvoluciones}`);
        console.log("══════════════════════════════════════════");

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedAllPatients();