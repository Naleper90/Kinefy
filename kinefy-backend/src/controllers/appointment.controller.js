const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { createNotification } = require('./notification.controller');

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
            .populate('paciente', 'nombre usuario')
            .populate('fisioterapeuta', 'name');

        // NOTIFICACIONES
        if (req.user.role === 'paciente') {
            // Notificar al fisio que tiene una nueva solicitud
            await createNotification(
                fisioterapeuta,
                'Nueva solicitud de cita',
                `${populated.paciente.nombre} ha solicitado una cita para el ${new Date(fecha).toLocaleDateString()} a las ${hora}.`,
                'cita_solicitada',
                { appointmentId: appointment._id }
            );
        }
        
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al procesar la cita' });
    }
};

const createBulkAppointments = async (req, res) => {
    try {
        const { appointments } = req.body;
        
        if (!appointments || !Array.isArray(appointments)) {
            return res.status(400).json({ error: 'Formato de citas inválido' });
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
            .populate('paciente', 'nombre email')
            .populate('fisioterapeuta', 'name')
            .sort({ fecha: 1, hora: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las citas' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { estado }, 
            { new: true }
        ).populate('paciente', 'nombre usuario');

        if (appointment && appointment.paciente && appointment.paciente.usuario) {
            let msg = '';
            let tipo = '';
            
            if (estado === 'confirmada') {
                msg = `¡Buenas noticias! Tu cita para el ${new Date(appointment.fecha).toLocaleDateString()} a las ${appointment.hora} ha sido confirmada.`;
                tipo = 'cita_confirmada';
            } else if (estado === 'cancelada') {
                msg = `Lo sentimos, tu cita para el ${new Date(appointment.fecha).toLocaleDateString()} ha sido cancelada o reprogramada.`;
                tipo = 'cita_cancelada';
            }

            if (msg) {
                await createNotification(
                    appointment.paciente.usuario,
                    estado === 'confirmada' ? 'Cita Confirmada' : 'Cita Actualizada',
                    msg,
                    tipo,
                    { appointmentId: appointment._id }
                );
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
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cita eliminada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
};

module.exports = {
    createAppointment,
    createBulkAppointments,
    getAppointments,
    updateAppointmentStatus,
    deleteAppointment
};
