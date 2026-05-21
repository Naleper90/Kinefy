const mongoose = require('mongoose');
const User     = require('../models/User');
const Patient  = require('../models/Patient');
const Exercise = require('../models/Exercise');
const Appointment = require('../models/Appointment');
const Evolution   = require('../models/Evolution');

const dbUri = process.env.MONGO_URI;
if (!dbUri) {
    console.error('ERROR: MONGO_URI no definida.');
    process.exit(1);
}

// ─── Ejercicios de biblioteca para tobillo/propiocepción ───────────────────
const ejerciciosBiblioteca = [
    {
        nombre: 'Eversión de tobillo con banda elástica',
        descripcion: 'Siéntate en una silla con la pierna extendida. Fija la banda elástica en el antepié y realiza movimientos de eversión (hacia afuera) de forma controlada. Mantén 2 segundos en el punto final.',
        categoria: 'Fuerza',
        seriesDefecto: '3x15',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
        nombre: 'Equilibrio unipodal sobre superficie inestable',
        descripcion: 'De pie sobre el pie afectado, mantén el equilibrio en una almohada o cojín durante 30 segundos. Aumenta la dificultad cerrando los ojos progresivamente. Básico para recuperar propiocepción tras esguince.',
        categoria: 'Equilibrio',
        seriesDefecto: '3x30s',
        mediaUrl: null
    },
    {
        nombre: 'Flexión plantar excéntrica (Alfredson)',
        descripcion: 'Sube de puntillas con ambos pies y baja lentamente solo con el pie afectado. Realiza el movimiento de bajada en 3 segundos. Fortalece el tendón de Aquiles y los peroneos.',
        categoria: 'Fuerza',
        seriesDefecto: '3x12',
        mediaUrl: null
    },
    {
        nombre: 'Movilidad de tobillo en descarga (alfabeto)',
        descripcion: 'Sentado, traza las letras del abecedario con el pie afectado moviéndolo solo desde el tobillo. Mejora el rango articular y el drenaje linfático post-esguince.',
        categoria: 'Movilidad',
        seriesDefecto: '2x (A-Z)',
        mediaUrl: null
    }
];

// ─── Registros del diario de dolor (último mes) ────────────────────────────
const registrosDolor = [
    { diasAtras: 28, nivel: 7, obs: 'Dolor intenso tras larga caminata en el trabajo. Zona lateral del tobillo muy sensible al tacto.' },
    { diasAtras: 25, nivel: 6, obs: 'Mejoría leve. Menos inflamación por la mañana. Sigo notando inestabilidad al bajar escaleras.' },
    { diasAtras: 21, nivel: 5, obs: 'Empiezo los ejercicios de propiocepción. Algo de fatiga muscular pero sin dolor agudo.' },
    { diasAtras: 18, nivel: 5, obs: 'Primer día que aguanto 30s en equilibrio unipodal. Buen progreso.' },
    { diasAtras: 14, nivel: 4, obs: 'Notable mejoría. Puedo caminar sin cojear. Aún evito correr.' },
    { diasAtras: 10, nivel: 4, obs: 'Realicé 20 min de bicicleta estática sin molestias. Tobillo más estable.' },
    { diasAtras: 7,  nivel: 3, obs: 'Primer jogging suave (10 min). Algo de incomodidad al final pero sin dolor agudo.' },
    { diasAtras: 4,  nivel: 3, obs: 'EVA 3/10. Progresión muy buena. Peroneos más activos.' },
    { diasAtras: 2,  nivel: 2, obs: 'Me siento casi al 100%. Ligera rigidez matutina únicamente.' },
    { diasAtras: 0,  nivel: 2, obs: 'Hoy he corrido 20 minutos sin problemas. Optimista con la evolución.' },
];

// ─── Citas (pasadas + futuras) ─────────────────────────────────────────────
const citas = [
    // Pasadas
    { diasOffset: -30, hora: '10:00', tipo: 'Valoración Inicial', estado: 'completada', notas: 'Primera visita. Exploración funcional completa. Edema grado 2 en maléolo lateral. Pauta de reposo relativo e inicio PRICE.' },
    { diasOffset: -21, hora: '10:00', tipo: 'Revisión y tratamiento manual', estado: 'completada', notas: 'Reducción notable del edema. Se inicia trabajo de propiocepción básico y fortalecimiento de peroneos con banda.' },
    { diasOffset: -14, hora: '11:00', tipo: 'Sesión de Fisioterapia', estado: 'completada', notas: 'Buena tolerancia al ejercicio excéntrico. Marcha normalizada. Se añade ejercicio de equilibrio en superficie inestable.' },
    { diasOffset: -7,  hora: '10:30', tipo: 'Control de Evolución', estado: 'completada', notas: 'EVA 3/10. Primer intento de carrera controlada exitoso. Propiocepción en progresión clara.' },
    // Próximas
    { diasOffset: 2,   hora: '10:00', tipo: 'Sesión de Seguimiento', estado: 'confirmada', notas: 'Valorar retorno deportivo. Test de salto unipodal.' },
    { diasOffset: 9,   hora: '11:30', tipo: 'Sesión de Fisioterapia', estado: 'pendiente',  notas: null },
    { diasOffset: 16,  hora: '10:00', tipo: 'Alta provisional y pautas de mantenimiento', estado: 'pendiente', notas: null },
    { diasOffset: 30,  hora: '10:00', tipo: 'Revisión post-alta (1 mes)', estado: 'pendiente', notas: null },
];

