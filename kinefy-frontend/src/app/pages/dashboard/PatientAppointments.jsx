import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import { CustomCalendar, CustomTimePicker } from '../../components/dashboard/DatePickerPremium';
import { EditIcon, CloseIcon, PlusIcon } from '../../components/dashboard/DashboardIcons';

const getNextDays = (count = 14) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
    }
    return days;
};

const PatientAppointments = () => {
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getApptDateTime = (fecha, hora) => {
        if (!fecha) return new Date(0);
        const dateStr = typeof fecha === 'string' ? fecha.split('T')[0] : new Date(fecha).toISOString().split('T')[0];
        return new Date(`${dateStr}T${hora || '00:00'}`);
    };
    const [showApptModal, setShowApptModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [occupiedAppointments, setOccupiedAppointments] = useState([]);
    const [highlightedApptId, setHighlightedApptId] = useState(null);

    const [apptForm, setApptForm] = useState({
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        tipo: 'Sesión de Seguimiento'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingApptId, setEditingApptId] = useState(null);
    const [customDateMode, setCustomDateMode] = useState(false);
    const [customTimeMode, setCustomTimeMode] = useState(false);

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            const sorted = res.data.sort((a, b) => {
                return getApptDateTime(a.fecha, a.hora) - getApptDateTime(b.fecha, b.hora);
            });
            setAppointments(sorted);
        } catch (err) {
            console.error("Error al obtener las citas:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOccupied = async () => {
        try {
            const res = await api.get('/appointments/occupied');
            setOccupiedAppointments(res.data);
        } catch (err) {
            console.error("Error al obtener citas ocupadas:", err);
        }
    };

    useEffect(() => {
        fetchAppointments();
        fetchOccupied();
    }, []);

    // Hook de auto-scroll con retry loop adaptativo de alta precisión
    useEffect(() => {
        if (loading || appointments.length === 0) return;

        const targetApptId = location.state?.appointmentId;
        if (targetApptId) {
            setHighlightedApptId(targetApptId);
            let attempts = 0;
            const maxAttempts = 15;

            const scrollInterval = setInterval(() => {
                const element = document.getElementById(`appointment-card-${targetApptId}`);
                if (element) {
                    clearInterval(scrollInterval);
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Limpiar el highlight visual después de 4 segundos
                    setTimeout(() => setHighlightedApptId(null), 4000);
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        clearInterval(scrollInterval);
                        console.warn(`No se encontró el elemento appointment-card-${targetApptId} en el DOM.`);
                    }
                }
            }, 100);

            return () => clearInterval(scrollInterval);
        }
    }, [loading, appointments, location.state]);

    const isPastTime = (fecha, hora) => {
        if (!fecha || !hora) return false;
        const now = new Date();
        const apptDateTime = new Date(`${fecha}T${hora}`);
        return apptDateTime < now;
    };

    const isSlotOccupied = (fecha, hora) => {
        if (!fecha || !hora) return false;
        return occupiedAppointments.some(appt => {
            if (isEditing && editingApptId === appt._id) return false;
            const apptDateStr = new Date(appt.fecha).toISOString().split('T')[0];
            const targetDateStr = new Date(fecha).toISOString().split('T')[0];
            return apptDateStr === targetDateStr && appt.hora === hora;
        });
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditingApptId(null);
        setApptForm({
            fecha: new Date().toISOString().split('T')[0],
            hora: '10:00',
            tipo: 'Sesión de Seguimiento'
        });
        setCustomDateMode(false);
        setCustomTimeMode(false);
        setShowApptModal(true);
        fetchOccupied();
    };

    const handleOpenEdit = (appt) => {
        const datePart = new Date(appt.fecha).toISOString().split('T')[0];
        setApptForm({
            fecha: datePart,
            hora: appt.hora,
            tipo: appt.tipo
        });
        setIsEditing(true);
        setEditingApptId(appt._id);
        setCustomDateMode(true);
        setCustomTimeMode(true);
        setShowApptModal(true);
        fetchOccupied();
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer y notificará a tu fisioterapeuta.")) {
            try {
                await api.delete(`/appointments/${id}`);
                showNotification("Cita cancelada y eliminada correctamente");
                fetchAppointments();
            } catch (err) {
                showNotification("Error al cancelar la cita");
            }
        }
    };

    const handleRequestAppointment = async (e) => {
        e.preventDefault();

        if (isPastTime(apptForm.fecha, apptForm.hora)) {
            showNotification("No puedes programar una cita para una fecha u hora que ya ha pasado.");
            return;
        }

        if (isSlotOccupied(apptForm.fecha, apptForm.hora)) {
            showNotification("Este horario ya está ocupado. Por favor, elige otro momento.");
            return;
        }

        try {
            if (isEditing) {
                await api.put(`/appointments/${editingApptId}`, apptForm);
                showNotification("Cita modificada correctamente");
            } else {
                await api.post('/appointments', apptForm);
                showNotification("Solicitud de cita enviada correctamente");
            }
            setShowApptModal(false);
            fetchAppointments();
        } catch (err) {
            if (err.response?.data?.code === 'APPOINTMENT_CONFLICT') {
                showNotification("Este horario ya está ocupado. Por favor, elige otro momento.");
            } else if (err.response?.data?.code === 'APPOINTMENT_PAST') {
                showNotification("No puedes programar una cita para una fecha u hora que ya ha pasado.");
            } else {
                showNotification("Error al guardar la cita. Revisa tu conexión.");
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

    const upcoming = appointments.filter(appt => appt.estado !== 'completada' && getApptDateTime(appt.fecha, appt.hora) >= now);
    const past = appointments.filter(appt => appt.estado === 'completada' || getApptDateTime(appt.fecha, appt.hora) < now);

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
                <button className="btn-callout" onClick={handleOpenCreate}>
                    <PlusIcon size={20} />
                    Solicitar Cita
                </button>
            </header>

            <section className="dashboard-grid dashboard-grid--home">
                {/* COLUMNA CITAS ACTIVAS */}
                <section className="grid-col" style={{ gridColumn: 'span 2' }}>
                    <h2 className="grid-col__title">Próximas Sesiones</h2>
                    {upcoming.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {upcoming.map((appt) => {
                                const isHighlighted = highlightedApptId === appt._id;
                                return (
                                    <article 
                                        key={appt._id} 
                                        id={`appointment-card-${appt._id}`}
                                        className="dashboard-card dashboard-card--appointment" 
                                        style={{ 
                                            position: 'relative', 
                                            background: '#FFFFFF', 
                                            border: isHighlighted ? '2.5px solid var(--color-brand)' : '1px solid #EBF0F0',
                                            boxShadow: isHighlighted ? '0 0 25px rgba(85, 169, 138, 0.35)' : 'none',
                                            transform: isHighlighted ? 'scale(1.02)' : 'none',
                                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}
                                    >
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
                                            {/* BOTONES DE EDICIÓN Y CANCELACIÓN PREMIUM ORGÁNICOS */}
                                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                                <button 
                                                    type="button"
                                                    className="patient-action-btn patient-action-btn--view" 
                                                    onClick={() => handleOpenEdit(appt)}
                                                    title="Editar Cita"
                                                >
                                                    <EditIcon size={18} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    className="patient-action-btn patient-action-btn--delete" 
                                                    onClick={() => handleDeleteAppointment(appt._id)}
                                                    title="Cancelar Cita"
                                                >
                                                    <CloseIcon size={18} />
                                                </button>
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
                                );
                            })}
                        </div>
                    ) : (
                        <article className="dashboard-card" style={{ textAlign: 'center', padding: '3rem 2rem', background: '#F9FBFB', border: '1px dashed #D0DCDC' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" style={{ marginBottom: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#4A5568' }}>Tu agenda está libre</h3>
                            <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>No tienes ninguna cita programada para los próximos días.</p>
                            <button className="btn-primary" style={{ width: 'auto', padding: '0.7rem 1.5rem' }} onClick={handleOpenCreate}>Solicitar una Cita</button>
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

            {/* MODAL DE SOLICITUD / EDICIÓN PREMIUM */}
            {showApptModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
                    <div className="modal-container--premium" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">{isEditing ? "Modificar Cita" : "Solicitar Nueva Cita"}</h2>
                            <p className="modal-header__subtitle">{isEditing ? "Ajusta la fecha y hora de tu sesión." : "Propón un horario y tu fisio lo confirmará."}</p>
                            <button className="modal-close" onClick={() => setShowApptModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleRequestAppointment} className="clinical-form">
                                {/* SECCIÓN DE FECHA PREMIUM */}
                                <div className="clinical-input-group" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <label className="meta-label meta-label--brand" style={{ margin: 0 }}>Fecha Preferente</label>
                                        <button 
                                            type="button" 
                                            className="link-btn" 
                                            onClick={() => setCustomDateMode(!customDateMode)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                        >
                                            {customDateMode ? "Ver calendario rápido" : "Elegir otra fecha"}
                                        </button>
                                    </div>
                                    
                                    {customDateMode ? (
                                        <CustomCalendar 
                                            selectedDate={apptForm.fecha} 
                                            onSelectDate={date => setApptForm({...apptForm, fecha: date})} 
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', padding: '0.4rem 0.2rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="no-scrollbar">
                                            {getNextDays().map((d, index) => {
                                                const isoStr = d.toISOString().split('T')[0];
                                                const isSelected = apptForm.fecha === isoStr;
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => setApptForm(prev => ({ ...prev, fecha: isoStr }))}
                                                        style={{
                                                            flex: '0 0 68px',
                                                            height: '84px',
                                                            borderRadius: '16px',
                                                            background: isSelected ? 'var(--color-brand)' : '#F4FAF8',
                                                            color: isSelected ? '#FFFFFF' : '#1A2E35',
                                                            border: isSelected ? 'none' : '1px solid #C2DFD4',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            padding: '0.4rem 0.2rem'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: isSelected ? '#E2F1EC' : '#7A8C8E' }}>
                                                            {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                                                        </span>
                                                        <span style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '0.1rem', lineHeight: '1.2' }}>
                                                            {d.getDate()}
                                                        </span>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: '600', color: isSelected ? '#E2F1EC' : '#7A8C8E', marginTop: '0.1rem' }}>
                                                            {d.toLocaleDateString('es-ES', { month: 'short' })}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* SECCIÓN DE HORA PREMIUM CON EVITACIÓN DE COLISIÓN Y TURNOS PASADOS */}
                                <div className="clinical-input-group" style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <label className="meta-label meta-label--brand" style={{ margin: 0 }}>Hora de la Cita</label>
                                        <button 
                                            type="button" 
                                            className="link-btn" 
                                            onClick={() => setCustomTimeMode(!customTimeMode)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                        >
                                            {customTimeMode ? "Ver turnos rápidos" : "Elegir otra hora"}
                                        </button>
                                    </div>

                                    {customTimeMode ? (
                                        <CustomTimePicker 
                                            selectedTime={apptForm.hora} 
                                            onSelectTime={time => setApptForm({...apptForm, hora: time})} 
                                        />
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                                            {[
                                                '08:00', '09:00', '10:00', '11:00', '12:00',
                                                '13:00', '15:00', '16:00', '17:00', '18:00', 
                                                '19:00', '20:00'
                                            ].map((time, idx) => {
                                                const isSelected = apptForm.hora === time;
                                                const isPast = isPastTime(apptForm.fecha, time);
                                                const isOccupied = isSlotOccupied(apptForm.fecha, time);
                                                const isDisabled = isPast || isOccupied;

                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => setApptForm(prev => ({ ...prev, hora: time }))}
                                                        style={{
                                                            padding: '0.6rem 0.2rem',
                                                            borderRadius: '12px',
                                                            background: isSelected ? 'var(--color-brand)' : isDisabled ? '#F8FAFC' : '#FFFFFF',
                                                            color: isSelected ? '#FFFFFF' : isDisabled ? '#CBD5E1' : '#1A2E35',
                                                            border: isSelected ? 'none' : '1.5px solid #E2E8F0',
                                                            fontWeight: '700',
                                                            fontSize: '0.8rem',
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            textAlign: 'center',
                                                            opacity: isDisabled ? 0.6 : 1,
                                                            position: 'relative'
                                                        }}
                                                        title={isOccupied ? "Horario ocupado" : isPast ? "Horario pasado" : ""}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="clinical-input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="meta-label meta-label--brand">Motivo / Notas</label>
                                    <input 
                                        type="text" 
                                        className="input-clinical" 
                                        placeholder="Ej: Dolor lumbar severo, revisión" 
                                        value={apptForm.tipo} 
                                        onChange={e => setApptForm({...apptForm, tipo: e.target.value})} 
                                        required
                                    />
                                </div>
                                
                                <div className="clinical-card--dashed" style={{ marginTop: '1rem', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#5A6B6D', margin: 0 }}>
                                        * Tu solicitud quedará en estado <strong>Pendiente</strong> hasta que el fisioterapeuta la valide en su agenda.
                                    </p>
                                </div>

                                <footer className="modal-footer--clinical-inside" style={{ marginTop: '1.5rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowApptModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary--soft">
                                        {isEditing ? "Guardar Cambios" : "Enviar Solicitud"}
                                    </button>
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
