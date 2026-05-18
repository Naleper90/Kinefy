const Patient = require('../models/Patient');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');


const createPatient = async (req, res) => {
    try {
        const { nombre, email, password, telefono, diagnostico, notas, fechaNacimiento, profesion, actividadFisica } = req.body;

        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        // 1. Validaciones básicas
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Este email ya está registrado en el sistema' });
        }

        user = new User({
            name: nombre,
            email,
            password,
            role: 'paciente'
        });
        await user.save();

        const newPatient = new Patient({
            nombre,
            usuario: user._id,
            fisioterapeuta: req.user.id,
            telefono,
            diagnostico,
            notas,
            fechaNacimiento,
            profesion,
            actividadFisica
        });

        const patient = await newPatient.save();

        sendEmail({
            email: patient.email,
            subject: 'Bienvenido/a a Kinefy - Tu plan de rehabilitación',
            html: `
                <div style="font-family: sans-serif; color: #1A2E35;">
                    <h1 style="color: #55A98A;">¡Hola, ${nombre}!</h1>
                    <p>Tu fisioterapeuta ha creado tu ficha clínica en <strong>Kinefy</strong>.</p>
                    <p>A partir de ahora podrás acceder para ver tus ejercicios y registrar tu evolución.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p><strong>Tus datos de acceso:</strong></p>
                    <ul>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Contraseña:</strong> (La proporcionada por tu fisio)</li>
                    </ul>
                    <p>Puedes acceder aquí: <a href="http://localhost" style="color: #55A98A;">Acceder a Kinefy</a></p>
                </div>
            `
        }).catch(err => console.error('Error background mail:', err));

        res.status(201).json(patient);


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al crear paciente' });
    }
};

const getPatients = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({
                error: 'Acceso denegado',
                code: 'FORBIDDEN_ACCESS'
            });
        }

        const patients = await Patient.find({ fisioterapeuta: req.user.id })
            .populate('usuario', 'email')
            .sort({ createdAt: -1 });
        
        // Mapeamos para que el email esté al mismo nivel y el frontend no tenga que hacer malabares
        const patientsWithEmail = patients.map(p => ({
            ...p.toObject(),
            email: p.usuario?.email || ''
        }));

        res.json(patientsWithEmail);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor', code: 'SERVER_ERROR' });
    }
};

const updatePatient = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado', code: 'NOT_FOUND' });
        }

        if (patient.fisioterapeuta.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        const allowedUpdates = [
            'nombre', 'telefono', 'diagnostico', 'notas', 
            'fechaNacimiento', 'profesion', 'actividadFisica', 'ejercicios'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        patient = await Patient.findByIdAndUpdate(
            req.params.id, 
            { $set: updates }, 
            { new: true, runValidators: true }
        );
        
        res.json(patient);
    } catch (err) {
        console.error("DEBUG - Error en updatePatient:", err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Error de validación en los datos', 
                details: err.message,
                code: 'VALIDATION_ERROR' 
            });
        }

        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID inválido o formato de datos incorrecto', code: 'BAD_REQUEST' });
        }
        
        res.status(500).json({ error: 'Error interno del servidor al actualizar', details: err.message, code: 'SERVER_ERROR' });
    }
};

const deletePatient = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado', code: 'NOT_FOUND' });
        }

        if (patient.fisioterapeuta.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        // Borrar el usuario vinculado primero
        if (patient.usuario) {
            await User.findByIdAndDelete(patient.usuario);
        }

        await patient.deleteOne();
        res.json({ msg: 'Paciente y su cuenta de acceso eliminados correctamente' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de paciente inválido', code: 'BAD_REQUEST' });
        }
        console.error(err);
        res.status(500).json({ error: 'Error del servidor', code: 'SERVER_ERROR' });
    }
};

const assignExercises = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        const { ejercicios } = req.body;
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado', code: 'NOT_FOUND' });
        }

        if (patient.fisioterapeuta.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Acceso denegado', code: 'FORBIDDEN_ACCESS' });
        }

        patient.ejercicios = ejercicios;
        await patient.save();
        
        res.json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor', code: 'SERVER_ERROR' });
    }
};

const getMyPatientData = async (req, res) => {
    try {
        const patient = await Patient.findOne({ usuario: req.user.id });
        if (!patient) {
            return res.status(404).json({ error: 'Ficha de paciente no encontrada' });
        }
        res.json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error del servidor');
    }
};

const updateExerciseStatus = async (req, res) => {
    try {
        const patient = await Patient.findOne({ "ejercicios._id": req.params.exerciseId });
        if (!patient) return res.status(404).json({ error: 'Ejercicio no encontrado' });

        const exercise = patient.ejercicios.id(req.params.exerciseId);
        exercise.completado = req.body.completado;
        if (exercise.completado) exercise.fechaCompletado = Date.now();

        await patient.save();
        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error del servidor');
    }
};

const addDocument = async (req, res) => {
    try {
        const { nombre, url } = req.body;
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Autorización flexible: el Fisioterapeuta responsable o el Paciente dueño de la ficha
        if (req.user.role === 'fisioterapeuta') {
            if (patient.fisioterapeuta.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        } else if (req.user.role === 'paciente') {
            if (!patient.usuario || patient.usuario.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        } else {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        patient.informes.push({ nombre, url, fecha: Date.now() });
        await patient.save();
        
        res.json(patient.informes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al subir documento' });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

        // Autorización flexible: el Fisioterapeuta responsable o el Paciente dueño de la ficha
        if (req.user.role === 'fisioterapeuta') {
            if (patient.fisioterapeuta.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        } else if (req.user.role === 'paciente') {
            if (!patient.usuario || patient.usuario.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        } else {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        patient.informes = patient.informes.filter(doc => doc._id.toString() !== req.params.documentId);
        await patient.save();
        
        res.json(patient.informes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar documento' });
    }
};

module.exports = {
    createPatient,
    getPatients,
    updatePatient,
    deletePatient,
    assignExercises,
    getMyPatientData,
    updateExerciseStatus,
    addDocument,
    deleteDocument
};
