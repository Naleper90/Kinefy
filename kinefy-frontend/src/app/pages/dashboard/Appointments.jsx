import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { BlobIcon } from '../../components/dashboard/DashboardIcons';

const Appointments = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [loading, setLoading] = useState(true);
    
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

        if (month === now.getMonth() && year === now.getFullYear()) {
            setTimeout(() => {
                if (scrollRef.current) {
                    const todayIndex = days.findIndex(d => d.isToday);
                    if (todayIndex !== -1) {
                        const scrollAmount = todayIndex * (75 + 16) - (scrollRef.current.clientWidth / 2) + (75 / 2);
                        scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }, 300);
        } else {
            if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [currentDate]);

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
            // Manejo silencioso de errores en producción
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appt => appt.date === selectedDate);

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
            // Error manejado
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { estado: newStatus });
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
            setActiveStatusMenu(null);
        } catch (err) {
            // Error manejado
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/appointments/${showDeleteConfirm}`);
            setAppointments(appointments.filter(a => a.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
        } catch (err) {
            // Error manejado
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
        <>
            <section className="appointments-page animate-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <header className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => changeMonth(-1)} className="btn-nav-month" style={{ padding: '0.6rem', borderRadius: '12px', background: '#F9FBFB', border: 'none', cursor: 'pointer', color: '#55A98A', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>

                        <div style={{ textAlign: 'center', minWidth: '180px' }}>
                            <h1 className="home-header__title" style={{ textTransform: 'capitalize', fontSize: '1.8rem', margin: 0, lineHeight: 1 }}>{currentMonthName}</h1>
                            <p className="home-header__subtitle" style={{ marginTop: '0.3rem', fontSize: '0.8rem' }}>Planificación Clínica</p>
                        </div>

                        <button onClick={() => changeMonth(1)} className="btn-nav-month" style={{ padding: '0.6rem', borderRadius: '12px', background: '#F9FBFB', border: 'none', cursor: 'pointer', color: '#55A98A', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                        
                        <button 
                            onClick={() => { 
                                const n = new Date(); 
                                setCurrentDate(new Date(n.getFullYear(), n.getMonth(), 1)); 
                                setSelectedDate(toLocalDateString(n)); 
                            }} 
                            style={{ marginLeft: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '100px', background: 'rgba(85, 169, 138, 0.08)', border: 'none', color: '#55A98A', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            Hoy
                        </button>
                    </div>
                    
                    <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nueva Cita
                    </button>
                </header>

                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to right, #F9FBFB 20%, transparent)', zIndex: 2, pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to left, #F9FBFB 20%, transparent)', zIndex: 2, pointerEvents: 'none' }}></div>

                    <div ref={scrollRef} style={{ background: '#FFFFFF', padding: '1.2rem 2.5rem', borderRadius: '20px', display: 'flex', gap: '1rem', overflowX: 'auto', border: '1px solid rgba(0,0,0,0.03)', msOverflowStyle: 'none', scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
                        {monthDays.map((day) => (
                            <button key={day.fullDate} onClick={() => setSelectedDate(day.fullDate)} style={{ minWidth: '75px', padding: '1rem 0.5rem', borderRadius: '14px', border: 'none', background: selectedDate === day.fullDate ? '#55A98A' : '#F9FBFB', color: selectedDate === day.fullDate ? '#FFFFFF' : '#1A2E35', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, transform: selectedDate === day.fullDate ? 'scale(1.08)' : 'scale(1)', boxShadow: selectedDate === day.fullDate ? '0 12px 24px rgba(85, 169, 138, 0.25)' : 'none', position: 'relative' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', opacity: selectedDate === day.fullDate ? 0.9 : 0.5, letterSpacing: '0.5px' }}>{day.name}</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{day.number}</span>
                                {day.isToday && <div style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', borderRadius: '50%', background: selectedDate === day.fullDate ? '#FFFFFF' : '#55A98A' }}></div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', width: '100%' }}>
                    <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'rgba(85, 169, 138, 0.1)', zIndex: 0 }}></div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                            <p style={{ color: '#5A6B6D' }}>Sincronizando agenda...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem', background: '#FFFFFF', borderRadius: '24px', border: '1px dashed rgba(85, 169, 138, 0.2)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(85, 169, 138, 0.3)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <p style={{ color: '#5A6B6D', fontSize: '1.1rem', fontWeight: '500' }}>No hay citas para el {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                            <p style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>Pulsa en "Nueva Cita" para empezar a organizar este día.</p>
                        </div>
                    ) : filteredAppointments.map((appt) => (
                        <article key={appt.id} style={{ background: '#FFFFFF', borderRadius: '18px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', border: '1px solid rgba(0,0,0,0.03)', position: 'relative', zIndex: 1, transition: 'all 0.2s', width: '100%' }}>
                            <div style={{ minWidth: '60px', textAlign: 'center' }}><time style={{ fontWeight: '800', color: '#1A2E35', fontSize: '1rem' }}>{appt.time}</time></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', minWidth: '150px' }}>
                                <figure style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}><BlobIcon color={getStatusStyle(appt.status).bg} /><span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: getStatusStyle(appt.status).color }}>{appt.patient[0]}</span></figure>
                                <div onClick={() => navigate(`/dashboard/physio/patients/${appt.patientId}`)} style={{ cursor: 'pointer' }}><h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1A2E35' }}>{appt.patient}</h4><span style={{ fontSize: '0.8rem', color: '#5A6B6D', opacity: 0.7 }}>{appt.type}</span></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: 'auto', position: 'relative' }}>
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setActiveStatusMenu(activeStatusMenu === appt.id ? null : appt.id)} style={{ padding: '0.4rem 1rem', borderRadius: '100px', background: getStatusStyle(appt.status).bg, color: getStatusStyle(appt.status).color, fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {getStatusStyle(appt.status).label}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                    {activeStatusMenu === appt.id && (
                                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 100, background: '#FFFFFF', borderRadius: '14px', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #F0F4F4', minWidth: '140px' }}>
                                            {['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'].map(statusKey => (
                                                <div key={statusKey} onClick={() => handleUpdateStatus(appt.id, statusKey)} style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: getStatusStyle(statusKey).color, background: 'transparent' }} onMouseOver={e => e.currentTarget.style.background = '#F9FBFB'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                    {getStatusStyle(statusKey).label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="btn-ghost" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', background: '#FDF2F2', color: '#E57373', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDeleteConfirm(appt.id)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FDF2F2', color: '#E57373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                        <h3 style={{ fontSize: '1.4rem', color: '#1A2E35', marginBottom: '0.8rem' }}>¿Eliminar esta cita?</h3>
                        <p style={{ color: '#5A6B6D', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>Esta acción no se puede deshacer. El paciente no verá esta sesión en su historial.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, height: '48px', borderRadius: '12px' }}>Cancelar</button>
                            <button className="btn-primary" onClick={handleDelete} style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#E57373', borderColor: '#E57373', boxShadow: '0 8px 20px rgba(229, 115, 115, 0.25)' }}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '550px', width: '100%', padding: '0', borderRadius: '28px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: 'none', boxShadow: '0 40px 100px rgba(0,0,0,0.25)' }}>
                        <header style={{ padding: '2rem 2.5rem 1.5rem', background: '#F9FBFB', borderBottom: '1px solid #F0F4F4', position: 'relative' }}>
                            <h2 style={{ margin: 0, color: '#1A2E35', fontSize: '1.8rem', fontWeight: '800' }}>Programar Sesión</h2>
                            <p style={{ color: '#5A6B6D', fontSize: '0.85rem', marginTop: '0.4rem' }}>Configura el horario y la frecuencia del tratamiento.</p>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6B6D', fontSize: '1rem', fontWeight: 'bold' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            >
                                ✕
                            </button>
                        </header>
                        <div style={{ padding: '2rem 2.5rem', overflowY: 'auto', flex: 1 }}>
                            {allPatients.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <p style={{ color: '#5A6B6D', marginBottom: '2rem' }}>No tienes pacientes registrados.</p>
                                    <button className="btn-primary" onClick={() => { setShowModal(false); navigate('/dashboard/physio/patients/new'); }}>Registrar paciente</button>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Paciente Clínico</label>
                                        <div onClick={() => setShowPatientList(!showPatientList)} style={{ padding: '0 1.2rem', height: '54px', borderRadius: '14px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#F9FBFB' }}>
                                            <span style={{ color: newApptData.pacienteId ? '#1A2E35' : '#A0AEC0', fontWeight: '600' }}>{newApptData.pacienteId ? allPatients.find(p => p._id === newApptData.pacienteId)?.nombre : 'Seleccionar paciente...'}</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#55A98A" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        {showPatientList && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#FFFFFF', borderRadius: '14px', marginTop: '8px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                                                {allPatients.map(p => (
                                                    <div key={p._id} onClick={() => { setNewApptData({...newApptData, pacienteId: p._id}); setShowPatientList(false); }} style={{ padding: '0.8rem 1rem', borderRadius: '10px', cursor: 'pointer', background: newApptData.pacienteId === p._id ? '#E8F5F1' : 'transparent', color: newApptData.pacienteId === p._id ? '#55A98A' : '#1A2E35', fontWeight: '600' }} onMouseOver={e => e.currentTarget.style.background = '#F9FBFB'} onMouseOut={e => e.currentTarget.style.background = newApptData.pacienteId === p._id ? '#E8F5F1' : 'transparent'}>{p.nombre}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
                                        <div className="form-group">
                                            <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Fecha de Inicio</label>
                                            <input type="date" className="auth__input" required value={newApptData.fecha} onChange={e => setNewApptData({...newApptData, fecha: e.target.value})} style={{ height: '54px', borderRadius: '14px', border: '1.5px solid #E2E8F0', padding: '0 1rem', width: '100%' }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Hora</label>
                                            <input type="time" className="auth__input" required value={newApptData.hora} onChange={e => setNewApptData({...newApptData, hora: e.target.value})} style={{ height: '54px', borderRadius: '14px', border: '1.5px solid #E2E8F0', padding: '0 1rem', width: '100%' }} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Motivo de Sesión</label>
                                        <input type="text" className="auth__input" placeholder="Ej: Rehabilitación de hombro" value={newApptData.tipo} onChange={e => setNewApptData({...newApptData, tipo: e.target.value})} style={{ height: '54px', borderRadius: '14px', border: '1.5px solid #E2E8F0', padding: '0 1rem', width: '100%' }} />
                                    </div>
                                    <div style={{ padding: '1.5rem', background: '#F9FBFB', borderRadius: '20px', border: '1px dashed #E2E8F0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isRecurring ? '1.5rem' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isRecurring ? '#55A98A' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                                </div>
                                                <span style={{ fontWeight: '700', color: '#1A2E35' }}>Planificación Automática</span>
                                            </div>
                                            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#55A98A' }} />
                                        </div>
                                        {isRecurring && (
                                            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                <div>
                                                    <label className="meta-label" style={{ fontSize: '0.7rem', marginBottom: '0.6rem', display: 'block' }}>Días de tratamiento semanal</label>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {DAYS_OF_WEEK.map(day => (
                                                            <button key={day.value} type="button" onClick={() => toggleRecurringDay(day.value)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: recurringDays.includes(day.value) ? '#55A98A' : '#FFFFFF', color: recurringDays.includes(day.value) ? '#FFFFFF' : '#1A2E35', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{day.label}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label className="meta-label" style={{ fontSize: '0.7rem' }}>Finalizar ciclo el día</label>
                                                    <input type="date" className="auth__input" value={recurringEndDate} onChange={e => setRecurringEndDate(e.target.value)} style={{ height: '48px', background: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '0 1rem', width: '100%' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <footer style={{ marginTop: '0.5rem', display: 'flex', gap: '1.2rem' }}>
                                        <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, height: '54px', borderRadius: '14px', fontWeight: '700' }}>Cancelar</button>
                                        <button type="submit" className="btn-primary" disabled={!newApptData.pacienteId || (isRecurring && (recurringDays.length === 0 || !recurringEndDate))} style={{ flex: 2, height: '54px', borderRadius: '14px', fontWeight: '700', boxShadow: '0 10px 25px rgba(85, 169, 138, 0.3)' }}>{isRecurring ? `Agendar Sesiones` : 'Confirmar Cita'}</button>
                                    </footer>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </>
    );
};

export default Appointments;
