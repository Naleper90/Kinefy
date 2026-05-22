import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/pages/auth/Login';
import Register from './app/pages/auth/Register';
import Dashboard from './app/pages/dashboard/Dashboard';
import PatientDashboard from './app/pages/dashboard/PatientDashboard';
import LegalNotice from './app/pages/legal/LegalNotice';
import PrivacyPolicy from './app/pages/legal/PrivacyPolicy';


/**
 * ProtectedRoute - Valida rol del usuario en localStorage
 * Si no hay sesión o el rol no coincide → redirige al login
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const stored = localStorage.getItem('kinefy_user');
    if (!stored) return <Navigate to="/login" replace />;
    
    let user;
    try {
        user = JSON.parse(stored);
        if (!user || !user.role) {
            throw new Error('Usuario inválido');
        }
    } catch (err) {
        console.error('Error parseando el usuario de sesión:', err);
        localStorage.removeItem('kinefy_user');
        return <Navigate to="/login" replace />;
    }
    
    if (requiredRole) {
        if (user.role !== requiredRole) {
            return <Navigate to={user.role === 'paciente' ? '/dashboard/patient' : '/dashboard/physio'} replace />;
        }
        return children;
    }
    
    // Si no se solicita un rol específico, redirigimos al dashboard correspondiente a su rol
    return <Navigate to={user.role === 'paciente' ? '/dashboard/patient' : '/dashboard/physio'} replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard Fisioterapeuta */}
                <Route path="/dashboard/physio/*" element={
                    <ProtectedRoute requiredRole="fisioterapeuta">
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Dashboard Paciente */}
                <Route path="/dashboard/patient/*" element={
                    <ProtectedRoute requiredRole="paciente">
                        <PatientDashboard />
                    </ProtectedRoute>
                } />

                {/* Redirección genérica /dashboard */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        {/* El ProtectedRoute ya redirige a la ruta específica según rol */}
                        <div /> 
                    </ProtectedRoute>
                } />

                {/* Páginas Legales */}
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Fallback */}

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
