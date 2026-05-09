import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DashboardHome from './DashboardHome';
import PatientsList from './PatientsList';
import PatientDetail from './PatientDetail';
import NewPatient from './NewPatient';
import Appointments from './Appointments';
import ExerciseLibrary from './ExerciseLibrary';
import { HomeIcon, PatientsIcon, AppointmentsIcon, ExercisesIcon, ReportsIcon } from '../../components/dashboard/DashboardIcons';


const PHYS_NAV_ITEMS = [
    { to: '/dashboard/physio', icon: HomeIcon, label: 'Inicio', end: true },
    { to: '/dashboard/physio/patients', icon: PatientsIcon, label: 'Pacientes' },
    { to: '/dashboard/physio/appointments', icon: AppointmentsIcon, label: 'Citas' },
    { to: '/dashboard/physio/exercises', icon: ExercisesIcon, label: 'Ejercicios' },
    { to: '/dashboard/physio/reports', icon: ReportsIcon, label: 'Informes' },
];

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('kinefy_user')) || { name: 'Profesional' };
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <DashboardLayout 
            navItems={PHYS_NAV_ITEMS}
            user={{ name: user.name, initials: initials, color: '#E8F5F1' }}
            searchPlaceholder="Buscar paciente..."
        >
            <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/patients" element={<PatientsList />} />
                <Route path="/patients/new" element={<NewPatient />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/exercises" element={<ExerciseLibrary />} />
                {/* Fallback interno */}

                <Route path="*" element={<DashboardHome />} />
            </Routes>
        </DashboardLayout>
    );
};

export default Dashboard;
