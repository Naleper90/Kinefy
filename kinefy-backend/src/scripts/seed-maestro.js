const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// ─── BIBLIOTECA DE EJERCICIOS CON VÍDEOS REALES ───────────────────────────
const ejerciciosBiblioteca = [
    {
        nombre: "Rotación Externa de Hombro con Banda",
        descripcion: "Sujeta la banda elástica a un poste. Mantén el codo doblado a 90° y pegado al costado. Rota el antebrazo hacia afuera alejándolo del abdomen, controlando la tensión en todo el recorrido.",
        categoria: "Fuerza",
        seriesDefecto: "3x15",
        mediaUrl: "https://www.youtube.com/watch?v=VZpSBiGbvMk"
    },
    {
        nombre: "Movilidad de Hombro con Pica",
        descripcion: "Sujeta un bastón con ambas manos separadas más que el ancho de hombros. Eleva los brazos estirados por encima de la cabeza y llévalos hacia atrás lentamente hasta donde tu movilidad lo permita.",
        categoria: "Movilidad",
        seriesDefecto: "3x10",
        mediaUrl: "https://www.youtube.com/watch?v=9jGAXHKXoI0"
    },
    {
        nombre: "Extensión Isométrica de Cuádriceps",
        descripcion: "Sentado en una silla con la espalda recta. Extiende la rodilla levantando el pie hasta la horizontal. Contrae el muslo con fuerza durante 5 segundos y vuelve a bajar lentamente.",
        categoria: "Fuerza",
        seriesDefecto: "3x12",
        mediaUrl: "https://www.youtube.com/watch?v=rDjSFGdQvMQ"
    },
    {
        nombre: "Sentadilla Goblet",
        descripcion: "Sujeta una mancuerna pegada al pecho. Con los pies al ancho de los hombros, flexiona rodillas y caderas bajando el tronco erguido hasta que los muslos queden paralelos al suelo. Empuja desde los talones para subir.",
        categoria: "Fuerza",
        seriesDefecto: "4x10",
        mediaUrl: "https://www.youtube.com/watch?v=MxsFDiCMahg"
    },
    {
        nombre: "Plancha Abdominal Clásica",
        descripcion: "Apóyate sobre antebrazos y puntas de los pies. Mantén el cuerpo alineado desde la cabeza hasta los talones, activando abdomen y glúteo. Evita que la cadera caiga.",
        categoria: "Core",
        seriesDefecto: "3x30s",
        mediaUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw"
    },
    {
        nombre: "Estiramiento Gato-Camello",
        descripcion: "En cuadrupedia, arquea la columna hacia arriba escondiendo la cabeza (gato) y luego deprime la lumbar levantando la cabeza y dirigiendo la pelvis hacia arriba (camello). Movimiento lento y fluido.",
        categoria: "Movilidad",
        seriesDefecto: "3x10",
        mediaUrl: "https://www.youtube.com/watch?v=kqnua4rHVVA"
    },
    {
        nombre: "Apoyo Monopodal sobre Superficie Estable",
        descripcion: "De pie descalzo, eleva una pierna y mantén el equilibrio sobre un solo pie. Si resulta fácil, cierra los ojos para mayor dificultad. Básico para recuperar propiocepción tras esguince.",
        categoria: "Equilibrio",
        seriesDefecto: "3x30s",
        mediaUrl: "https://www.youtube.com/watch?v=OA5JGf5dszU"
    },
    {
        nombre: "Elevación de Talones (Fuerza de Gemelos)",
        descripcion: "Apoyado ligeramente en una pared, elévate sobre la punta de ambos pies de forma explosiva y desciende lentamente en 3 segundos (fase excéntrica). Fortalece gemelos y tendón de Aquiles.",
        categoria: "Fuerza",
        seriesDefecto: "3x15",
        mediaUrl: "https://www.youtube.com/watch?v=sKe4rqGlrLY"
    },
    {
        nombre: "Eversión de Tobillo con Banda Elástica",
        descripcion: "Sentado con la pierna extendida. Fija la banda en el antepié y realiza movimientos de eversión (hacia afuera) de forma controlada. Mantén 2 segundos en el punto final. Fundamental en esguinces.",
        categoria: "Fuerza",
        seriesDefecto: "3x15",
        mediaUrl: "https://www.youtube.com/watch?v=Q19zrzNnVWs"
    },
    {
        nombre: "Flexión Plantar Excéntrica (Alfredson)",
        descripcion: "Sube de puntillas con ambos pies y baja lentamente solo con el pie afectado en 3 segundos. Fortalece el tendón de Aquiles y peroneos. Protocolo estándar de rehabilitación.",
        categoria: "Fuerza",
        seriesDefecto: "3x12",
        mediaUrl: "https://www.youtube.com/watch?v=sKe4rqGlrLY"
    },
    {
        nombre: "Deslizamiento Neural del Mediano",
        descripcion: "Sentado, extiende el brazo al lado con la palma hacia arriba. Dobla la muñeca hacia atrás y lleva la cabeza al lado contrario. Luego flexiona la muñeca y lleva la cabeza al lado del brazo. Movimiento suave y continuo.",
        categoria: "Movilidad",
        seriesDefecto: "2x10",
        mediaUrl: "https://www.youtube.com/watch?v=9jGAXHKXoI0"
    },
    {
        nombre: "Puente de Glúteos",
        descripcion: "Tumbado boca arriba con rodillas flexionadas y pies apoyados. Eleva la pelvis contrayendo glúteos hasta alinear caderas con rodillas. Aguanta 2-3 segundos arriba y baja lentamente.",
        categoria: "Fuerza",
        seriesDefecto: "3x15",
        mediaUrl: "https://www.youtube.com/watch?v=rDjSFGdQvMQ"
    }
];

