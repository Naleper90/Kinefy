import React from 'react';

const Dashboard = () => {
    // Mock user role
    const user = { name: 'Natalia Alejo', role: 'fisioterapeuta' };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Kinefy</h1>
            <p>Bienvenida, {user.name} ({user.role})</p>
            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <h3>Resumen del Sprint 1</h3>
                <ul>
                    <li>Análisis de necesidades completado.</li>
                    <li>Estructura base del proyecto MERN creada.</li>
                    <li>Modelos de Usuario y Paciente definidos.</li>
                </ul>
            </div>
            <button onClick={() => window.location.href = '/'}>Cerrar Sesión</button>
        </div>
    );
};

export default Dashboard;
