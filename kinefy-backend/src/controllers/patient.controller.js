const Patient = require('../models/Patient');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');


const createPatient = async (req, res) => {
    try {
        const { nombre, email, telefono, diagnostico, notas, fechaNacimiento, profesion, actividadFisica } = req.body;

        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        // Generar contraseña temporal
        const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let generatedPassword = '';
        for (let i = 0; i < 8; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Este email ya está registrado en el sistema' });
        }

        user = new User({
            name: nombre,
            email,
            password: generatedPassword,
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
            email: email,
            subject: 'Bienvenido/a a Kinefy - Tu plan de rehabilitación',
            html: `
                <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8F5F1; border-radius: 10px;">
                    <h1 style="color: #55A98A; font-size: 24px;">¡Hola, ${nombre}!</h1>
                    <p>Tu fisioterapeuta ha creado tu ficha clínica en <strong>Kinefy</strong>.</p>
                    <p>A partir de ahora podrás acceder para ver tus ejercicios y registrar tu evolución.</p>
                    <hr style="border: 0; border-top: 1px solid #E8F5F1; margin: 20px 0;" />
                    <p><strong>Tus datos de acceso:</strong></p>
                    <ul>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Contraseña temporal:</strong> <span style="font-size: 1.2rem; font-family: monospace; background-color: #F4FAF8; padding: 2px 6px; border-radius: 4px; color: #55A98A; font-weight: bold;">${generatedPassword}</span></li>
                    </ul>
                    <p>Te recomendamos cambiar la contraseña una vez que accedas.</p>
                    <p>Puedes acceder aquí: <a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="color: #55A98A; font-weight: bold;">Acceder a Kinefy</a></p>
                </div>
            `
        }).catch(err => console.error('Error background mail:', err));

        const patientData = patient.toObject();
        patientData.tempPassword = generatedPassword;
        res.status(201).json(patientData);


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

        let patient = await Patient.findById(req.params.id).populate('usuario', 'email name');

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

        // Si el fisio ha enviado un nuevo email, lo actualizamos en el User y también actualizamos nombre si cambió
        const { email, newPassword } = req.body;
        const user = await User.findById(patient.usuario?._id || patient.usuario);
        if (user) {
            let userNeedsSave = false;
            if (email !== undefined) {
                const trimmedEmail = email.trim().toLowerCase();
                if (user.email !== trimmedEmail) {
                    // Verificamos si ya existe otro usuario con ese email
                    const emailConflict = await User.findOne({ email: trimmedEmail });
                    if (emailConflict) {
                        return res.status(400).json({ error: 'Este email ya está registrado por otro usuario', code: 'EMAIL_ALREADY_EXISTS' });
                    }
                    user.email = trimmedEmail;
                    userNeedsSave = true;
                }
            }
            if (updates.nombre && user.name !== updates.nombre) {
                user.name = updates.nombre;
                userNeedsSave = true;
            }
            if (newPassword && newPassword.trim().length >= 6) {
                user.password = newPassword;
                userNeedsSave = true;
            }

            if (userNeedsSave) {
                await user.save();
                
                // Si la contraseña cambió, enviamos notificación por correo
                if (newPassword && newPassword.trim().length >= 6) {
                    const userEmail = user.email;
                    if (userEmail) {
                        sendEmail({
                            email: userEmail,
                            subject: 'Tu contraseña en Kinefy ha sido actualizada',
                            html: `
                                <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8F5F1; border-radius: 10px;">
                                    <h1 style="color: #55A98A; font-size: 24px;">Hola, ${patient.nombre}</h1>
                                    <p>Tu fisioterapeuta ha actualizado tu contraseña de acceso a <strong>Kinefy</strong>.</p>
                                    <p>Tu nueva contraseña de acceso es:</p>
                                    <div style="background-color: #F4FAF8; border: 2px dashed #55A98A; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                        <span style="font-size: 1.4rem; font-family: monospace; font-weight: bold; letter-spacing: 2px; color: #1A2E35;">${newPassword}</span>
                                    </div>
                                    <p>Si no reconoces este cambio, contacta con tu fisioterapeuta lo antes posible.</p>
                                    <hr style="border: 0; border-top: 1px solid #E8F5F1; margin: 20px 0;" />
                                    <p>Accede a la plataforma aquí: <a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="color: #55A98A; font-weight: bold;">Iniciar Sesión en Kinefy</a></p>
                                </div>
                            `
                        }).then(() => {
                            console.log(`[EMAIL] ✅ Notificación de cambio de contraseña enviada a ${userEmail}`);
                        }).catch(err => {
                            console.error('[EMAIL] ❌ Error al enviar notificación:', err.message);
                        });
                    }
                }
            }
        }

        const updatedPatient = await Patient.findById(patient._id).populate('usuario', 'email name');
        const patientData = updatedPatient.toObject();
        patientData.email = patientData.usuario?.email || '';

        res.json(patientData);
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

const resetPatientPassword = async (req, res) => {
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

        if (!patient.usuario) {
            return res.status(400).json({ error: 'El paciente no tiene un usuario asociado' });
        }

        // Generar contraseña temporal de 8 caracteres
        const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluyendo caracteres ambiguos
        let tempPassword = '';
        for (let i = 0; i < 8; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const user = await User.findById(patient.usuario);
        if (!user) {
            return res.status(404).json({ error: 'Usuario asociado no encontrado' });
        }

        user.password = tempPassword;
        await user.save();

        // Enviar correo de notificación
        console.log(`[MAILTRAP] Intentando enviar correo a: ${user.email} | HOST: ${process.env.EMAIL_HOST} | USER: ${process.env.EMAIL_USER}`);
        try {
            await sendEmail({
                email: user.email,
                subject: 'Nueva contraseña temporal en Kinefy',
                html: `
                    <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8F5F1; border-radius: 10px;">
                        <h1 style="color: #55A98A; font-size: 24px;">Hola, ${patient.nombre}</h1>
                        <p>Tu fisioterapeuta ha restablecido tu contraseña de acceso a <strong>Kinefy</strong>.</p>
                        <p>Por seguridad, se ha generado una contraseña temporal para que puedas volver a entrar:</p>
                        <div style="background-color: #F4FAF8; border: 1px dashed #55A98A; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 20px; font-family: monospace; font-weight: bold; letter-spacing: 2px; color: #1A2E35;">${tempPassword}</span>
                        </div>
                        <p>Te recomendamos cambiar tu contraseña una vez que hayas iniciado sesión.</p>
                        <hr style="border: 0; border-top: 1px solid #E8F5F1; margin: 20px 0;" />
                        <p>Puedes acceder a la plataforma desde el siguiente enlace: <a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="color: #55A98A; font-weight: bold;">Iniciar Sesión en Kinefy</a></p>
                    </div>
                `
            });
            console.log(`[MAILTRAP] ✅ Correo enviado con éxito a: ${user.email}`);
        } catch (mailErr) {
            console.error('[MAILTRAP] ❌ Error al enviar correo:', mailErr.message);
        }

        res.json({
            msg: 'Contraseña restablecida correctamente y enviada al paciente por correo',
            tempPassword
        });

    } catch (err) {
        console.error("DEBUG - Error en resetPatientPassword:", err);
        res.status(500).json({ error: 'Error interno del servidor al restablecer contraseña', details: err.message, code: 'SERVER_ERROR' });
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
    deleteDocument,
    resetPatientPassword
};
