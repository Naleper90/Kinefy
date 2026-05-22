const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { createNotification } = require('./notification.controller');
const sendEmail = require('../utils/mailer');

const createAppointment = async (req, res) => {
    try {
        let { paciente, fisioterapeuta, fecha, hora, tipo, notas } = req.body;

        // Si el que crea la cita es un paciente, buscamos su perfil para saber su fisio
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (!patientProfile) {
                return res.status(404).json({ error: 'Perfil clínico no encontrado' });
            }
            paciente = patientProfile._id;
            fisioterapeuta = patientProfile.fisioterapeuta;
        } else {
            // Si es un fisio, él es el fisioterapeuta de la cita
            fisioterapeuta = req.user.id;
        }

        // COMPROBACIÓN DE FECHA/HORA EN EL PASADO
        const datePart = typeof fecha === 'string' ? fecha.split('T')[0] : new Date(fecha).toISOString().split('T')[0];
        const appointmentDateTime = new Date(`${datePart}T${hora}`);
        const now = new Date();
        
        if (appointmentDateTime < now) {
            return res.status(400).json({ 
                error: 'No puedes solicitar una cita para una fecha u hora que ya ha pasado.',
                code: 'APPOINTMENT_PAST'
            });
        }

        // COMPROBACIÓN DE COLISIONES (CONFLICTOS DE HORARIO)
        const conflict = await Appointment.findOne({ 
            fisioterapeuta, 
            fecha: new Date(fecha), 
            hora,
            estado: { $ne: 'cancelada' } 
        });

        if (conflict) {
            return res.status(400).json({ 
                error: 'Este horario ya está ocupado en la agenda. Por favor, selecciona otro.',
                code: 'APPOINTMENT_CONFLICT'
            });
        }

        const newAppointment = new Appointment({
            paciente,
            fisioterapeuta,
            fecha,
            hora,
            tipo,
            notas,
            estado: req.user.role === 'paciente' ? 'pendiente' : 'confirmada'
        });

        const appointment = await newAppointment.save();
        const populated = await Appointment.findById(appointment._id)
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'email name' }
            })
            .populate('fisioterapeuta', 'name email');

        // NOTIFICACIONES
        if (req.user.role === 'paciente') {
            // Notificar al fisio que tiene una nueva solicitud
            await createNotification(
                fisioterapeuta,
                'Nueva solicitud de cita',
                `${populated.paciente.nombre} ha solicitado una cita para el ${new Date(fecha).toLocaleDateString()} a las ${hora}.`,
                'cita_solicitada',
                { appointmentId: appointment._id, fecha: appointment.fecha }
            );

            // Enviar Correo al Fisioterapeuta
            if (populated.fisioterapeuta && populated.fisioterapeuta.email) {
                sendEmail({
                    email: populated.fisioterapeuta.email,
                    subject: `Nueva solicitud de cita - ${populated.paciente.nombre}`,
                    html: `
                        <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                            <h2 style="color: #55A98A; margin-top: 0;">¡Hola, ${populated.fisioterapeuta.name}!</h2>
                            <p>Has recibido una nueva solicitud de cita en <strong>Kinefy</strong>.</p>
                            <div style="background-color: #F7FAFC; border-left: 4px solid #55A98A; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0;"><strong>Paciente:</strong> ${populated.paciente.nombre}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Fecha propuesta:</strong> ${new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Hora preferente:</strong> ${hora}</p>
                                <p style="margin: 0;"><strong>Tipo:</strong> ${tipo || 'Sesión de rehabilitación'}</p>
                            </div>
                            <p>Inicia sesión en tu agenda para confirmar o proponer un nuevo horario al paciente.</p>
                            <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #55A98A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Acceder a mi agenda</a></p>
                        </div>
                    `
                }).catch(err => console.error('Error enviando correo al fisio:', err));
            }
        }
        
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar la cita' });
    }
};

const createBulkAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'fisioterapeuta') {
            return res.status(403).json({ error: 'Acceso denegado: Solo los fisioterapeutas pueden crear citas en lote' });
        }

        const { appointments } = req.body;
        
        if (!appointments || !Array.isArray(appointments)) {
            return res.status(400).json({ error: 'Formato de citas inválido' });
        }

        // Validar que todos los pacientes existan y pertenezcan a este fisioterapeuta
        const patientIds = [...new Set(appointments.map(appt => appt.paciente))];
        const patients = await Patient.find({ _id: { $in: patientIds } });
        
        const allBelong = patients.every(patient => patient.fisioterapeuta.toString() === req.user.id);
        if (patients.length !== patientIds.length || !allBelong) {
            return res.status(403).json({ error: 'No autorizado: Uno o más pacientes no están asignados a tu agenda' });
        }

        const appointmentsData = appointments.map(appt => ({
            paciente: appt.paciente,
            fisioterapeuta: req.user.id,
            fecha: appt.fecha,
            hora: appt.hora,
            tipo: appt.tipo,
            notas: appt.notas
        }));

        const created = await Appointment.insertMany(appointmentsData);
        res.status(201).json(created);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear citas múltiples' });
    }
};

const getAppointments = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'fisioterapeuta') {
            query = { fisioterapeuta: req.user.id };
        } else {
            // Si es paciente, primero buscamos su ficha clínica para tener su ID de paciente real
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (!patientProfile) {
                return res.json([]); // Si no tiene ficha, no tiene citas
            }
            query = { paciente: patientProfile._id };
        }

        const appointments = await Appointment.find(query)
            .populate({
                path: 'paciente',
                select: 'nombre usuario telefono',
                populate: {
                    path: 'usuario',
                    select: 'email'
                }
            })
            .populate('fisioterapeuta', 'name')
            .sort({ fecha: 1, hora: 1 });

        const processedAppointments = appointments.map(appt => {
            const apptObj = appt.toObject();
            if (apptObj.paciente) {
                apptObj.paciente.email = apptObj.paciente.usuario?.email || '';
            }
            return apptObj;
        });

        res.json(processedAppointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las citas' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        
        const appt = await Appointment.findById(req.params.id);
        if (!appt) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        let patientProfileId = null;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (patientProfile) {
                patientProfileId = patientProfile._id.toString();
            }
        }

        const isAssignedPhysio = appt.fisioterapeuta.toString() === req.user.id;
        const isOwnAppointment = patientProfileId && appt.paciente.toString() === patientProfileId;

        if (!isAssignedPhysio && !isOwnAppointment) {
            return res.status(403).json({ error: 'Acceso denegado: No estás autorizado para modificar esta cita' });
        }

        appt.estado = estado;
        await appt.save();

        const appointment = await Appointment.findById(appt._id)
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'email name' }
            }).populate('fisioterapeuta', 'name email');

        if (appointment && appointment.paciente && appointment.paciente.usuario) {
            let msg = '';
            let tipo = '';
            let subject = '';
            let emailHtml = '';

            const fechaFormateada = new Date(appointment.fecha).toLocaleDateString('es-ES', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
            
            if (estado === 'confirmada') {
                msg = `¡Buenas noticias! Tu cita para el ${new Date(appointment.fecha).toLocaleDateString()} a las ${appointment.hora} ha sido confirmada.`;
                tipo = 'cita_confirmada';
                subject = 'Confirmación de cita - Kinefy';
                emailHtml = `
                    <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                        <h2 style="color: #55A98A; margin-top: 0;">¡Hola, ${appointment.paciente.nombre}!</h2>
                        <p>Tu fisioterapeuta ha <strong>confirmado</strong> tu cita en <strong>Kinefy</strong>.</p>
                        <div style="background-color: #F0FDF4; border-left: 4px solid #55A98A; padding: 16px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0 0 8px 0; color: #166534;"><strong>✓ Cita Confirmada</strong></p>
                            <p style="margin: 0 0 8px 0; color: #166534;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                            <p style="margin: 0 0 8px 0; color: #166534;"><strong>Hora:</strong> ${appointment.hora}</p>
                            <p style="margin: 0; color: #166534;"><strong>Especialista:</strong> ${appointment.fisioterapeuta.name}</p>
                        </div>
                        <p>Recuerda acudir puntual a tu sesión de rehabilitación. ¡Te deseamos una pronta recuperación!</p>
                        <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #55A98A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Ver mis citas</a></p>
                    </div>
                `;
            } else if (estado === 'cancelada') {
                msg = `Lo sentimos, tu cita para el ${new Date(appointment.fecha).toLocaleDateString()} ha sido cancelada o reprogramada.`;
                tipo = 'cita_cancelada';
                subject = 'Cita cancelada o reprogramada - Kinefy';
                emailHtml = `
                    <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                        <h2 style="color: #EF4444; margin-top: 0;">Hola, ${appointment.paciente.nombre}</h2>
                        <p>Te notificamos que tu cita agendada en <strong>Kinefy</strong> ha sido <strong>cancelada o reprogramada</strong>.</p>
                        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0 0 8px 0; color: #991B1B;"><strong>✕ Cita Cancelada</strong></p>
                            <p style="margin: 0 0 8px 0;"><strong>Fecha original:</strong> ${fechaFormateada}</p>
                            <p style="margin: 0;"><strong>Hora original:</strong> ${appointment.hora}</p>
                        </div>
                        <p>Por favor, accede a tu área personal o ponte en contacto con tu fisioterapeuta para solicitar un nuevo horario.</p>
                        <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #4A5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Solicitar Cita de Nuevo</a></p>
                    </div>
                `;
            }

            if (msg) {
                await createNotification(
                    appointment.paciente.usuario._id,
                    estado === 'confirmada' ? 'Cita Confirmada' : 'Cita Actualizada',
                    msg,
                    tipo,
                    { appointmentId: appointment._id, fecha: appointment.fecha }
                );

                if (appointment.paciente.usuario.email && emailHtml) {
                    sendEmail({
                        email: appointment.paciente.usuario.email,
                        subject: subject,
                        html: emailHtml
                    }).catch(err => console.error('Error enviando correo al paciente:', err));
                }
            }
        }
        
        res.json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id)
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'email name' }
            })
            .populate('fisioterapeuta', 'name email');

        if (!appt) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        let patientProfileId = null;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (patientProfile) {
                patientProfileId = patientProfile._id.toString();
            }
        }

        const isAssignedPhysio = appt.fisioterapeuta.toString() === req.user.id;
        const isOwnAppointment = patientProfileId && appt.paciente.toString() === patientProfileId;

        if (!isAssignedPhysio && !isOwnAppointment) {
            return res.status(403).json({ error: 'Acceso denegado: No estás autorizado para eliminar esta cita' });
        }

        await Appointment.findByIdAndDelete(req.params.id);

        const fechaFormateada = new Date(appt.fecha).toLocaleDateString('es-ES', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });

        // Enviar Correo al otro participante avisando del borrado/cancelación
        if (req.user.role === 'paciente') {
            // Notificar al Fisioterapeuta por correo
            if (appt.fisioterapeuta && appt.fisioterapeuta.email) {
                sendEmail({
                    email: appt.fisioterapeuta.email,
                    subject: `Cita cancelada por el paciente - ${appt.paciente.nombre}`,
                    html: `
                        <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                            <h2 style="color: #EF4444; margin-top: 0;">Hola, ${appt.fisioterapeuta.name}</h2>
                            <p>Te notificamos que el paciente <strong>ha cancelado</strong> su cita.</p>
                            <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0; color: #991B1B;"><strong>✕ Cita Cancelada por Paciente</strong></p>
                                <p style="margin: 0 0 8px 0;"><strong>Paciente:</strong> ${appt.paciente.nombre}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                                <p style="margin: 0;"><strong>Hora:</strong> ${appt.hora}</p>
                            </div>
                            <p>Este hueco ha quedado libre en tu agenda.</p>
                            <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #4A5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Acceder a mi agenda</a></p>
                        </div>
                    `
                }).catch(err => console.error('Error enviando cancelación al fisio:', err));
            }
        } else {
            // Notificar al Paciente por correo
            if (appt.paciente && appt.paciente.usuario && appt.paciente.usuario.email) {
                sendEmail({
                    email: appt.paciente.usuario.email,
                    subject: 'Tu cita ha sido cancelada - Kinefy',
                    html: `
                        <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                            <h2 style="color: #EF4444; margin-top: 0;">Hola, ${appt.paciente.nombre}</h2>
                            <p>Te informamos de que tu fisioterapeuta <strong>ha cancelado</strong> tu próxima cita.</p>
                            <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0; color: #991B1B;"><strong>✕ Cita Cancelada por Especialista</strong></p>
                                <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Hora:</strong> ${appt.hora}</p>
                                <p style="margin: 0;"><strong>Especialista:</strong> ${appt.fisioterapeuta.name}</p>
                            </div>
                            <p>Por favor, accede a tu área personal para programar una nueva sesión.</p>
                            <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Solicitar Nueva Cita</a></p>
                        </div>
                    `
                }).catch(err => console.error('Error enviando cancelación al paciente:', err));
            }
        }

        res.json({ message: 'Cita eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
};

const getOccupiedAppointments = async (req, res) => {
    try {
        let fisioterapeutaId;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (!patientProfile) {
                return res.status(404).json({ error: 'Perfil clínico no encontrado' });
            }
            fisioterapeutaId = patientProfile.fisioterapeuta;
        } else {
            fisioterapeutaId = req.user.id;
        }

        // Obtener todas las citas no canceladas para ese fisioterapeuta
        const appointments = await Appointment.find({
            fisioterapeuta: fisioterapeutaId,
            estado: { $ne: 'cancelada' }
        }).select('fecha hora');

        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener citas ocupadas' });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { fecha, hora, tipo, notas, estado } = req.body;
        
        let appt = await Appointment.findById(req.params.id);
        if (!appt) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        let patientProfileId = null;
        if (req.user.role === 'paciente') {
            const patientProfile = await Patient.findOne({ usuario: req.user.id });
            if (patientProfile) {
                patientProfileId = patientProfile._id.toString();
            }
        }

        const isAssignedPhysio = appt.fisioterapeuta.toString() === req.user.id;
        const isOwnAppointment = patientProfileId && appt.paciente.toString() === patientProfileId;

        if (!isAssignedPhysio && !isOwnAppointment) {
            return res.status(403).json({ error: 'Acceso denegado: No estás autorizado para actualizar esta cita' });
        }

        // Si se cambia la fecha u hora, verificar que no esté en el pasado y no haya colisiones
        if (fecha || hora) {
            const finalFecha = fecha || appt.fecha;
            const finalHora = hora || appt.hora;

            const datePart = typeof finalFecha === 'string' ? finalFecha.split('T')[0] : new Date(finalFecha).toISOString().split('T')[0];
            const appointmentDateTime = new Date(`${datePart}T${finalHora}`);
            const now = new Date();
            
            if (appointmentDateTime < now) {
                return res.status(400).json({ 
                    error: 'No puedes programar una cita para una fecha u hora que ya ha pasado.',
                    code: 'APPOINTMENT_PAST'
                });
            }

            // Conflicto de colisión (excluyendo la cita actual)
            const conflict = await Appointment.findOne({ 
                fisioterapeuta: appt.fisioterapeuta, 
                fecha: new Date(finalFecha), 
                hora: finalHora,
                _id: { $ne: appt._id },
                estado: { $ne: 'cancelada' } 
            });

            if (conflict) {
                return res.status(400).json({ 
                    error: 'Este horario ya está ocupado en la agenda. Por favor, selecciona otro.',
                    code: 'APPOINTMENT_CONFLICT'
                });
            }
        }

        if (fecha) appt.fecha = fecha;
        if (hora) appt.hora = hora;
        if (tipo) appt.tipo = tipo;
        if (notas !== undefined) appt.notas = notas;
        if (estado) appt.estado = estado;

        await appt.save();
        
        const populated = await Appointment.findById(appt._id)
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'email name' }
            })
            .populate('fisioterapeuta', 'name email');

        const fechaFormateada = new Date(appt.fecha).toLocaleDateString('es-ES', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });

        // Si es modificada por un paciente, notificar al fisioterapeuta
        if (req.user.role === 'paciente') {
            await createNotification(
                appt.fisioterapeuta,
                'Solicitud de cita modificada',
                `${populated.paciente.nombre} ha reprogramado su cita para el ${new Date(appt.fecha).toLocaleDateString()} a las ${appt.hora}.`,
                'nueva_cita',
                { appointmentId: appt._id, fecha: appt.fecha }
            );

            // Enviar Correo al Fisioterapeuta
            if (populated.fisioterapeuta && populated.fisioterapeuta.email) {
                sendEmail({
                    email: populated.fisioterapeuta.email,
                    subject: `Solicitud de cita reprogramada - ${populated.paciente.nombre}`,
                    html: `
                        <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                            <h2 style="color: #3182CE; margin-top: 0;">Hola, ${populated.fisioterapeuta.name}</h2>
                            <p>El paciente ha <strong>reprogramado o modificado</strong> su solicitud de cita.</p>
                            <div style="background-color: #EBF8FF; border-left: 4px solid #3182CE; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0;"><strong>Paciente:</strong> ${populated.paciente.nombre}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Nueva Fecha:</strong> ${fechaFormateada}</p>
                                <p style="margin: 0 0 8px 0;"><strong>Nueva Hora:</strong> ${appt.hora}</p>
                                <p style="margin: 0;"><strong>Tipo:</strong> ${appt.tipo}</p>
                            </div>
                            <p>Revisa tu agenda para confirmar o modificar esta nueva propuesta.</p>
                            <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #3182CE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Acceder a mi agenda</a></p>
                        </div>
                    `
                }).catch(err => console.error('Error enviando correo al fisio reprogramado:', err));
            }
        } else {
            // Si es modificada por un fisio, notificar al paciente si el estado cambió o si cambió fecha/hora
            if (populated.paciente && populated.paciente.usuario) {
                await createNotification(
                    populated.paciente.usuario._id,
                    'Cita modificada por el Fisioterapeuta',
                    `Tu cita ha sido actualizada para el ${new Date(appt.fecha).toLocaleDateString()} a las ${appt.hora}.`,
                    'cita_confirmada',
                    { appointmentId: appt._id, fecha: appt.fecha }
                );

                // Enviar Correo al Paciente
                if (populated.paciente.usuario.email) {
                    sendEmail({
                        email: populated.paciente.usuario.email,
                        subject: 'Tu cita ha sido reprogramada - Kinefy',
                        html: `
                            <div style="font-family: sans-serif; color: #1A2E35; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px;">
                                <h2 style="color: #D69E2E; margin-top: 0;">Hola, ${populated.paciente.nombre}</h2>
                                <p>Tu fisioterapeuta ha <strong>modificado / reprogramado</strong> tu cita en <strong>Kinefy</strong>.</p>
                                <div style="background-color: #FEFCBF; border-left: 4px solid #D69E2E; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0 0 8px 0; color: #744210;"><strong>⚠ Cita Reprogramada</strong></p>
                                    <p style="margin: 0 0 8px 0;"><strong>Nueva Fecha:</strong> ${fechaFormateada}</p>
                                    <p style="margin: 0 0 8px 0;"><strong>Nueva Hora:</strong> ${appt.hora}</p>
                                    <p style="margin: 0;"><strong>Especialista:</strong> ${populated.fisioterapeuta.name}</p>
                                </div>
                                <p>Por favor, accede a tu área personal para revisar tu agenda.</p>
                                <p style="margin-bottom: 0;"><a href="${process.env.FRONTEND_URL || 'https://kinefy.vercel.app'}" style="display: inline-block; background-color: #D69E2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Ver mis citas</a></p>
                            </div>
                        `
                    }).catch(err => console.error('Error enviando correo de modificación al paciente:', err));
                }
            }
        }

        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar la cita' });
    }
};

module.exports = {
    createAppointment,
    createBulkAppointments,
    getAppointments,
    updateAppointmentStatus,
    deleteAppointment,
    getOccupiedAppointments,
    updateAppointment: updateAppointment
};
