import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { KneeIcon, BlobIcon } from '../../components/dashboard/DashboardIcons';
import api from '../../api/api';

const DashboardHome = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [todayAppointments, setTodayAppointments] = useState([]);
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
                
                // Citas del día de hoy (excluyendo canceladas)
                const todays = sortedAppts.filter(a => toLocalDateString(a.fecha) === todayStr && a.estado !== 'cancelada');
                setTodayAppointments(todays);

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
            // Manejo de error silencioso para no interrumpir el flujo del profesional
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
    return (
        <section className="home animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}
            <header className="home-header">
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Buenos días, {user.name.split(' ')[0]}.</h1>
                    <p className="home-header__subtitle">Tienes {patients.length} pacientes activos hoy.</p>
                </hgroup>
                <button className="btn-callout" onClick={() => navigate('/dashboard/physio/patients/new')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nuevo Paciente
                </button>
            </header>

            <section className="dashboard-grid dashboard-grid--home">
                <section className="grid-col">

                    <h2 className="grid-col__title">Estado de la Sesión</h2>
                    <article className="dashboard-card dashboard-card--appointment">
                        {nextAppointment ? (
                            <>
                                {nextAppointment.estado === 'en-curso' && (
                                    <span className="status-badge status-badge--active status-badge--absolute-top-right">
                                        <span className="pulse-dot"></span>
                                        EN CURSO
                                    </span>
                                )}
                                
                                <span className="meta-label appointment-card__meta-label">
                                    {formatDateHeader(nextAppointment.fecha)}
                                </span>
                                <h3 className="card-title-big">{nextAppointment.paciente?.nombre}</h3>
                                <span className={`appointment-card__status-msg ${nextAppointment.estado === 'completada' ? 'appointment-card__status-msg--completed' : ''}`}>
                                    {nextAppointment.estado === 'completada' ? '✓ Sesión finalizada con éxito' : 
                                     toLocalDateString(nextAppointment.fecha) === toLocalDateString(new Date()) ? 'Tratamiento para hoy' : 'Próxima sesión programada'}
                                </span>

                                <section className="appointment-card__body">
                                    <span className="meta-label">Motivo de consulta</span>
                                    <div className="appointment-card__reason-wrapper">
                                        <figure className={`appointment-card__icon-box ${
                                            nextAppointment.estado === 'en-curso' 
                                                ? 'appointment-card__icon-box--active' 
                                                : nextAppointment.estado === 'completada' 
                                                    ? 'appointment-card__icon-box--completed' 
                                                    : 'appointment-card__icon-box--default'
                                        }`}>
                                            <KneeIcon size={20} color={nextAppointment.estado === 'en-curso' ? '#3182CE' : nextAppointment.estado === 'completada' ? 'var(--color-brand)' : '#A0AEC0'} />
                                        </figure>
                                        <span className="appointment-card__reason-text">{nextAppointment.tipo}</span>
                                    </div>

                                    <section className="appointment-card__time-section">
                                        <span className="meta-label">Hora y Estado</span>
                                        <div className="appointment-card__time-row">
                                            <time className="appointment-card__time">{nextAppointment.hora}</time>
                                            <span className={`status-badge ${
                                                nextAppointment.estado === 'pendiente' ? 'status-badge--pending' : 
                                                nextAppointment.estado === 'confirmada' ? 'status-badge--confirm' :
                                                nextAppointment.estado === 'en-curso' ? 'status-badge--active' : 'status-badge--done'
                                            }`}>
                                                {nextAppointment.estado === 'confirmada' ? 'CONFIRMADA ✓' : nextAppointment.estado}
                                            </span>
                                        </div>
                                    </section>
                                </section>

                                <footer className="appointment-card__footer">
                                    <button className="btn-ghost appointment-card__btn-ghost" onClick={() => navigate(`/dashboard/physio/patients/${nextAppointment.paciente?._id}`)}>Ficha Clínica</button>
                                    
                                    {nextAppointment.estado === 'pendiente' && (
                                        <button className="btn-primary appointment-card__btn-primary" onClick={() => handleUpdateAppointmentStatus('en-curso')}>Atender ahora</button>
                                    )}
                                    {nextAppointment.estado === 'en-curso' && (
                                        <button className="btn-primary appointment-card__btn-primary appointment-card__btn-primary--active" onClick={() => handleUpdateAppointmentStatus('completada')}>Finalizar Sesión</button>
                                    )}
                                    {nextAppointment.estado === 'completada' && (
                                        <button className="btn-primary appointment-card__btn-primary appointment-card__btn-primary--completed">✓ Completada</button>
                                    )}
                                </footer>
                            </>
                        ) : (
                            <section className="home-empty-state">
                                <figure className="home-empty-state__icon">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </figure>
                                <h3 className="home-empty-state__text">No hay citas programadas para hoy</h3>
                            </section>
                        )}
                    </article>
                </section>

                <section className="grid-col">
                    <h2 className="grid-col__title">Pacientes Recientes</h2>
                    <article className="dashboard-card">
                        <nav className="patient-list">
                            {patients.slice(0, 4).length > 0 ? (
                                patients.slice(0, 4).map((p, i) => (
                                    <article key={i} className="patient-item">
                                        <figure className="patient-avatar">
                                            <BlobIcon color={p.color} />
                                            <span className="patient-avatar__initials">{p.initials}</span>
                                        </figure>
                                        <hgroup className="patient-info">
                                            <div className="patient-info__header">
                                                <span className="patient-info__name">{p.name}</span>
                                                <button 
                                                    className="home-patient-item__btn btn-ghost" 
                                                    onClick={() => navigate(`/dashboard/physio/patients/${p.id}`)} 
                                                >
                                                    Gestionar
                                                </button>
                                            </div>
                                            <div className="progress-bar--mini">
                                                <div className="progress-bar__fill" style={{ '--progress': `${p.progress}%` }}></div>
                                            </div>
                                        </hgroup>
                                    </article>
                                ))
                            ) : (
                                <p className="patient-list__empty">No hay pacientes recientes.</p>
                            )}
                        </nav>
                    </article>
                </section>

                <section className="grid-col">
                    <h2 className="grid-col__title">Citas para Hoy</h2>
                    <article className="dashboard-card dashboard-card--flex-column-h100">
                        <p className="card-label card-label--spaced">Horario de sesiones programadas para hoy</p>
                        
                        <nav className="patient-list patient-list--scrollable">
                            {todayAppointments.length > 0 ? (
                                todayAppointments.map((appt, i) => (
                                    <article key={i} className="patient-item patient-item--appointment-today">
                                        <div className="appointment-today__container">
                                            <time className="appointment-today__time">{appt.hora}</time>
                                            
                                            <div className="appointment-today__info">
                                                <span className="appointment-today__patient-name">{appt.paciente?.nombre}</span>
                                                <span className="appointment-today__type">{appt.tipo}</span>
                                            </div>
 
                                            <div className="appointment-today__actions">
                                                <span className={`status-badge ${
                                                    appt.estado === 'pendiente' ? 'status-badge--pending' : 
                                                    appt.estado === 'confirmada' ? 'status-badge--confirm' :
                                                    appt.estado === 'en-curso' ? 'status-badge--active' : 'status-badge--done'
                                                } status-badge--small`}>
                                                    {appt.estado === 'confirmada' ? 'CONFIRMADA' : appt.estado.toUpperCase()}
                                                </span>
                                                
                                                <button 
                                                    className="home-patient-item__btn btn-ghost btn-ghost--small" 
                                                    onClick={() => navigate(`/dashboard/physio/patients/${appt.paciente?._id}`)} 
                                                >
                                                    Ficha
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <section className="appointments-today-empty">
                                    <figure className="appointments-today-empty__icon-container">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </figure>
                                    <h3 className="appointments-today-empty__title">¡Todo al día!</h3>
                                    <p className="appointments-today-empty__subtitle">No tienes citas programadas para hoy.</p>
                                </section>
                            )}
                        </nav>
                    </article>
                </section>
            </section>
        </section>
    );
};

export default DashboardHome;