// ─── PACIENTES ─────────────────────────────────────────────────────────────
const pacientesConfig = [
    {
        name: "Elena García", email: "elena@kinefy.com", password: "Paciente2024!",
        telefono: "+34 612 345 678", diagnostico: "Tendinopatía rotuliana izquierda",
        notas: "Dolor EVA 6 en carga unipodal. Buena movilidad articular general.",
        fechaNacimiento: new Date("1993-04-15"), profesion: "Arquitecta", actividadFisica: "moderado",
        ejercicios: ["Extensión Isométrica de Cuádriceps", "Sentadilla Goblet", "Apoyo Monopodal sobre Superficie Estable", "Plancha Abdominal Clásica"],
        completados: [0, 1],
        dolor: [
            { diasAtras: 30, nivel: 7, obs: "Dolor intenso en rodilla izquierda al bajar escaleras. Carga unipodal imposible." },
            { diasAtras: 24, nivel: 6, obs: "Leve mejoría. Inflamación reducida. Inicio de ejercicios isométricos." },
            { diasAtras: 17, nivel: 5, obs: "Primera sentadilla goblet sin dolor. Musculatura más activa." },
            { diasAtras: 10, nivel: 4, obs: "Bicicleta estática 20 min sin molestias." },
            { diasAtras: 4, nivel: 3, obs: "EVA 3/10. Cuádriceps notablemente más fuertes." },
            { diasAtras: 0, nivel: 2, obs: "Hoy completé todos los ejercicios sin molestias." }
        ],
        citas: [
            { diasOffset: -28, hora: "10:00", tipo: "Valoración Inicial", estado: "completada", notas: "Tendinopatía rotuliana confirmada. EVA 7. Ejercicios isométricos pautados." },
            { diasOffset: -14, hora: "10:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 5. Tolerancia a la carga en progresión." },
            { diasOffset: -7, hora: "09:00", tipo: "Reevaluación Funcional", estado: "completada", notas: "Jogging suave iniciado. EVA 3." },
            { diasOffset: 3, hora: "10:00", tipo: "Sesión de Seguimiento", estado: "confirmada", notas: "Valorar retorno a actividad deportiva." },
            { diasOffset: 17, hora: "10:00", tipo: "Alta Provisional", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Carlos Mendoza", email: "carlos.mendoza@gmail.com", password: "Paciente2024!",
        telefono: "+34 689 112 233", diagnostico: "Esguince de tobillo derecho (Grado II)",
        notas: "Inestabilidad residual ligera. Trabajo de propiocepción y fortalecimiento de peroneos.",
        fechaNacimiento: new Date("1988-11-22"), profesion: "Informático", actividadFisica: "sedentario",
        ejercicios: ["Eversión de Tobillo con Banda Elástica", "Apoyo Monopodal sobre Superficie Estable", "Flexión Plantar Excéntrica (Alfredson)", "Elevación de Talones (Fuerza de Gemelos)"],
        completados: [0, 2],
        dolor: [
            { diasAtras: 28, nivel: 7, obs: "Dolor intenso tras larga caminata. Zona lateral del tobillo muy sensible." },
            { diasAtras: 21, nivel: 5, obs: "Empiezo ejercicios de propiocepción. Algo de fatiga muscular pero sin dolor agudo." },
            { diasAtras: 14, nivel: 4, obs: "Notable mejoría. Puedo caminar sin cojear." },
            { diasAtras: 7, nivel: 3, obs: "Primer jogging suave (10 min). Tobillo más estable." },
            { diasAtras: 2, nivel: 2, obs: "Me siento casi al 100%. Ligera rigidez matutina." },
            { diasAtras: 0, nivel: 2, obs: "Hoy he corrido 20 minutos sin problemas." }
        ],
        citas: [
            { diasOffset: -30, hora: "10:00", tipo: "Valoración Inicial", estado: "completada", notas: "Esguince grado II. Edema grado 2. Inicio PRICE." },
            { diasOffset: -21, hora: "10:00", tipo: "Revisión y tratamiento manual", estado: "completada", notas: "Reducción del edema. Inicio propiocepción." },
            { diasOffset: -7, hora: "10:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Primer trote exitoso." },
            { diasOffset: 2, hora: "10:00", tipo: "Sesión de Seguimiento", estado: "confirmada", notas: "Valorar retorno deportivo." },
            { diasOffset: 16, hora: "10:00", tipo: "Alta provisional", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Sofía Ruiz", email: "sofia.ruiz@hotmail.com", password: "Paciente2024!",
        telefono: "+34 654 987 321", diagnostico: "Cervicalgia mecánica crónica",
        notas: "Carga tensional alta en trapecio superior. Mejora tras tratamiento manual.",
        fechaNacimiento: new Date("1975-06-05"), profesion: "Profesora", actividadFisica: "moderado",
        ejercicios: ["Estiramiento Gato-Camello", "Rotación Externa de Hombro con Banda", "Movilidad de Hombro con Pica", "Plancha Abdominal Clásica"],
        completados: [0, 1],
        dolor: [
            { diasAtras: 25, nivel: 6, obs: "Cervicalgia intensa. Limitación de rotación a la derecha. Contractura trapecio bilateral." },
            { diasAtras: 18, nivel: 5, obs: "Tras terapia manual mejora notable. Menos tensión en trapecios." },
            { diasAtras: 12, nivel: 4, obs: "Rotación cervical al 80%. Trabajo de hombro sin dolor." },
            { diasAtras: 6, nivel: 3, obs: "EVA 3. Solo molestia al final del día." },
            { diasAtras: 0, nivel: 2, obs: "Mucho mejor. Control postural mejorado." }
        ],
        citas: [
            { diasOffset: -25, hora: "12:00", tipo: "Valoración Inicial", estado: "completada", notas: "Cervicalgia mecánica crónica. Punción seca pautada." },
            { diasOffset: -18, hora: "11:30", tipo: "Punción Seca + Terapia Manual", estado: "completada", notas: "Reducción inmediata de tensión muscular." },
            { diasOffset: -4, hora: "12:30", tipo: "Seguimiento Clínico", estado: "completada", notas: "EVA 3. Buena adherencia." },
            { diasOffset: 7, hora: "11:00", tipo: "Revisión Mensual", estado: "confirmada", notas: null },
            { diasOffset: 21, hora: "10:00", tipo: "Alta si evolución positiva", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Javier Ortiz", email: "javier.ortiz@yahoo.es", password: "Paciente2024!",
        telefono: "+34 630 554 433", diagnostico: "Rotura fibrilar de isquiotibiales (2cm)",
        notas: "Fase de remodelación de la cicatriz. EVA 2 al estiramiento pasivo.",
        fechaNacimiento: new Date("1999-02-18"), profesion: "Estudiante Ciencias del Deporte", actividadFisica: "atleta",
        ejercicios: ["Estiramiento Gato-Camello", "Plancha Abdominal Clásica", "Elevación de Talones (Fuerza de Gemelos)", "Puente de Glúteos"],
        completados: [0, 1],
        dolor: [
            { diasAtras: 21, nivel: 5, obs: "Rotura fibrilar confirmada por eco. EVA 5 al estiramiento pasivo." },
            { diasAtras: 14, nivel: 4, obs: "Inicio ejercicios isométricos. Sin dolor en reposo." },
            { diasAtras: 7, nivel: 3, obs: "Bicicleta estática sin molestias." },
            { diasAtras: 0, nivel: 2, obs: "EVA 2. Listo para retomar entrenamientos con precaución." }
        ],
        citas: [
            { diasOffset: -20, hora: "09:30", tipo: "Valoración Inicial", estado: "completada", notas: "Rotura fibrilar 2cm. PRICE y electroterapia." },
            { diasOffset: -14, hora: "10:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Inicio de cargas excéntricas suaves." },
            { diasOffset: -7, hora: "11:00", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Trote suave iniciado." },
            { diasOffset: 2, hora: "09:00", tipo: "Test de Retorno Deportivo", estado: "confirmada", notas: "Valorar retorno al entrenamiento completo." },
            { diasOffset: 9, hora: "10:00", tipo: "Alta Deportiva", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Lucía Sánchez", email: "lucia.sanchez@outlook.com", password: "Paciente2024!",
        telefono: "+34 622 778 899", diagnostico: "Síndrome de túnel carpiano bilateral",
        notas: "Parestesias nocturnas. Férula nocturna y ejercicios de deslizamiento neural.",
        fechaNacimiento: new Date("1982-09-30"), profesion: "Diseñadora Gráfica", actividadFisica: "sedentario",
        ejercicios: ["Deslizamiento Neural del Mediano", "Movilidad de Hombro con Pica", "Estiramiento Gato-Camello"],
        completados: [0],
        dolor: [
            { diasAtras: 20, nivel: 6, obs: "Parestesias nocturnas intensas. Hormigueo en dedos 1-3." },
            { diasAtras: 14, nivel: 5, obs: "Mejora parcial con férula. Menos despertares nocturnos." },
            { diasAtras: 9, nivel: 4, obs: "Ejercicios de deslizamiento neural. Sensación de alivio post-ejercicio." },
            { diasAtras: 4, nivel: 3, obs: "Parestesias solo al final de jornada laboral intensa." },
            { diasAtras: 0, nivel: 3, obs: "EVA 3. Ajuste del ratón ergonómico ha ayudado mucho." }
        ],
        citas: [
            { diasOffset: -18, hora: "16:00", tipo: "Valoración Inicial", estado: "completada", notas: "Túnel carpiano bilateral. Test de Phalen positivo." },
            { diasOffset: -11, hora: "17:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Movilización neural. Mejoría subjetiva notable." },
            { diasOffset: -4, hora: "16:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Reducción de parestesias nocturnas." },
            { diasOffset: 5, hora: "16:00", tipo: "Revisión y ajuste de pauta", estado: "confirmada", notas: null },
            { diasOffset: 19, hora: "17:00", tipo: "Seguimiento Mensual", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Manuel Gómez", email: "manuel.gomez@gmail.com", password: "Paciente2024!",
        telefono: "+34 670 445 566", diagnostico: "Lumbalgia inespecífica",
        notas: "Dolor incapacitante matutino. Limitación en flexión lumbar.",
        fechaNacimiento: new Date("1964-12-12"), profesion: "Conductor de autobús", actividadFisica: "moderado",
        ejercicios: ["Estiramiento Gato-Camello", "Plancha Abdominal Clásica", "Sentadilla Goblet", "Puente de Glúteos"],
        completados: [0, 1],
        dolor: [
            { diasAtras: 25, nivel: 8, obs: "Lumbalgia muy incapacitante. No puede conducir más de 30 min." },
            { diasAtras: 15, nivel: 6, obs: "Gato-camello diario. Mejora de flexión lumbar al 60%." },
            { diasAtras: 5, nivel: 4, obs: "Plancha abdominal tolerada. CORE más activo." },
            { diasAtras: 0, nivel: 4, obs: "EVA 4. Jornada laboral completa con pausas cada 2h." }
        ],
        citas: [
            { diasOffset: -22, hora: "09:00", tipo: "Valoración Inicial", estado: "completada", notas: "Lumbalgia inespecífica grave. EVA 8. Electroterapia y terapia manual." },
            { diasOffset: -8, hora: "10:00", tipo: "Control y Ejercicios", estado: "completada", notas: "EVA 5. Sentadilla sin dolor." },
            { diasOffset: -1, hora: "09:00", tipo: "Seguimiento Semanal", estado: "completada", notas: "EVA 4. Buena adherencia." },
            { diasOffset: 6, hora: "09:30", tipo: "Revisión Quincenal", estado: "confirmada", notas: null },
            { diasOffset: 20, hora: "09:00", tipo: "Seguimiento Mensual", estado: "pendiente", notas: null }
        ]
    },
    {
        name: "Carmen Delgado", email: "carmen.delgado@icloud.com", password: "Paciente2024!",
        telefono: "+34 605 889 900", diagnostico: "Rehabilitación post-quirúrgica LCA de rodilla",
        notas: "Mes 3 post-cirugía. Rango: 0° extensión / 120° flexión. Potenciación de cuádriceps.",
        fechaNacimiento: new Date("1995-07-25"), profesion: "Entrenadora de Atletismo", actividadFisica: "activo",
        ejercicios: ["Extensión Isométrica de Cuádriceps", "Sentadilla Goblet", "Apoyo Monopodal sobre Superficie Estable", "Elevación de Talones (Fuerza de Gemelos)"],
        completados: [0, 1, 2],
        dolor: [
            { diasAtras: 30, nivel: 6, obs: "Mes 3 post-cirugía LCA. Inflamación residual. Inicio potenciación activa." },
            { diasAtras: 18, nivel: 4, obs: "Bicicleta estática 30 min sin molestias. Rango mejorado a 130°." },
            { diasAtras: 6, nivel: 3, obs: "Cambios de dirección suaves. Confianza en la rodilla aumentando." },
            { diasAtras: 0, nivel: 2, obs: "EVA 2. Entrenamiento casi normal. Pendiente test de salto para alta." }
        ],
        citas: [
            { diasOffset: -28, hora: "08:30", tipo: "Inicio Fase 3 Rehabilitación", estado: "completada", notas: "Mes 3 post-cirugía. Inicio potenciación activa." },
            { diasOffset: -14, hora: "09:00", tipo: "Sesión de Fisioterapia", estado: "completada", notas: "Trote suave iniciado. Propiocepción en progresión." },
            { diasOffset: -7, hora: "08:30", tipo: "Control de Evolución", estado: "completada", notas: "EVA 3. Cambios de dirección suaves." },
            { diasOffset: 1, hora: "08:30", tipo: "Test de Salto y Retorno Deportivo", estado: "confirmada", notas: "Valorar retorno al entrenamiento de atletismo." },
            { diasOffset: 30, hora: "08:30", tipo: "Revisión Post-Alta", estado: "pendiente", notas: null }
        ]
    }
];

async function seedCompleto() {
    try {
        await mongoose.connect(dbUri);
        console.log("✓ Conectado a MongoDB\n");

        // ── Limpiar colecciones ──────────────────────────────────────────
        console.log("─── Limpiando colecciones ───");
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await Evolution.deleteMany({});
        await Exercise.deleteMany({});
        console.log("✓ Colecciones limpiadas\n");

        // ── Crear Fisioterapeuta ─────────────────────────────────────────
        console.log("─── Creando fisioterapeuta ───");
        const fisio = await User.create({
            name: "Natalia López",
            email: "natalia@kinefy.com",
            password: "Kinefy2024!",
            role: "fisioterapeuta"
        });
        console.log(`✓ Fisioterapeuta: ${fisio.name} (${fisio.email})\n`);

        // ── Crear Biblioteca de Ejercicios ──────────────────────────────
        console.log("─── Creando biblioteca de ejercicios ───");
        const ejerciciosCreados = [];
        for (const ex of ejerciciosBiblioteca) {
            const nuevo = await Exercise.create({ ...ex, fisioterapeuta: fisio._id });
            ejerciciosCreados.push(nuevo);
            console.log(`  + ${ex.nombre}`);
        }
        console.log(`✓ ${ejerciciosCreados.length} ejercicios creados\n`);

        // ── Crear Pacientes con datos completos ─────────────────────────
        let totalCitas = 0;
        let totalEvoluciones = 0;

        for (const p of pacientesConfig) {
            console.log(`─── Creando paciente: ${p.name} ───`);

            const userDoc = await User.create({
                name: p.name, email: p.email,
                password: p.password, role: "paciente"
            });

            // Asignar ejercicios
            const ejerciciosAsignados = p.ejercicios.map((nombre, idx) => {
                const biblio = ejerciciosCreados.find(e => e.nombre === nombre);
                return {
                    nombre,
                    series: biblio?.seriesDefecto || "3x10",
                    mediaUrl: biblio?.mediaUrl || null,
                    completado: p.completados.includes(idx)
                };
            });

            const patientDoc = await Patient.create({
                nombre: p.name,
                usuario: userDoc._id,
                fisioterapeuta: fisio._id,
                telefono: p.telefono,
                diagnostico: p.diagnostico,
                notas: p.notas,
                fechaNacimiento: p.fechaNacimiento,
                profesion: p.profesion,
                actividadFisica: p.actividadFisica,
                ejercicios: ejerciciosAsignados
            });

            console.log(`  ✓ Usuario y ficha creados`);
            console.log(`  ✓ ${ejerciciosAsignados.length} ejercicios asignados (${p.completados.length} completados)`);

            // Evolución/dolor
            const hoy = new Date();
            for (const r of p.dolor) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() - r.diasAtras);
                fecha.setHours(9, 0, 0, 0);
                await Evolution.create({ paciente: patientDoc._id, nivelDolor: r.nivel, observaciones: r.obs, fecha });
            }
            totalEvoluciones += p.dolor.length;
            console.log(`  ✓ ${p.dolor.length} registros de evolución`);

            // Citas
            for (const c of p.citas) {
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
            totalCitas += p.citas.length;
            console.log(`  ✓ ${p.citas.length} citas creadas\n`);
        }

        console.log("══════════════════════════════════════════════════");
        console.log("✅  SEED MAESTRO COMPLETADO");
        console.log(`   👩‍⚕️  Fisioterapeuta: Natalia López (natalia@kinefy.com / Kinefy2024!)`);
        console.log(`   🏋️  Ejercicios en biblioteca: ${ejerciciosCreados.length}`);
        console.log(`   👥  Pacientes creados: ${pacientesConfig.length}`);
        console.log(`   📅  Citas totales: ${totalCitas}`);
        console.log(`   📈  Registros EVA totales: ${totalEvoluciones}`);
        console.log("══════════════════════════════════════════════════");
        console.log("\nCredenciales de acceso:");
        console.log("  Fisio:    natalia@kinefy.com     / Kinefy2024!");
        pacientesConfig.forEach(p => console.log(`  Paciente: ${p.email.padEnd(32)} / ${p.password}`));

    } catch (err) {
        console.error("❌ Error:", err.message);
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedCompleto();
