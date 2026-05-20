/**
 * Script de migración: Crear usuarios para pacientes sin cuenta de acceso.
 * Conecta a MongoDB Atlas y para cada Patient sin campo 'usuario',
 * crea un User y lo enlaza.
 *
 * Uso: node kinefy-backend/src/scripts/migrar-usuarios-pacientes.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI no definido en .env');
    process.exit(1);
}

// ---- Schemas inline (sin importar los modelos completos) ----
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: { type: String, default: 'paciente' }
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
const User = mongoose.model('User', UserSchema);

const PatientSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fisioterapeuta: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { strict: false });
const Patient = mongoose.model('Patient', PatientSchema);

// ---- Utilidad: generar contraseña aleatoria ----
function generarPassword(len = 8) {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

async function migrar() {
    console.log(`\n🔌 Conectando a: ${MONGO_URI.substring(0, 40)}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Pacientes sin campo 'usuario' (null o inexistente)
    const pacientesSinUsuario = await Patient.find({ usuario: { $in: [null, undefined] } });

    if (pacientesSinUsuario.length === 0) {
        console.log('✅ Todos los pacientes ya tienen usuario. No hay nada que migrar.');
        await mongoose.disconnect();
        return;
    }

    console.log(`⚠️  ${pacientesSinUsuario.length} paciente(s) sin usuario encontrado(s):\n`);

    const resultados = [];

    for (const paciente of pacientesSinUsuario) {
        let email = paciente.email;

        // Si no tiene email, generamos uno ficticio basado en su nombre
        if (!email) {
            const slug = (paciente.nombre || 'paciente')
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
                .replace(/\s+/g, '.') // espacios → punto
                .replace(/[^a-z0-9.]/g, ''); // caracteres no válidos
            email = `${slug}.${paciente._id.toString().slice(-4)}@kinefy-demo.com`;

            // Guardamos el email en el paciente
            paciente.email = email;
            console.log(`  📧 Email generado para "${paciente.nombre}": ${email}`);
        }

        // Verificar si ya existe un User con ese email
        let user = await User.findOne({ email });

        if (user) {
            console.log(`  🔗 Usuario existente encontrado para ${email}. Enlazando...`);
        } else {
            const tempPass = generarPassword();
            user = new User({
                name: paciente.nombre,
                email,
                password: tempPass,
                role: 'paciente'
            });
            await user.save();
            resultados.push({ nombre: paciente.nombre, email, tempPass });
            console.log(`  ✅ Usuario creado para "${paciente.nombre}" (${email}) | Contraseña temporal: ${tempPass}`);
        }

        paciente.usuario = user._id;
        await paciente.save();
        console.log(`  🔗 Paciente "${paciente.nombre}" enlazado con usuario ${user._id}\n`);
    }

    console.log('\n========================================');
    console.log('📋 RESUMEN DE CREDENCIALES GENERADAS:');
    console.log('========================================');
    for (const r of resultados) {
        console.log(`  👤 ${r.nombre} | Email: ${r.email} | Contraseña temporal: ${r.tempPass}`);
    }
    console.log('========================================\n');
    console.log('✅ Migración completada. Ya puedes usar el reset de contraseña.\n');

    await mongoose.disconnect();
}

migrar().catch(err => {
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
});
