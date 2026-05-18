import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { 
    BlobIcon, 
    PlusIcon, 
    TrashIcon, 
    ChevronIcon, 
    WarningIcon, 
    AppointmentsIcon,
    SearchIcon 
} from '../../components/dashboard/DashboardIcons';

const Appointments = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const toLocalDateString = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const now = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
    const [appointments, setAppointments] = useState([]);
    const [monthDays, setMonthDays] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [allPatients, setAllPatients] = useState([]);
    const [newApptData, setNewApptData] = useState({
        pacienteId: '',
        fecha: toLocalDateString(new Date()),
        hora: '10:00',
        tipo: 'Seguimiento'
    });

    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState([]);
    const [recurringEndDate, setRecurringEndDate] = useState('');
    const [showPatientList, setShowPatientList] = useState(false);
    const [activeStatusMenu, setActiveStatusMenu] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const DAYS_OF_WEEK = [
        { label: 'L', value: 1 }, { label: 'M', value: 2 }, { label: 'X', value: 3 },
        { label: 'J', value: 4 }, { label: 'V', value: 5 }, { label: 'S', value: 6 }, { label: 'D', value: 0 }
    ];

    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({
                name: date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
                number: i,
                fullDate: toLocalDateString(date),
                isToday: i === now.getDate() && month === now.getMonth() && year === now.getFullYear()
            });
        }
        setMonthDays(days);

        // Auto-scroll centrado al día actual
        setTimeout(() => {
            if (scrollRef.current) {
                if (month === now.getMonth() && year === now.getFullYear()) {
                    const todayIndex = days.findIndex(d => d.isToday);
                    if (todayIndex !== -1) {
                        const dayWidth = 75; // min-width en CSS
                        const gap = 16;      // gap en CSS (1rem)
                        const containerWidth = scrollRef.current.clientWidth;
                        const scrollAmount = (todayIndex * (dayWidth + gap)) - (containerWidth / 2) + (dayWidth / 2) + gap;
                        scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                    }
                } else {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
            }
        }, 300);
    }, [currentDate]);

    const scrollCalendar = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Sincroniza la agenda con la base de datos
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/appointments');
            const patientsRes = await api.get('/patients');
            setAllPatients(patientsRes.data);

            if (res.data && res.data.length > 0) {
                const adapted = res.data.map(a => ({
                    id: a._id,
                    patient: a.paciente?.nombre || 'Paciente desconocido',
                    time: a.hora,
                    date: toLocalDateString(a.fecha),
                    type: a.tipo,
                    status: a.estado,
                    patientId: a.paciente?._id
                }));
                setAppointments(adapted);
            }
        } catch (err) {
            console.error("Error sincronizando agenda");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const normalizeText = (text) => 
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredAppointments = searchTerm.trim() 
        ? appointments.filter(appt => normalizeText(appt.patient).includes(normalizeText(searchTerm)))
        : appointments.filter(appt => appt.date === selectedDate);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
        setSelectedDate(toLocalDateString(newDate));
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            if (isRecurring && recurringDays.length > 0 && recurringEndDate) {
                const start = new Date(newApptData.fecha + 'T00:00:00');
                const end = new Date(recurringEndDate + 'T00:00:00');
                const dates = [];
                let current = new Date(start);

                while (current <= end) {
                    if (recurringDays.includes(current.getDay())) {
                        dates.push(toLocalDateString(current));
                    }
                    current.setDate(current.getDate() + 1);
                }

                const appointments = dates.map(date => ({
                    paciente: newApptData.pacienteId,
                    fecha: date,
                    hora: newApptData.hora,
                    tipo: newApptData.tipo
                }));

                await api.post('/appointments/bulk', { appointments });
            } else {
                await api.post('/appointments', {
                    paciente: newApptData.pacienteId,
                    fecha: newApptData.fecha,
                    hora: newApptData.hora,
                    tipo: newApptData.tipo
                });
            }
            setShowModal(false);
            fetchAppointments();
        } catch (err) {
            alert("Error al crear la cita");
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { estado: newStatus });
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
            setActiveStatusMenu(null);
        } catch (err) {
            alert("Error al actualizar estado");
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/appointments/${showDeleteConfirm}`);
            setAppointments(appointments.filter(a => a.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
        } catch (err) {
            alert("Error al eliminar la cita");
        }
    };

    const toggleRecurringDay = (day) => {
        if (recurringDays.includes(day)) {
            setRecurringDays(recurringDays.filter(d => d !== day));
        } else {
            setRecurringDays([...recurringDays, day]);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'completada': return { bg: '#E8F5F1', color: '#55A98A', label: 'FINALIZADA' };
            case 'confirmada': return { bg: '#E0F2FE', color: '#0369A1', label: 'CONFIRMADA ✓' };
            case 'en-curso': return { bg: '#EBF4FF', color: '#4A90E2', label: 'EN CURSO' };
            case 'cancelada': return { bg: '#F5F5F5', color: '#999', label: 'CANCELADA' };
            default: return { bg: '#FDF2F2', color: '#E57373', label: 'PENDIENTE' };
        }
    };

    const currentMonthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <main className="agenda-container animate-in">
            <header className="agenda-header">
                <nav className="agenda-month-nav">
                    <button onClick={() => changeMonth(-1)} className="btn-nav-month" title="Mes anterior">
                        <ChevronIcon size={22} direction="left" />
                    </button>

                    <hgroup className="agenda-month-nav__title">
                        <h1>{currentMonthName}</h1>
                        <p className="home-header__subtitle">Planificación Clínica</p>
                    </hgroup>

                    <button onClick={() => changeMonth(1)} className="btn-nav-month" title="Mes siguiente">
                        <ChevronIcon size={22} direction="right" />
                    </button>
                    
                    <button 
                        className="btn-today"
                        onClick={() => { 
                            const n = new Date(); 
                            setCurrentDate(new Date(n.getFullYear(), n.getMonth(), 1)); 
                            setSelectedDate(toLocalDateString(n)); 
                            setSearchTerm('');
                        }} 
                    >
                        Hoy
                    </button>
                </nav>
                
                <div className="patients-search" style={{ maxWidth: '300px', margin: '0 1rem' }}>
                    <span className="patients-search__icon"><SearchIcon strokeWidth={2.5} /></span>
                    <input 
                        type="text" 
                        placeholder="Buscar por paciente..." 
                        className="patients-search__input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button className="btn-callout" onClick={() => setShowModal(true)}>
                    <PlusIcon />
                    Nueva Cita
                </button>
            </header>

            {!searchTerm && (
                <section className="agenda-calendar">
                    <button className="calendar-nav-btn calendar-nav-btn--left" onClick={() => scrollCalendar('left')}>
                        <ChevronIcon size={20} direction="left" />
                    </button>
                    <button className="calendar-nav-btn calendar-nav-btn--right" onClick={() => scrollCalendar('right')}>
                        <ChevronIcon size={20} direction="right" />
                    </button>
                    
                    <div className="agenda-calendar__scroll" ref={scrollRef}>
                        {monthDays.map((day) => (
                            <button 
                                key={day.fullDate} 
                                onClick={() => setSelectedDate(day.fullDate)} 
                                className={`agenda-calendar__day ${selectedDate === day.fullDate ? 'agenda-calendar__day--selected' : ''}`}
                            >
                                <span className="agenda-calendar__day-name">{day.name}</span>
                                <span className="agenda-calendar__day-number">{day.number}</span>
                                {day.isToday && <div className="agenda-calendar__today-dot"></div>}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <section className={`agenda-timeline ${searchTerm ? 'agenda-timeline--searching' : ''}`}>
                {searchTerm && (
                    <header className="search-results-header">
                        <h2 className="search-results-title">
                            Resultados para: <span>"{searchTerm}"</span>
                        </h2>
                        <button className="btn-link" onClick={() => setSearchTerm('')}>Limpiar búsqueda</button>
                    </header>
                )}

                {loading ? (
                    <div className="empty-state--centered">
                        <div className="loader"></div>
                        <p>Sincronizando agenda...</p>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="empty-state-card--dashed">
                        <AppointmentsIcon className="empty-state-icon--soft" />
                        <p className="empty-state-title">
                            {searchTerm 
                                ? `No se han encontrado citas para "${searchTerm}"`
                                : `No hay citas para el ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
                            }
                        </p>
                        <p className="empty-state-subtitle">
                            {searchTerm 
                                ? 'Prueba con otro nombre o asegúrate de que el paciente esté registrado.'
                                : 'Pulsa en "Nueva Cita" para empezar a organizar este día.'
                            }
                        </p>
                    </div>
                ) : filteredAppointments.map((appt) => (
                    <article key={appt.id} className="appt-card">
                        <time className="appt-card__time">
                            {appt.time}
                            {searchTerm && <span className="appt-card__date-hint">{new Date(appt.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>}
                        </time>
                        
                        <div className="appt-card__patient">
                            <figure className="patient-avatar--mini">
                                <BlobIcon color={getStatusStyle(appt.status).bg} />
                                <span style={{ color: getStatusStyle(appt.status).color }}>{appt.patient[0]}</span>
                            </figure>
                            <hgroup className="appt-card__info" onClick={() => navigate(`/dashboard/physio/patients/${appt.patientId}`)} style={{ cursor: 'pointer' }}>
                                <h4>{appt.patient}</h4>
                                <span>{appt.type}</span>
                            </hgroup>
                        </div>

                        <div className="appt-card__actions">
                            <div className="relative">
                                <button 
                                    className={`status-pill ${activeStatusMenu === appt.id ? 'status-pill--open' : ''}`}
                                    style={{ background: getStatusStyle(appt.status).bg, color: getStatusStyle(appt.status).color }}
                                    onClick={() => setActiveStatusMenu(activeStatusMenu === appt.id ? null : appt.id)}
                                >
                                    {getStatusStyle(appt.status).label}
                                    <ChevronIcon size={12} />
                                </button>
                                
                                {activeStatusMenu === appt.id && (
                                    <div className="status-dropdown animate-in">
                                        {['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'].map(statusKey => (
                                            <div 
                                                key={statusKey} 
                                                className="status-option"
                                                style={{ color: getStatusStyle(statusKey).color }}
                                                onClick={() => handleUpdateStatus(appt.id, statusKey)}
                                            >
                                                {getStatusStyle(statusKey).label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <button className="btn-icon--delete" onClick={() => setShowDeleteConfirm(appt.id)}>
                                <TrashIcon />
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-container--premium" style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                        <div className="icon-wrapper--danger">
                            <WarningIcon />
                        </div>
                        <h3 className="modal-title--danger">¿Eliminar esta cita?</h3>
                        <p className="modal-text--soft">Esta acción no se puede deshacer. El paciente no verá esta sesión en su historial.</p>
                        <div className="clinical-form-row">
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
                            <button className="btn-primary--danger" onClick={handleDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-container--premium">
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">Programar Sesión</h2>
                            <p className="modal-header__subtitle">Configura el horario y la frecuencia del tratamiento.</p>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            {allPatients.length === 0 ? (
                                <div className="empty-state--centered">
                                    <p>No tienes pacientes registrados.</p>
                                    <button className="btn-primary" onClick={() => { setShowModal(false); navigate('/dashboard/physio/patients/new'); }}>Registrar paciente</button>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateAppointment} className="clinical-form">
                                    <div className="clinical-input-group relative">
                                        <label className="meta-label meta-label--brand">Paciente Clínico</label>
                                        <div className="select-clinical__trigger" onClick={() => setShowPatientList(!showPatientList)}>
                                            <span style={{ color: newApptData.pacienteId ? '#1A2E35' : '#A0AEC0' }}>
                                                {newApptData.pacienteId ? allPatients.find(p => p._id === newApptData.pacienteId)?.nombre : 'Seleccionar paciente...'}
                                            </span>
                                            <ChevronIcon size={20} direction={showPatientList ? 'up' : 'down'} />
                                        </div>
                                        {showPatientList && (
                                            <div className="select-clinical__dropdown animate-in">
                                                {allPatients.map(p => (
                                                    <div 
                                                        key={p._id} 
                                                        className={`select-clinical__option ${newApptData.pacienteId === p._id ? 'select-clinical__option--selected' : ''}`}
                                                        onClick={() => { setNewApptData({...newApptData, pacienteId: p._id}); setShowPatientList(false); }}
                                                    >
                                                        {p.nombre}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="clinical-form-row">
                                        <div className="clinical-input-group">
                                            <label className="meta-label meta-label--brand">Fecha de Inicio</label>
                                            <input type="date" className="input-clinical" required value={newApptData.fecha} onChange={e => setNewApptData({...newApptData, fecha: e.target.value})} />
                                        </div>
                                        <div className="clinical-input-group">
                                            <label className="meta-label meta-label--brand">Hora</label>
                                            <input type="time" className="input-clinical" required value={newApptData.hora} onChange={e => setNewApptData({...newApptData, hora: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="clinical-input-group">
                                        <label className="meta-label meta-label--brand">Motivo de Sesión</label>
                                        <input type="text" className="input-clinical" placeholder="Ej: Rehabilitación de hombro" value={newApptData.tipo} onChange={e => setNewApptData({...newApptData, tipo: e.target.value})} />
                                    </div>

                                    <div className="clinical-card--dashed">
                                        <div className="flex-between">
                                            <div className="flex-center gap-2">
                                                <div className={`icon-indicator ${isRecurring ? 'active' : ''}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                                </div>
                                                <strong className="text-dark">Planificación Automática</strong>
                                            </div>
                                            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="checkbox-brand" />
                                        </div>

                                        {isRecurring && (
                                            <div className="recurring-options animate-in">
                                                <label className="meta-label--mini">Días de tratamiento semanal</label>
                                                <div className="day-picker">
                                                    {DAYS_OF_WEEK.map(day => (
                                                        <button key={day.value} type="button" onClick={() => toggleRecurringDay(day.value)} className={`day-btn ${recurringDays.includes(day.value) ? 'active' : ''}`}>{day.label}</button>
                                                    ))}
                                                </div>
                                                <div className="clinical-input-group mt-3">
                                                    <label className="meta-label--mini">Finalizar ciclo el día</label>
                                                    <input type="date" className="input-clinical" value={recurringEndDate} onChange={e => setRecurringEndDate(e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <footer className="modal-footer--clinical-inside">
                                        <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                        <button type="submit" className="btn-primary--soft" disabled={!newApptData.pacienteId || (isRecurring && (recurringDays.length === 0 || !recurringEndDate))}>
                                            {isRecurring ? `Agendar Sesiones` : 'Confirmar Cita'}
                                        </button>
                                    </footer>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
};

export default Appointments;
