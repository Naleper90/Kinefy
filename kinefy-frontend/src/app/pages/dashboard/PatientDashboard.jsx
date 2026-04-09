import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import PatientDashboardHome from './PatientDashboardHome';
import { HomeIcon, ExercisesIcon, AppointmentsIcon, EvolutionIcon, DocsIcon } from '../../components/dashboard/DashboardIcons';

const PAT_NAV_ITEMS = [
    { to: '/dashboard/patient', icon: HomeIcon, label: 'Inicio', end: true },
    { to: '/dashboard/patient/exercises', icon: ExercisesIcon, label: 'Mis Ejercicios' },
    { to: '/dashboard/patient/appointments', icon: AppointmentsIcon, label: 'Mis Citas' },
    { to: '/dashboard/patient/evolution', icon: EvolutionIcon, label: 'Mi Evolución' },
    { to: '/dashboard/patient/docs', icon: DocsIcon, label: 'Documentos' },
];

const PatientDashboard = () => {
    return (
        <DashboardLayout 
            navItems={PAT_NAV_ITEMS}
            user={{ name: 'Carlos', initials: 'CM', color: '#EBF4FF' }}
            searchPlaceholder="Buscar ejercicio..."
        >
            <PatientDashboardHome />
        </DashboardLayout>
    );
};

export default PatientDashboard;
