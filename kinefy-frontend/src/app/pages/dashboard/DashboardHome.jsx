import React from 'react';
import { KneeIcon, SketchUserIcon, BlobIcon } from '../../components/dashboard/DashboardIcons';

const DashboardHome = () => {
    const patients = [
        { name: 'Carlos M.', initials: 'CM', progress: 75, color: '#E8F5F1' },
        { name: 'Sofia R.',  initials: 'SR', progress: 60, color: '#FDF2F2' },
        { name: 'Javier L.', initials: 'JL', progress: 85, color: '#EBF4FF' },
        { name: 'Ana S.',    initials: 'AS', progress: 90, color: '#F3E8FF' },
    ];

    const points = [40, 35, 45, 30, 50, 42, 55]; 
    const svgW = 280, svgH = 100;
    const pathData = points.map((p, i) => {
        const x = i * (svgW / (points.length - 1));
        const y = svgH - p;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <section className="home">
            <header className="home-header">
                <h1 className="home-header__title">Buenos días, Natalia.</h1>
                <p className="home-header__subtitle">Tienes 3 sesiones hoy.</p>
            </header>

            <section className="dashboard-grid">
                <section className="grid-col">
                    <h3 className="grid-col__title">Próxima Cita</h3>
                    <article className="dashboard-card dashboard-card--appointment">
                        <h2 className="card-title-big">Marta G.</h2>
                        <span className="card-label">Paciente en rehabilitación activa</span>

                        <header className="meta-row">
                            <span className="meta-label">Motivo de consulta</span>
                        </header>
                        
                        <article className="appointment-reason" style={{ marginBottom: '1rem' }}>
                            <KneeIcon size={24} />
                            <span>Post-operatorio Rodilla</span>
                        </article>

                        <header className="meta-row">
                            <span className="meta-label">Hora programada</span>
                        </header>
                        <time className="appointment-time" dateTime="2026-04-09T10:30">10:30 AM</time>

                        <footer className="appointment-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="btn-ghost">Perfil Clínico</button>
                            <button className="btn-primary">Iniciar Sesión</button>
                        </footer>
                    </article>
                </section>

                {/* ── Columna 2: Pacientes Recientes ── */}
                <section className="grid-col">
                    <h3 className="grid-col__title">Pacientes Recientes</h3>
                    <article className="dashboard-card">
                        <section className="patient-list">
                            {patients.map((p, i) => (
                                <article key={i} className="patient-item">
                                    <figure className="patient-avatar">
                                        <BlobIcon color={p.color} className="avatar-blob" />
                                        <span className="patient-initials">{p.initials}</span>
                                    </figure>
                                    
                                    <section className="patient-info">
                                        <header className="patient-info__header">
                                            <span className="patient-info__name">{p.name}</span>
                                            <span className="patient-info__pct">{p.progress}%</span>
                                        </header>
                                        <div className="progress-bar--mini">
                                            <div 
                                                className="progress-bar__fill" 
                                                style={{ '--progress': `${p.progress}%` }} 
                                            />
                                        </div>
                                    </section>
                                </article>
                            ))}
                        </section>
                    </article>
                </section>

                {/* ── Columna 3: Evolución Clínica ── */}
                <section className="grid-col">
                    <h3 className="grid-col__title">Evolución Clínica</h3>
                    <article className="dashboard-card">
                        <p className="activity-widget__subtitle">Tendencia de recuperación acumulada</p>

                        <figure className="evolution-viz" style={{ margin: '0.5rem 0 1rem 0' }}>
                           <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                               <path 
                                    d={pathData} 
                                    className="evolution-viz__path"
                                    fill="none" 
                                    stroke="#98D2C1" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <circle className="evolution-viz__point" cx={svgW} cy={svgH - points[points.length-1]} r="4" fill="#1A2E35" />
                           </svg>
                        </figure>

                        <ul className="activity-list">
                            {[
                                { label: 'Sesiones completadas', value: '85' },
                                { label: 'Media de cumplimiento', value: '92%' },
                                { label: 'Próximo hito', value: '14 Abr' },
                                { label: 'Estado activo', value: 'Hoy', today: true },
                            ].map((item, i) => (
                                <li key={i} className={`activity-list__item ${item.today ? 'activity-list__item--today' : ''}`}>
                                    <span className="activity-list__label">{item.label}</span>
                                    <span className="activity-list__value">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>
            </section>
        </section>
    );
};

export default DashboardHome;
