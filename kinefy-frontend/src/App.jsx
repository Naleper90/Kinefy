import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/pages/auth/Login';
import Register from './app/pages/auth/Register';
import Dashboard from './app/pages/dashboard/Dashboard';
import PatientDashboard from './app/pages/dashboard/PatientDashboard';

/**
 * ProtectedRoute - Valida rol del usuario en localStorage
 * Si no hay sesión o el rol no coincide → redirige al login
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const stored = localStorage.getItem('kinefy_user');
    if (!stored) return <Navigate to="/login" replace />;
    
    const user = JSON.parse(stored);
    if (requiredRole && user.role !== requiredRole) {
        // Redirige al dashboard correcto según rol
        return <Navigate to={user.role === 'patient' ? '/dashboard/patient' : '/dashboard/physio'} replace />;
    }
    return children;
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
                <Route path="/dashboard/physio" element={
                    <ProtectedRoute requiredRole="physio">
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Dashboard Paciente */}
                <Route path="/dashboard/patient" element={
                    <ProtectedRoute requiredRole="patient">
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

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
