const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

const createAppointment = async (req, res) => {
    try {
        const { paciente, fecha, hora, tipo, notas } = req.body;

        const newAppointment = new Appointment({
            paciente,
            fisioterapeuta: req.user.id,
            fecha,
            hora,
            tipo,
            notas
        });

        const appointment = await newAppointment.save();
        const populated = await Appointment.findById(appointment._id).populate('paciente', 'nombre email');
        
        res.status(201).json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la cita' });
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
        ).populate('paciente', 'nombre email');
        
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
