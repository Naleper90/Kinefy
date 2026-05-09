import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import PatientDashboardHome from './PatientDashboardHome';
import PatientExercises from './PatientExercises';
import { HomeIcon, ExercisesIcon, AppointmentsIcon, EvolutionIcon, DocsIcon } from '../../components/dashboard/DashboardIcons';

const PAT_NAV_ITEMS = [
    { to: '/dashboard/patient', icon: HomeIcon, label: 'Inicio', end: true },
    { to: '/dashboard/patient/exercises', icon: ExercisesIcon, label: 'Mis Ejercicios' },
    { to: '/dashboard/patient/appointments', icon: AppointmentsIcon, label: 'Mis Citas' },
    { to: '/dashboard/patient/evolution', icon: EvolutionIcon, label: 'Mi Evolución' },
    { to: '/dashboard/patient/docs', icon: DocsIcon, label: 'Documentos' },
];

const PatientDashboard = () => {
    const user = JSON.parse(localStorage.getItem('kinefy_user')) || { name: 'Paciente' };
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <DashboardLayout 
            navItems={PAT_NAV_ITEMS}
            user={{ name: user.name, initials: initials, color: '#EBF4FF' }}
            searchPlaceholder="Buscar ejercicio..."
        >
            <Routes>
                <Route path="/" element={<PatientDashboardHome />} />
                <Route path="/exercises" element={<PatientExercises />} />
                {/* Estas secciones se pueden ir conectando después */}
                <Route path="/appointments" element={<PatientDashboardHome />} />
                <Route path="/evolution" element={<PatientDashboardHome />} />
                <Route path="/docs" element={<PatientDashboardHome />} />
                
                <Route path="*" element={<Navigate to="/dashboard/patient" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default PatientDashboard;