// ──────────────────────────────────────────────────────────────────────────

async function seedCarlos() {
    try {
        await mongoose.connect(dbUri);
        console.log('✓ Conectado a MongoDB\n');

        // 1. Localizar fisioterapeuta (Natalia) y paciente (Carlos)
        const fisio = await User.findOne({ email: 'natalia@kinefy.com' });
        if (!fisio) throw new Error('Fisioterapeuta Natalia no encontrada. Ejecuta seed-production.js primero.');

        const carlosUser = await User.findOne({ email: 'carlos.mendoza@gmail.com' });
        if (!carlosUser) throw new Error('Usuario Carlos no encontrado. Ejecuta seed-production.js primero.');

        const carlosPatient = await Patient.findOne({ usuario: carlosUser._id });
        if (!carlosPatient) throw new Error('Ficha de paciente Carlos no encontrada.');

        console.log(`✓ Fisioterapeuta: ${fisio.name}`);
        console.log(`✓ Paciente: ${carlosPatient.nombre} (Patient ID: ${carlosPatient._id})\n`);

        // 2. Crear ejercicios de biblioteca (si no existen ya)
        console.log('─── Creando ejercicios en la biblioteca ───');
        const ejerciciosCreados = [];
        for (const ex of ejerciciosBiblioteca) {
            const existing = await Exercise.findOne({ nombre: ex.nombre, fisioterapeuta: fisio._id });
            if (existing) {
                console.log(`  (ya existe) ${ex.nombre}`);
                ejerciciosCreados.push(existing);
            } else {
                const nuevo = await Exercise.create({ ...ex, fisioterapeuta: fisio._id });
                console.log(`  + Creado: ${ex.nombre}`);
                ejerciciosCreados.push(nuevo);
            }
        }

        // 3. Asignar esos ejercicios al paciente Carlos (reemplaza los actuales)
        console.log('\n─── Asignando ejercicios al paciente ───');
        carlosPatient.ejercicios = ejerciciosCreados.map(ex => ({
            nombre: ex.nombre,
            series: ex.seriesDefecto || '3x10',
            mediaUrl: ex.mediaUrl || null,
            completado: false
        }));
        // Marcar algunos como completados para que el progreso se vea real
        carlosPatient.ejercicios[0].completado = true;
        carlosPatient.ejercicios[2].completado = true;
        await carlosPatient.save();
        console.log(`  ✓ ${ejerciciosCreados.length} ejercicios asignados a Carlos (2 marcados como completados)`);

        // 4. Registrar diario de evolución/dolor
        console.log('\n─── Registrando diario de dolor ───');
        // Eliminar evoluciones previas de Carlos para no duplicar
        await Evolution.deleteMany({ paciente: carlosPatient._id });
        const hoy = new Date();
        for (const r of registrosDolor) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - r.diasAtras);
            fecha.setHours(9, 0, 0, 0);
            await Evolution.create({
                paciente: carlosPatient._id,
                nivelDolor: r.nivel,
                observaciones: r.obs,
                fecha
            });
            console.log(`  + EVA ${r.nivel}/10 — hace ${r.diasAtras === 0 ? 'hoy' : r.diasAtras + ' días'}`);
        }

        // 5. Crear citas (elimina las previas de Carlos primero)
        console.log('\n─── Creando citas ───');
        await Appointment.deleteMany({ paciente: carlosPatient._id });
        for (const c of citas) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() + c.diasOffset);
            fecha.setHours(8, 0, 0, 0); // normalizar a medianoche para comparación de fecha
            await Appointment.create({
                paciente:       carlosPatient._id,
                fisioterapeuta: fisio._id,
                fecha,
                hora:   c.hora,
                tipo:   c.tipo,
                estado: c.estado,
                notas:  c.notas || undefined
            });
            const signo = c.diasOffset >= 0 ? `+${c.diasOffset}` : `${c.diasOffset}`;
            console.log(`  + [${c.estado.toUpperCase()}] ${c.tipo} (día ${signo}) a las ${c.hora}`);
        }

        console.log('\n══════════════════════════════════════════');
        console.log('✅ SEED DE CARLOS COMPLETADO');
        console.log(`   ${ejerciciosCreados.length} ejercicios asignados`);
        console.log(`   ${registrosDolor.length} registros de dolor`);
        console.log(`   ${citas.length} citas (${citas.filter(c => c.diasOffset < 0).length} pasadas + ${citas.filter(c => c.diasOffset >= 0).length} futuras)`);
        console.log('══════════════════════════════════════════');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedCarlos();
