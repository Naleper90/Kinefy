import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApptModal, setShowApptModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [apptForm, setApptForm] = useState({
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        tipo: 'Sesión de Seguimiento'
    });

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            // Ordenar por fecha y hora
            const sorted = res.data.sort((a, b) => {
                return new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora);
            });
            setAppointments(sorted);
        } catch (err) {
            // Manejo silencioso
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleRequestAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', apptForm);
            setShowApptModal(false);
            showNotification("Solicitud de cita enviada correctamente");
            fetchAppointments();
        } catch (err) {
            if (err.response?.data?.code === 'APPOINTMENT_CONFLICT') {
                alert("Este horario ya está ocupado. Por favor, elige otro momento.");
            } else {
                alert("Error al solicitar la cita. Revisa tu conexión.");
            }
        }
    };

    const confirmAppointment = async (id) => {
        try {
            await api.patch(`/appointments/${id}/status`, { estado: 'confirmada' });
            showNotification("Cita confirmada correctamente");
            fetchAppointments();
        } catch (err) {
            showNotification("No se pudo confirmar la cita");
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#5A6B6D', fontWeight: '500' }}>Cargando tu agenda médica...</p>
        </div>
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Separar citas futuras (pendiente, confirmada, en-curso) de pasadas o completadas
    const upcoming = appointments.filter(appt => appt.estado !== 'completada' && new Date(appt.fecha + 'T' + appt.hora) >= now);
    const past = appointments.filter(appt => appt.estado === 'completada' || new Date(appt.fecha + 'T' + appt.hora) < now);

    return (
        <section className="home animate-in">
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}

            <header className="home-header" style={{ marginBottom: '2.5rem' }}>
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Mis Citas Médicas</h1>
                    <p className="home-header__subtitle">Gestiona tus próximas sesiones de rehabilitación y consulta tu historial clínico.</p>
                </hgroup>
                <button className="btn-callout" onClick={() => setShowApptModal(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Solicitar Cita
                </button>
            </header>

            <section className="dashboard-grid dashboard-grid--home">
                {/* COLUMNA CITAS ACTIVAS */}
                <section className="grid-col" style={{ gridColumn: 'span 2' }}>
                    <h2 className="grid-col__title">Próximas Sesiones</h2>
                    {upcoming.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {upcoming.map((appt) => (
                                <article key={appt._id} className="dashboard-card dashboard-card--appointment" style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #EBF0F0' }}>
                                    {appt.estado === 'en-curso' && (
                                        <span className="status-badge status-badge--active" style={{ position: 'absolute', top: '1.2rem', right: '1.2rem' }}>
                                            <span className="pulse-dot"></span>
                                            EN CURSO
                                        </span>
                                    )}
                                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span className="meta-label" style={{ color: 'var(--color-brand)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                                                {new Date(appt.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <h3 className="card-title-big" style={{ margin: '0.3rem 0 0.5rem' }}>{appt.fisioterapeuta?.name || 'Tu Fisioterapeuta'}</h3>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-soft)', display: 'block' }}>Fisioterapeuta Colegiado</span>
                                        </div>
                                    </header>

                                    <section style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <article className="date-badge" style={{ background: '#F4FAF8', margin: 0, padding: '0.5rem 1rem', borderRadius: '14px' }}>
                                                <section className="date-badge__accent" style={{ background: appt.estado === 'pendiente' ? '#E2E8F0' : '#55A98A', minWidth: '40px', padding: '4px' }}>
                                                    <span className="date-badge__day-short" style={{ fontSize: '0.55rem', color: appt.estado === 'pendiente' ? '#4A5568' : '#FFF' }}>
                                                        {new Date(appt.fecha).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                                                    </span>
                                                    <span className="date-badge__day-num" style={{ fontSize: '1.1rem', color: appt.estado === 'pendiente' ? '#4A5568' : '#FFF' }}>{new Date(appt.fecha).getDate()}</span>
                                                </section>
                                                <section className="date-badge__info" style={{ marginLeft: '0.8rem' }}>
                                                    <span className="date-badge__month" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                                                        {new Date(appt.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <time style={{ fontSize: '0.8rem', color: '#5A6B6D', fontWeight: '600' }}>Hora: {appt.hora}</time>
                                                </section>
                                            </article>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <span className="meta-label">Motivo de Consulta</span>
                                            <span style={{ fontWeight: '600', color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>{appt.tipo}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className={`status-badge ${
                                                appt.estado === 'pendiente' ? 'status-badge--pending' : 
                                                appt.estado === 'confirmada' ? 'status-badge--confirm' :
                                                appt.estado === 'en-curso' ? 'status-badge--active' : 'status-badge--done'
                                            }`}>
                                                {appt.estado === 'confirmada' ? 'CONFIRMADA ✓' : appt.estado}
                                            </span>
                                            {appt.estado === 'pendiente' && (
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ height: '36px', padding: '0 1.2rem', fontSize: '0.85rem' }}
                                                    onClick={() => confirmAppointment(appt._id)}
                                                >
                                                    Confirmar
                                                </button>
                                            )}
                                        </div>
                                    </section>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <article className="dashboard-card" style={{ textAlign: 'center', padding: '3rem 2rem', background: '#F9FBFB', border: '1px dashed #D0DCDC' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={{ marginBottom: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#4A5568' }}>Tu agenda está libre</h3>
                            <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>No tienes ninguna cita programada para los próximos días.</p>
                            <button className="btn-primary" style={{ width: 'auto', padding: '0.7rem 1.5rem' }} onClick={() => setShowApptModal(true)}>Solicitar una Cita</button>
                        </article>
                    )}
                </section>

                {/* COLUMNA HISTORIAL */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Historial de Visitas</h2>
                    <article className="dashboard-card" style={{ padding: '1.2rem' }}>
                        {past.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {past.map((appt, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: '#F9FBFB', borderRadius: '12px', border: '1px solid #F0F4F4' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55A98A' }}>
                                            ✓
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.tipo}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: '600' }}>
                                                {new Date(appt.fecha).toLocaleDateString()} a las {appt.hora}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#55A98A', fontWeight: '700', textTransform: 'uppercase' }}>Sesión</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#A0AEC0', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Aún no has completado ninguna sesión.</p>
                        )}
                    </article>
                </section>
            </section>

            {/* MODAL DE SOLICITUD */}
            {showApptModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
                    <div className="modal-container--premium" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">Solicitar Nueva Cita</h2>
                            <p className="modal-header__subtitle">Propón un horario y tu fisio lo confirmará.</p>
                            <button className="modal-close" onClick={() => setShowApptModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleRequestAppointment} className="clinical-form">
                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Fecha Preferente</label>
                                    <input 
                                        type="date" 
                                        className="input-clinical" 
                                        required 
                                        value={apptForm.fecha} 
                                        onChange={e => setApptForm({...apptForm, fecha: e.target.value})} 
                                    />
                                </div>
                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Hora</label>
                                    <input 
                                        type="time" 
                                        className="input-clinical" 
                                        required 
                                        value={apptForm.hora} 
                                        onChange={e => setApptForm({...apptForm, hora: e.target.value})} 
                                    />
                                </div>
                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Motivo / Notas</label>
                                    <input 
                                        type="text" 
                                        className="input-clinical" 
                                        placeholder="Ej: Dolor lumbar severo, revisión" 
                                        value={apptForm.tipo} 
                                        onChange={e => setApptForm({...apptForm, tipo: e.target.value})} 
                                    />
                                </div>
                                
                                <div className="clinical-card--dashed" style={{ marginTop: '1rem', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#5A6B6D', margin: 0 }}>
                                        * Tu solicitud quedará en estado <strong>Pendiente</strong> hasta que el fisioterapeuta la valide en su agenda.
                                    </p>
                                </div>

                                <footer className="modal-footer--clinical-inside">
                                    <button type="button" className="btn-ghost" onClick={() => setShowApptModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary--soft">Enviar Solicitud</button>
                                </footer>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default PatientAppointments;
