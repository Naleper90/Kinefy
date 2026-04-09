import React from 'react';

const Dashboard = () => {
    // Mock user role
    const user = { name: 'Natalia Alejo', role: 'fisioterapeuta' };

    return (
        <section className="dashboard">
            <header className="dashboard__header">
                <h1 className="dashboard__title">Dashboard Kinefy</h1>
                <p className="dashboard__welcome">Bienvenida, {user.name} ({user.role})</p>
            </header>
            
            <section className="dashboard__content">
                <article className="dashboard__card">
                    <h2 className="dashboard__subtitle">Resumen del Sprint 1</h2>
                    <ul className="dashboard__list">
                        <li className="dashboard__list-item">Análisis de necesidades completado.</li>
                        <li className="dashboard__list-item">Estructura base del proyecto MERN creada.</li>
                        <li className="dashboard__list-item">Modelos de Usuario y Paciente definidos.</li>
                    </ul>
                </article>
            </section>

            <button 
                className="dashboard__button" 
                onClick={() => window.location.href = '/'}
            >
                Cerrar Sesión
            </button>
        </section>
    );
};

export default Dashboard;
