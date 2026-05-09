import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KneeIcon, BlobIcon } from '../../components/dashboard/DashboardIcons';
import api from '../../api/api';

const DashboardHome = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [lastHandledId, setLastHandledId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);

    const user = JSON.parse(localStorage.getItem('kinefy_user')) || { name: 'Profesional' };

    const toLocalDateString = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const fetchDashboardData = async () => {
        try {
            const patientsRes = await api.get('/patients');
            const adaptedPatients = patientsRes.data.map(p => ({
                id: p._id,
                name: p.nombre,
                initials: p.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                progress: p.ejercicios?.length > 0 
                    ? Math.round((p.ejercicios.filter(e => e.completado).length / p.ejercicios.length) * 100) 
                    : 0,
                color: ['#E8F5F1', '#FDF2F2', '#EBF4FF', '#F3E8FF'][Math.floor(Math.random() * 4)]
            }));
            setPatients(adaptedPatients);

            const appointmentsRes = await api.get('/appointments');
            if (appointmentsRes.data && appointmentsRes.data.length > 0) {
                const todayStr = toLocalDateString(new Date());
                const sortedAppts = appointmentsRes.data
                    .sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora));
                
                if (lastHandledId) {
                    const handled = sortedAppts.find(a => a._id === lastHandledId);
                    if (handled) {
                        setNextAppointment(handled);
                        return;
                    }
                }

                const inProgress = sortedAppts.find(a => a.estado === 'en-curso');
                if (inProgress) {
                    setNextAppointment(inProgress);
                } else {
                    const nextPending = sortedAppts.find(a => a.estado === 'pendiente');
                    const lastCompletedToday = [...sortedAppts].reverse().find(a => 
                        a.estado === 'completada' && toLocalDateString(a.fecha) === todayStr
                    );
                    setNextAppointment(nextPending || lastCompletedToday || sortedAppts[0]);
                }
            }
        } catch (err) {
            // Silenciar error en UI
        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [lastHandledId]);

    const handleUpdateAppointmentStatus = async (newStatus) => {
        if (!nextAppointment) return;
        try {
            await api.patch(`/appointments/${nextAppointment._id}/status`, { estado: newStatus });
            setLastHandledId(nextAppointment._id);
            showNotification(newStatus === 'en-curso' ? "Sesión iniciada" : "Sesión finalizada correctamente");
            
            if (newStatus === 'completada') {
                setTimeout(() => setLastHandledId(null), 8000);
            }
            
            fetchDashboardData();
        } catch (err) {
            showNotification("No se ha podido actualizar el estado");
        }
    };

    const formatDateHeader = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const averageCompliance = patients.length > 0 
        ? Math.round(patients.reduce((acc, p) => acc + p.progress, 0) / patients.length) 
        : 0;

    const points = patients.length > 0 ? [0, 15, 40, averageCompliance] : [0, 0, 0, 0]; 
    const svgW = 300, svgH = 80;
    const pathData = points.map((p, i) => {
        const x = i * (svgW / (points.length - 1));
        const y = svgH - (p * 0.7);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <section className="home animate-in">
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}
            <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="home-header__title">Buenos días, {user.name.split(' ')[0]}.</h1>
                    <p className="home-header__subtitle">Tienes {patients.length} pacientes activos hoy.</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/dashboard/physio/patients/new')} style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '12px' }}>
                    Nuevo Paciente
                </button>
            </header>

            <section className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <section className="grid-col">

                    <h2 className="grid-col__title">Estado de la Sesión</h2>
                    <article className="dashboard-card dashboard-card--appointment" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        {nextAppointment ? (
                            <>
                                {nextAppointment.estado === 'en-curso' && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#EBF4FF', color: '#3182CE', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '800' }}>
                                        <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#3182CE', borderRadius: '50%' }}></span>
                                        EN CURSO
                                    </div>
                                )}
                                
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#55A98A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>
                                    {formatDateHeader(nextAppointment.fecha)}
                                </span>
                                <h3 className="card-title-big">{nextAppointment.paciente?.nombre}</h3>
                                <span className="card-label" style={{ color: nextAppointment.estado === 'completada' ? '#55A98A' : '#5A6B6D' }}>
                                    {nextAppointment.estado === 'completada' ? '✓ Sesión finalizada con éxito' : 
                                     toLocalDateString(nextAppointment.fecha) === toLocalDateString(new Date()) ? 'Tratamiento para hoy' : 'Próxima sesión programada'}
                                </span>

                                <div style={{ marginTop: '1.5rem', flex: 1 }}>
                                    <span className="meta-label">Motivo de consulta</span>
                                    <div className="appointment-reason" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ background: nextAppointment.estado === 'en-curso' ? '#EBF4FF' : nextAppointment.estado === 'completada' ? '#E8F5F1' : '#F9FBFB', padding: '0.6rem', borderRadius: '10px' }}>
                                            <KneeIcon size={20} color={nextAppointment.estado === 'en-curso' ? '#3182CE' : nextAppointment.estado === 'completada' ? '#55A98A' : '#A0AEC0'} />
                                        </div>
                                        <span style={{ fontWeight: '600', color: '#1A2E35' }}>{nextAppointment.tipo}</span>
                                    </div>

                                    <div style={{ marginTop: '1.5rem' }}>
                                        <span className="meta-label">Hora y Estado</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.3rem' }}>
                                            <time style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1A2E35' }}>{nextAppointment.hora}</time>
                                            <span style={{ 
                                                padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.6rem', fontWeight: '800',
                                                background: nextAppointment.estado === 'pendiente' ? '#FDF2F2' : 
                                                            nextAppointment.estado === 'confirmada' ? '#E0F2FE' :
                                                            nextAppointment.estado === 'en-curso' ? '#EBF4FF' : '#E8F5F1',
                                                color: nextAppointment.estado === 'pendiente' ? '#E57373' : 
                                                       nextAppointment.estado === 'confirmada' ? '#0369A1' :
                                                       nextAppointment.estado === 'en-curso' ? '#3182CE' : '#55A98A',
                                                textTransform: 'uppercase'
                                            }}>
                                                {nextAppointment.estado === 'confirmada' ? 'CONFIRMADA ✓' : nextAppointment.estado}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <footer style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button className="btn-ghost" style={{ flex: 1, borderRadius: '12px' }} onClick={() => navigate(`/dashboard/physio/patients/${nextAppointment.paciente?._id}`)}>Ficha Clínica</button>
                                    
                                    {nextAppointment.estado === 'pendiente' && (
                                        <button className="btn-primary" style={{ flex: 1.5, borderRadius: '12px', background: '#55A98A' }} onClick={() => handleUpdateAppointmentStatus('en-curso')}>Atender ahora</button>
                                    )}
                                    {nextAppointment.estado === 'en-curso' && (
                                        <button className="btn-primary" style={{ flex: 1.5, borderRadius: '12px', background: '#3182CE', borderColor: '#3182CE', boxShadow: '0 8px 20px rgba(49, 130, 206, 0.25)' }} onClick={() => handleUpdateAppointmentStatus('completada')}>Finalizar Sesión</button>
                                    )}
                                    {nextAppointment.estado === 'completada' && (
                                        <button className="btn-primary" style={{ flex: 1.5, borderRadius: '12px', background: '#F0F4F6', color: '#55A98A', borderColor: '#E8F5F1', cursor: 'default' }}>✓ Completada</button>
                                    )}
                                </footer>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                                <div style={{ background: '#F9FBFB', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#55A98A" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', color: '#1A2E35' }}>No hay citas programadas para hoy</h3>
                            </div>
                        )}
                    </article>
                </section>

                <section className="grid-col">
                    <h2 className="grid-col__title">Pacientes Recientes</h2>
                    <article className="dashboard-card" style={{ height: '100%' }}>
                        <div className="patient-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {patients.slice(0, 4).length > 0 ? (
                                patients.slice(0, 4).map((p, i) => (
                                    <article key={i} className="patient-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: i < 3 ? '1px solid #F0F4F4' : 'none', paddingBottom: i < 3 ? '1rem' : '0' }}>
                                        <figure className="patient-avatar" style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                                            <BlobIcon color={p.color} />
                                            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', color: '#55A98A' }}>{p.initials}</span>
                                        </figure>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: '700', color: '#1A2E35', fontSize: '0.9rem' }}>{p.name}</span>
                                                <button 
                                                    className="btn-link" 
                                                    onClick={() => navigate(`/dashboard/physio/patients/${p.id}`)} 
                                                    style={{ fontSize: '0.7rem', color: '#55A98A', fontWeight: '700', background: 'rgba(85, 169, 138, 0.08)', border: 'none', cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '8px' }}
                                                >
                                                    Gestionar Plan
                                                </button>
                                            </div>
                                            <div style={{ height: '4px', background: '#F0F4F4', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${p.progress}%`, height: '100%', background: '#55A98A', transition: 'width 1s ease' }}></div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', padding: '2rem', color: '#5A6B6D', opacity: 0.5 }}>No hay pacientes recientes.</p>
                            )}
                        </div>
                    </article>
                </section>

                <section className="grid-col">
                    <h2 className="grid-col__title">Evolución Clínica</h2>
                    <article className="dashboard-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <p style={{ color: '#5A6B6D', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem' }}>Tendencia de recuperación acumulada</p>
                        
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FBFB 100%)', borderRadius: '16px', padding: '1rem', border: '1px solid #F0F4F4', marginBottom: '1.5rem' }}>
                            <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
                                <path 
                                    d={pathData} 
                                    fill="none" 
                                    stroke="#55A98A" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{ filter: 'drop-shadow(0 4px 6px rgba(85, 169, 138, 0.2))' }}
                                />
                                <circle cx={svgW} cy={svgH - (points[points.length-1] * 0.7)} r="5" fill="#1A2E35" />
                            </svg>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {[
                                { label: 'Pacientes en sistema', value: patients.length },
                                { label: 'Cumplimiento medio', value: `${averageCompliance}%` },
                                { label: 'Próximo hito', value: nextAppointment ? (nextAppointment.estado === 'en-curso' ? 'En tratamiento' : 'Sesión programada') : 'Pendiente' },
                                { label: 'Estado del sistema', value: 'Operativo', status: true }
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid #F9FBFB' : 'none' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#5A6B6D', fontWeight: '500' }}>{item.label}</span>
                                    <span style={{ fontSize: '0.85rem', color: item.status ? '#55A98A' : '#1A2E35', fontWeight: '700' }}>{item.value}</span>
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
