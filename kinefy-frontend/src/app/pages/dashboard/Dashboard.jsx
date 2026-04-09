import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DashboardHome from './DashboardHome';
import { HomeIcon, PatientsIcon, AppointmentsIcon, ExercisesIcon, ReportsIcon } from '../../components/dashboard/DashboardIcons';

const PHYS_NAV_ITEMS = [
    { to: '/dashboard/physio', icon: HomeIcon, label: 'Inicio', end: true },
    { to: '/dashboard/patients', icon: PatientsIcon, label: 'Pacientes' },
    { to: '/dashboard/appointments', icon: AppointmentsIcon, label: 'Citas' },
    { to: '/dashboard/exercises', icon: ExercisesIcon, label: 'Ejercicios' },
    { to: '/dashboard/reports', icon: ReportsIcon, label: 'Informes' },
];

const Dashboard = () => {
    return (
        <DashboardLayout 
            navItems={PHYS_NAV_ITEMS}
            user={{ name: 'Natalia', initials: 'NA', color: '#E8F5F1' }}
            searchPlaceholder="Buscar paciente..."
        >
            <DashboardHome />
        </DashboardLayout>
    );
};

export default Dashboard;
