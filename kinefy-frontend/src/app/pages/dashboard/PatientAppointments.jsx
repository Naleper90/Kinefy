import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import api from '../../api/api';
import { CustomCalendar, CustomTimePicker } from '../../components/dashboard/DatePickerPremium';
import { EditIcon, CloseIcon, PlusIcon, ChevronIcon } from '../../components/dashboard/DashboardIcons';

const toLocalDateString = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
        const match = date.match(/^\d{4}-\d{2}-\d{2}/);
        if (match) return match[0];
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

const getApptDateTime = (fecha, hora) => {
    if (!fecha) return new Date(0);
    const dateStr = toLocalDateString(fecha);
    return new Date(`${dateStr}T${hora || '00:00'}`);
};

const PatientAppointments = () => {
    const location = useLocation();
    const dateScrollRef = useRef(null);
    const [appointments, setAppointments] = useState([]);
    
    const scrollDateCarousel = (direction) => {
        if (dateScrollRef.current) {
            const scrollAmount = direction === 'left' ? -250 : 250;
            dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    const [loading, setLoading] = useState(true);

    const [showApptModal, setShowApptModal] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [occupiedAppointments, setOccupiedAppointments] = useState([]);
    const [highlightedApptId, setHighlightedApptId] = useState(null);

    const [apptForm, setApptForm] = useState({
        fecha: toLocalDateString(new Date()),
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

    const fetchAppointments = useCallback(async () => {
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
    }, []);

    const fetchOccupied = useCallback(async () => {
        try {
            const res = await api.get('/appointments/occupied');
            setOccupiedAppointments(res.data);
        } catch (err) {
            console.error("Error al obtener citas ocupadas:", err);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchOccupied();
    }, [fetchAppointments, fetchOccupied]);

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
            const apptDateStr = toLocalDateString(appt.fecha);
            const targetDateStr = toLocalDateString(fecha);
            return apptDateStr === targetDateStr && appt.hora === hora;
        });
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditingApptId(null);
        setApptForm({
            fecha: toLocalDateString(new Date()),
            hora: '10:00',
            tipo: 'Sesión de Seguimiento'
        });
        setCustomDateMode(false);
        setCustomTimeMode(false);
        setShowApptModal(true);
        fetchOccupied();
    };

    const handleOpenEdit = (appt) => {
        const datePart = toLocalDateString(appt.fecha);
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
        <div className="appointments-loading">
            <div className="loader loader--centered-margin"></div>
            <p className="appointments-loading__text">Cargando tu agenda médica...</p>
        </div>
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = appointments.filter(appt => appt.estado !== 'completada' && getApptDateTime(appt.fecha, appt.hora) >= now);
    const past = appointments.filter(appt => appt.estado === 'completada' || getApptDateTime(appt.fecha, appt.hora) < now);

    return (
        <section className="home animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}

            <header className="home-header appointments-header">
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
                <section className="grid-col evolution-card-grid-span2">
                    <h2 className="grid-col__title">Próximas Sesiones</h2>
                    {upcoming.length > 0 ? (
                        <div className="appointments-list">
                            {upcoming.map((appt) => {
                                const isHighlighted = highlightedApptId === appt._id;
                                return (
                                    <article 
                                        key={appt._id} 
                                        id={`appointment-card-${appt._id}`}
                                        className={`dashboard-card dashboard-card--appointment ${isHighlighted ? 'dashboard-card--appointment--highlighted' : ''}`}
                                    >
                                        {appt.estado === 'en-curso' && (
                                            <span className="status-badge status-badge--active status-badge--top-right">
                                                <span className="pulse-dot"></span>
                                                EN CURSO
                                            </span>
                                        )}
                                        <header className="appointment-card__header">
                                            <div>
                                                <span className="appointment-card__date-label">
                                                    {new Date(appt.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </span>
                                                <h3 className="card-title-big appointment-card__title">{appt.fisioterapeuta?.name || 'Tu Fisioterapeuta'}</h3>
                                                <span className="appointment-card__subtitle">Fisioterapeuta Colegiado</span>
                                            </div>
                                            {/* BOTONES DE EDICIÓN Y CANCELACIÓN PREMIUM ORGÁNICOS */}
                                            <div className="appointment-card__actions">
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

                                        <section className="appointment-card__details">
                                            <div className="appointment-card__badge-wrapper">
                                                <article className="date-badge date-badge--refactored">
                                                    <section 
                                                        className="date-badge__accent" 
                                                        style={{ 
                                                            background: appt.estado === 'pendiente' ? '#E2E8F0' : '#55A98A'
                                                        }}
                                                    >
                                                        <span 
                                                            className="date-badge__day-short"
                                                            style={{ 
                                                                color: appt.estado === 'pendiente' ? '#4A5568' : '#FFF' 
                                                            }}
                                                        >
                                                            {new Date(appt.fecha).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                                                        </span>
                                                        <span 
                                                            className="date-badge__day-num"
                                                            style={{ 
                                                                color: appt.estado === 'pendiente' ? '#4A5568' : '#FFF' 
                                                            }}
                                                        >
                                                            {new Date(appt.fecha).getDate()}
                                                        </span>
                                                    </section>
                                                    <section className="date-badge__info">
                                                        <span className="date-badge__month">
                                                            {new Date(appt.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <time className="date-badge__time">Hora: {appt.hora}</time>
                                                    </section>
                                                </article>
                                            </div>

                                            <div className="appointment-card__reason-col">
                                                <span className="meta-label">Motivo de Consulta</span>
                                                <span className="appointment-card__reason-val">{appt.tipo}</span>
                                            </div>

                                            <div className="appointment-card__status-col">
                                                <span className={`status-badge ${
                                                    appt.estado === 'pendiente' ? 'status-badge--pending' : 
                                                    appt.estado === 'confirmada' ? 'status-badge--confirm' :
                                                    appt.estado === 'en-curso' ? 'status-badge--active' : 'status-badge--done'
                                                }`}>
                                                    {appt.estado === 'confirmada' ? 'CONFIRMADA ✓' : appt.estado}
                                                </span>
                                                {appt.estado === 'pendiente' && (
                                                    <button 
                                                        className="btn-primary appointment-card__confirm-btn" 
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
                        <article className="dashboard-card docs-empty-card">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" className="docs-empty-card__icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <h3 className="docs-empty-card__title">Tu agenda está libre</h3>
                            <p className="docs-empty-card__text">No tienes ninguna cita programada para los próximos días.</p>
                            <button className="btn-primary docs-empty-card__btn" onClick={handleOpenCreate}>Solicitar una Cita</button>
                        </article>
                    )}
                </section>

                {/* COLUMNA HISTORIAL */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Historial de Visitas</h2>
                    <article className="dashboard-card past-appointments-card">
                        {past.length > 0 ? (
                            <div className="past-appointments-list">
                                {past.map((appt, i) => (
                                    <div key={i} className="past-appointment-item">
                                        <div className="past-appointment-item__icon">
                                            ✓
                                        </div>
                                        <div className="past-appointment-item__meta">
                                            <p className="past-appointment-item__title">{appt.tipo}</p>
                                            <span className="past-appointment-item__time">
                                                {new Date(appt.fecha).toLocaleDateString()} a las {appt.hora}
                                            </span>
                                        </div>
                                        <span className="past-appointment-item__badge">Sesión</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="past-appointments-empty">Aún no has completado ninguna sesión.</p>
                        )}
                    </article>
                </section>
            </section>

            {/* MODAL DE SOLICITUD / EDICIÓN PREMIUM */}
            {showApptModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
                    <div className="modal-container--premium modal-container--premium--sm" onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">{isEditing ? "Modificar Cita" : "Solicitar Nueva Cita"}</h2>
                            <p className="modal-header__subtitle">{isEditing ? "Ajusta la fecha y hora de tu sesión." : "Propón un horario y tu fisio lo confirmará."}</p>
                            <button className="modal-close" onClick={() => setShowApptModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleRequestAppointment} className="clinical-form">
                                {/* SECCIÓN DE FECHA PREMIUM */}
                                <div className="clinical-input-group clinical-input-group--mb">
                                    <div className="appointment-modal__flex-header">
                                        <label className="meta-label meta-label--brand meta-label--no-margin">Fecha Preferente</label>
                                        <button 
                                            type="button" 
                                            className="link-btn appointment-modal__toggle-btn" 
                                            onClick={() => setCustomDateMode(!customDateMode)}
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
                                        <div className="date-carousel-wrapper">
                                            <button 
                                                type="button" 
                                                className="calendar-nav-btn calendar-nav-btn--left" 
                                                onClick={() => scrollDateCarousel('left')}
                                            >
                                                <ChevronIcon size={20} direction="left" />
                                            </button>
                                            <button 
                                                type="button" 
                                                className="calendar-nav-btn calendar-nav-btn--right" 
                                                onClick={() => scrollDateCarousel('right')}
                                            >
                                                <ChevronIcon size={20} direction="right" />
                                            </button>
                                            <div className="date-badge-scroll no-scrollbar" ref={dateScrollRef}>
                                                {getNextDays().map((d, index) => {
                                                    const isoStr = toLocalDateString(d);
                                                    const isSelected = apptForm.fecha === isoStr;
                                                    return (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => setApptForm(prev => ({ ...prev, fecha: isoStr }))}
                                                            className="date-btn-select"
                                                            style={{
                                                                background: isSelected ? 'var(--color-brand)' : '#F4FAF8',
                                                                color: isSelected ? '#FFFFFF' : '#1A2E35',
                                                                border: isSelected ? 'none' : '1px solid #C2DFD4'
                                                            }}
                                                        >
                                                            <span 
                                                                className="date-btn-select__weekday"
                                                                style={{ 
                                                                    color: isSelected ? '#E2F1EC' : '#7A8C8E' 
                                                                }}
                                                            >
                                                                {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                                                            </span>
                                                            <span className="date-btn-select__day">
                                                                {d.getDate()}
                                                            </span>
                                                            <span 
                                                                className="date-btn-select__month"
                                                                style={{ 
                                                                    color: isSelected ? '#E2F1EC' : '#7A8C8E' 
                                                                }}
                                                            >
                                                                {d.toLocaleDateString('es-ES', { month: 'short' })}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECCIÓN DE HORA PREMIUM CON EVITACIÓN DE COLISIÓN Y TURNOS PASADOS */}
                                <div className="clinical-input-group clinical-input-group--mb">
                                    <div className="appointment-modal__flex-header">
                                        <label className="meta-label meta-label--brand meta-label--no-margin">Hora de la Cita</label>
                                        <button 
                                            type="button" 
                                            className="link-btn appointment-modal__toggle-btn" 
                                            onClick={() => setCustomTimeMode(!customTimeMode)}
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
                                        <div className="time-slots-grid">
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
                                                        className="time-slot-btn"
                                                        style={{
                                                            background: isSelected ? 'var(--color-brand)' : isDisabled ? '#F8FAFC' : '#FFFFFF',
                                                            color: isSelected ? '#FFFFFF' : isDisabled ? '#CBD5E1' : '#1A2E35',
                                                            border: isSelected ? 'none' : '1.5px solid #E2E8F0',
                                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                            opacity: isDisabled ? 0.6 : 1
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

                                <div className="clinical-input-group clinical-input-group--mb">
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
                                
                                <div className="clinical-card--dashed clinical-card--dashed-spacing">
                                    <p className="clinical-card__disclaimer-text">
                                        * Tu solicitud quedará en estado <strong>Pendiente</strong> hasta que el fisioterapeuta la valide en su agenda.
                                    </p>
                                </div>

                                <footer className="modal-footer--clinical-inside">
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
