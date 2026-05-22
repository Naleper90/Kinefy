import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ExercisesIcon } from '../../components/dashboard/DashboardIcons';
import api from '../../api/api';
import { CustomCalendar, CustomTimePicker } from '../../components/dashboard/DatePickerPremium';

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

const PatientDashboardHome = () => {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    const [nextAppointment, setNextAppointment] = useState(null);
    
    const user = JSON.parse(localStorage.getItem('kinefy_user')) || { name: 'Paciente' };

    const [painLevel, setPainLevel]   = useState(null);
    const [observation, setObservation] = useState('');
    const [submitted, setSubmitted]   = useState(false);
    const [painHistory, setPainHistory] = useState([]);
    const [previewEx, setPreviewEx] = useState(null);
    const [showApptModal, setShowApptModal] = useState(false);
    const [apptForm, setApptForm] = useState({
        fecha: toLocalDateString(new Date()),
        hora: '10:00',
        tipo: 'Sesión de Seguimiento'
    });
    const [customDateMode, setCustomDateMode] = useState(false);
    const [customTimeMode, setCustomTimeMode] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [chartWidth, setChartWidth] = useState(240);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.getBoundingClientRect().width || 240);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [loading]);

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const handleRequestAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', apptForm);
            setShowApptModal(false);
            showNotification("Solicitud de cita enviada correctamente");
            // Recargar datos para ver la cita pendiente
            const resApp = await api.get('/appointments');
            const now = new Date();
            const future = resApp.data
                .filter(a => new Date(a.fecha) >= now)
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
            setNextAppointment(future);
        } catch (err) {
            if (err.response?.data?.code === 'APPOINTMENT_CONFLICT') {
                showNotification("Este horario ya está ocupado. Por favor, elige otro momento.");
            } else {
                showNotification("Error al solicitar la cita. Revisa tu conexión.");
            }
        }
    };

    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Datos básicos y ejercicios
                const res = await api.get('/patients/me');
                setPatientData(res.data);
                
                if (res.data.ejercicios) {
                    setExercises(res.data.ejercicios.map(ex => ({
                        id: ex._id,
                        name: ex.nombre,
                        series: ex.series,
                        done: ex.completado,
                        mediaUrl: ex.mediaUrl
                    })));

                }

                // 2. Historial de dolor real
                const resHistory = await api.get(`/patients/evolution/${res.data._id}`);
                if (resHistory.data && resHistory.data.length > 0) {
                    setPainHistory(resHistory.data.map(e => e.nivelDolor));
                    
                    // Verificar si ya registró hoy
                    const todayStr = toLocalDateString(new Date());
                    const todayEntry = resHistory.data.find(e => toLocalDateString(e.fecha) === todayStr);
                    if (todayEntry) {
                        setSubmitted(true);
                        setPainLevel(todayEntry.nivelDolor);
                        setObservation(todayEntry.observaciones || '');
                    }
                } else {
                    setPainHistory([0, 0, 0, 0, 0]); // Base vacía si no hay datos
                }

                // 3. Próxima cita real
                const resApp = await api.get('/appointments');
                const now = new Date();
                const future = resApp.data
                    .filter(a => new Date(a.fecha) >= now)
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
                setNextAppointment(future);

            } catch (err) {
                // Error manejado
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleExercise = async (id) => {
        const ex = exercises.find(e => e.id === id);
        try {
            await api.put(`/patients/exercises/${id}`, { completado: !ex.done });
            setExercises(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e));
        } catch (err) {
            // Error manejado
        }
    };

    const handleSubmitDiary = async (e) => { 
        e.preventDefault(); 
        if (!patientData || !painLevel) return;
        try {
            await api.post('/patients/evolution', {
                pacienteId: patientData._id,
                nivelDolor: painLevel,
                observaciones: observation
            });
            setSubmitted(true);
            setPainHistory([...painHistory, painLevel]);
        } catch (err) {
            // Error manejado
        }
    };

    const confirmAppointment = async (id) => {
        try {
            await api.patch(`/appointments/${id}/status`, { estado: 'confirmada' });
            // Actualizamos el estado local
            setNextAppointment(prev => ({ ...prev, estado: 'confirmada' }));
        } catch (err) {
            // Error manejado
        }
    };

    if (loading) return (
        <div className="patient-home-loading">
            <div className="loader loader--centered-margin"></div>
            <p className="patient-home-loading__text">Sincronizando tu diario clínico...</p>
        </div>
    );

    const completedCount = exercises.filter(e => e.done).length;
    const progressPct    = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

    // Gráfica de evolución
    const svgW = chartWidth, svgH = 70;
    const paddingX = 8;
    const pts  = painHistory.length > 0 
        ? painHistory.map((v, i) => ({
            x: paddingX + i * ((svgW - 2 * paddingX) / (Math.max(painHistory.length - 1, 1))),
            y: svgH - (v / 10) * (svgH - 10) - 5,
          }))
        : [{x: paddingX, y: svgH}, {x: svgW - paddingX, y: svgH}];
    const polyStr = pts.map(p => `${p.x},${p.y}`).join(' ');

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
                <h1 className="home-header__title">¡Hola, {user.name.split(' ')[0]}!</h1>
                <p className="home-header__subtitle">
                    {progressPct === 100 
                        ? "¡Enhorabuena! Has completado todos tus ejercicios hoy." 
                        : `Te quedan ${exercises.length - completedCount} ejercicios para completar tu objetivo diario.`}
                </p>
            </header>

            <section className="dashboard-grid">
                {/* PRÓXIMA CITA */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Tu Próxima Cita</h2>
                    <article className="dashboard-card dashboard-card--appointment-highlight">
                        {nextAppointment ? (
                            <>
                                <header className="appointment-card__header">
                                    <div>
                                        <h3 className="card-title-big">{nextAppointment.fisioterapeuta?.name || 'Tu Fisioterapeuta'}</h3>
                                        <span className="card-label">{nextAppointment.tipo || 'Sesión de tratamiento'}</span>
                                    </div>
                                    {nextAppointment.estado === 'confirmada' && (
                                        <span className="appointment-card__status-badge">CONFIRMADA ✓</span>
                                    )}
                                </header>

                                <header className="meta-row meta-row--mt-md">
                                    <span className="meta-label">Horario Confirmado</span>
                                </header>
                                <time className="appointment-time">{nextAppointment.hora}</time>

                                <article className="date-badge date-badge--mt-lg">
                                    <section className="date-badge__accent">
                                        <span className="date-badge__day-short">
                                            {new Date(nextAppointment.fecha).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="date-badge__day-num">{new Date(nextAppointment.fecha).getDate()}</span>
                                    </section>
                                    <section className="date-badge__info">
                                        <span className="date-badge__month">
                                            {new Date(nextAppointment.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="date-badge__label">Cita en Centro Kinefy</span>
                                    </section>
                                </article>

                                {nextAppointment.estado === 'pendiente' && (
                                    <button 
                                        className="btn-primary btn-appointment-confirm" 
                                        onClick={() => confirmAppointment(nextAppointment._id)}
                                    >
                                        Confirmar Asistencia
                                    </button>
                                )}
                                <button 
                                    className="btn-ghost btn-appointment-agenda" 
                                    onClick={() => navigate('/dashboard/patient/appointments')}
                                >
                                    Ver mi agenda de citas
                                </button>
                            </>
                        ) : (
                            <div className="no-appointments-view">
                                <p className="no-appointments-view__text">No tienes citas programadas próximamente.</p>
                                <button 
                                    className="btn-primary btn-appointment-request" 
                                    onClick={() => setShowApptModal(true)}
                                >
                                    Solicitar Cita
                                </button>
                            </div>
                        )}
                    </article>

                    {/* MIS DOCUMENTOS (NUEVA SECCIÓN) */}
                    <h2 className="grid-col__title grid-col__title--mt-lg">Mis Informes Médicos</h2>
                    <article className="dashboard-card dashboard-card--p-sm">
                        {patientData?.informes?.length > 0 ? (
                            <div className="home-docs-list">
                                {patientData.informes.slice(0, 3).map((doc, i) => (
                                    <div key={i} className="home-doc-item">
                                        <div className="home-doc-item__icon-wrapper">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                        </div>
                                        <div className="home-doc-item__meta">
                                            <p className="home-doc-item__title">{doc.nombre}</p>
                                            <span className="home-doc-item__date">{new Date(doc.fecha).toLocaleDateString()}</span>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="home-doc-item__link">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </a>
                                    </div>
                                ))}
                                {patientData?.informes?.length > 0 && (
                                    <button 
                                        className="btn-ghost btn-ghost--mt-md-h36" 
                                        onClick={() => navigate('/dashboard/patient/docs')}
                                    >
                                        Ver todos los informes ({patientData.informes.length})
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="home-docs-empty">Aún no hay informes en tu expediente.</p>
                        )}
                    </article>
                </section>

                {/* EJERCICIOS */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Rutina Diaria</h2>
                    <article className="dashboard-card">
                        <section className="exercise-progress">
                            <header className="exercise-progress__header">
                                <span className="exercise-progress__label">
                                    <ExercisesIcon /> {completedCount}/{exercises.length} ejercicios
                                </span>
                                <span className="exercise-progress__pct">{progressPct}%</span>
                            </header>
                            <div className="progress-bar--mini">
                                <div className="progress-bar__fill" style={{ '--progress': `${progressPct}%` }} />
                            </div>
                        </section>

                        <ul className="exercise-list exercise-list--mt-lg">
                            {exercises.length > 0 ? exercises.map(ex => (
                                <li
                                    key={ex.id}
                                    className={`exercise-list__item ${ex.done ? 'exercise-list__item--done' : ''}`}
                                    onClick={() => toggleExercise(ex.id)}
                                >
                                    <span className="exercise-list__check">{ex.done ? '✓' : ''}</span>
                                    <section className="exercise-list__info">
                                        <span className="exercise-list__name">{ex.name}</span>
                                        <span className="exercise-list__series">{ex.series}</span>
                                    </section>
                                    {ex.mediaUrl && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPreviewEx(ex); }} 
                                            className="exercise-list__preview-btn"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        </button>
                                    )}
                                </li>

                            )) : (
                                <p className="exercise-list__empty">No tienes ejercicios asignados por tu fisio.</p>
                            )}
                            {exercises.length > 0 && (
                                <button 
                                    className="btn-ghost btn-ghost--full-w-h36" 
                                    onClick={() => navigate('/dashboard/patient/exercises')}
                                >
                                    Ver mis ejercicios detallados
                                </button>
                            )}
                        </ul>
                    </article>
                </section>

                {/* EVOLUCIÓN Y DIARIO */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Mi Evolución</h2>
                    <article className="dashboard-card">
                        <header className="activity-widget__header">
                            <p className="activity-widget__subtitle">Tendencia de <strong>Dolor</strong></p>
                        </header>

                        <figure className="activity-widget__wave" ref={containerRef}>
                            <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                                <defs>
                                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#55A98A" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#81BAA5" stopOpacity="0.05" />
                                    </linearGradient>
                                </defs>
                                <polygon points={`${pts[0].x},${svgH} ${polyStr} ${pts[pts.length-1].x},${svgH}`} fill="url(#painGrad)" />
                                <polyline points={polyStr} fill="none" stroke="#55A98A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill="#1A2E35" stroke="#fff" strokeWidth="2" />
                            </svg>
                        </figure>

                        {!submitted ? (
                            <form className="pain-form pain-form--widget" onSubmit={handleSubmitDiary}>
                                <p className="meta-label meta-label--center-mb">¿Cómo te sientes hoy? (Escala EVA)</p>
                                <div className="pain-scale pain-scale--widget">
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={`pain-dot pain-dot--small ${painLevel === n ? 'pain-dot--active' : ''} ${n <= 3 ? 'pain-dot--low' : n <= 6 ? 'pain-dot--mid' : 'pain-dot--high'}`}
                                            onClick={() => setPainLevel(n)}
                                        >{n}</button>
                                    ))}
                                </div>
                                <textarea 
                                    className="dashboard__input dashboard__input--textarea-short" 
                                    placeholder="Añade una observación clínica si lo necesitas..." 
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                                <button className="btn-primary btn-primary--mt-md-h44" type="submit" disabled={!painLevel}>
                                    Registrar Evolución
                                </button>
                            </form>
                        ) : (
                            <section className="pain-success pain-success--widget">
                                <div className="pain-success__icon-circle">✓</div>
                                <p className="pain-success__title">¡Registro guardado!</p>
                                <p className="meta-label">Has marcado un nivel de dolor de {painLevel}/10. Tu fisio ya puede verlo.</p>
                            </section>
                        )}

                        <ul className="activity-list activity-list--mt-lg">
                            <li className="activity-list__item activity-list__item--today">
                                <span className="activity-list__label">Objetivo Diario</span>
                                <span className="activity-list__value">{completedCount}/{exercises.length}</span>
                            </li>
                            <li className="activity-list__item">
                                <span className="activity-list__label">Estado del Plan</span>
                                <span className="activity-list__value activity-list__value--active">Activo</span>
                            </li>
                        </ul>
                        <button 
                            className="btn-ghost btn-ghost--full-w-h36" 
                            onClick={() => navigate('/dashboard/patient/evolution')}
                        >
                            Ver evolución y gráfico completo
                        </button>
                    </article>
                </section>
            </section>
            {previewEx && createPortal(
                <div className="video-preview-overlay" onClick={() => setPreviewEx(null)}>
                    <div className="dashboard-card animate-in video-preview-container" onClick={e => e.stopPropagation()}>
                        <header className="video-preview-header">
                            <h3 className="video-preview-title">{previewEx.name}</h3>
                            <button className="video-preview-close-btn" onClick={() => setPreviewEx(null)}>✕</button>
                        </header>
                        <div className="video-preview-media-wrapper">
                            {previewEx.mediaUrl.includes('youtube.com') || previewEx.mediaUrl.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={previewEx.mediaUrl.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : isVideo(previewEx.mediaUrl) ? (
                                <video src={previewEx.mediaUrl} controls autoPlay className="patient-exercises__video" />
                            ) : (
                                <img src={previewEx.mediaUrl} alt={previewEx.name} className="video-preview-image" />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showApptModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowApptModal(false)}>
                    <div className="modal-container--premium modal-container--premium-w450" onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">Solicitar Nueva Cita</h2>
                            <p className="modal-header__subtitle">Propón un horario y tu fisio lo confirmará.</p>
                            <button className="modal-close" onClick={() => setShowApptModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleRequestAppointment} className="clinical-form">
                                <div className="clinical-input-group clinical-input-group--mb-lg">
                                    <div className="clinical-input-group__header">
                                        <label className="meta-label meta-label--brand meta-label--no-margin">Fecha Preferente</label>
                                        <button 
                                            type="button" 
                                            className="link-btn clinical-input-group__link-btn" 
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
                                        <div className="no-scrollbar date-btn-container">
                                            {getNextDays().map((d, index) => {
                                                const isoStr = toLocalDateString(d);
                                                const isSelected = apptForm.fecha === isoStr;
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => setApptForm(prev => ({ ...prev, fecha: isoStr }))}
                                                        className={`date-btn-select ${isSelected ? 'date-btn-select--selected' : ''}`}
                                                    >
                                                        <span className="date-btn-select__weekday">
                                                            {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                                                        </span>
                                                        <span className="date-btn-select__day">
                                                            {d.getDate()}
                                                        </span>
                                                        <span className="date-btn-select__month">
                                                            {d.toLocaleDateString('es-ES', { month: 'short' })}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="clinical-input-group clinical-input-group--mb-lg">
                                    <div className="clinical-input-group__header">
                                        <label className="meta-label meta-label--brand meta-label--no-margin">Hora de la Cita</label>
                                        <button 
                                            type="button" 
                                            className="link-btn clinical-input-group__link-btn" 
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
                                        <div className="hour-btn-grid">
                                            {[
                                                '09:00', '10:00', '11:00', '12:00', '13:00',
                                                '16:00', '17:00', '18:00', '19:00', '20:00'
                                            ].map((time, idx) => {
                                                const isSelected = apptForm.hora === time;
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setApptForm(prev => ({ ...prev, hora: time }))}
                                                        className={`hour-btn-select ${isSelected ? 'hour-btn-select--selected' : ''}`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Motivo / Notas</label>
                                    <input 
                                        type="text" 
                                        className="input-clinical" 
                                        placeholder="Ej: Revisión de rodilla" 
                                        value={apptForm.tipo} 
                                        onChange={e => setApptForm({...apptForm, tipo: e.target.value})} 
                                    />
                                </div>
                                
                                <div className="clinical-card--dashed clinical-card--dashed--compact">
                                    <p className="patient-appt-form__disclaimer">
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

export default PatientDashboardHome;
