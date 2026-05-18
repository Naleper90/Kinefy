import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AppointmentsIcon, ExercisesIcon } from '../../components/dashboard/DashboardIcons';
import api from '../../api/api';

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
        fecha: new Date().toISOString().split('T')[0],
        hora: '10:00',
        tipo: 'Sesión de Seguimiento'
    });

    const handleRequestAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', apptForm);
            setShowApptModal(false);
            // Recargar datos para ver la cita pendiente
            const resApp = await api.get('/appointments');
            const now = new Date();
            const future = resApp.data
                .filter(a => new Date(a.fecha) >= now)
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
            setNextAppointment(future);
        } catch (err) {
            if (err.response?.data?.code === 'APPOINTMENT_CONFLICT') {
                alert("Este horario ya está ocupado. Por favor, elige otro momento.");
            } else {
                alert("Error al solicitar la cita. Revisa tu conexión.");
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
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#5A6B6D', fontWeight: '500' }}>Sincronizando tu diario clínico...</p>
        </div>
    );

    const completedCount = exercises.filter(e => e.done).length;
    const progressPct    = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

    // Gráfica de evolución
    const svgW = 240, svgH = 70;
    const pts  = painHistory.length > 0 
        ? painHistory.map((v, i) => ({
            x: i * (svgW / (Math.max(painHistory.length - 1, 1))),
            y: svgH - (v / 10) * svgH,
          }))
        : [{x: 0, y: svgH}, {x: svgW, y: svgH}];
    const polyStr = pts.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <section className="home animate-in">
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
                    <article className="dashboard-card" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FAF6 100%)' }}>
                        {nextAppointment ? (
                            <>
                                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 className="card-title-big">{nextAppointment.fisioterapeuta?.name || 'Tu Fisioterapeuta'}</h3>
                                        <span className="card-label">{nextAppointment.tipo || 'Sesión de tratamiento'}</span>
                                    </div>
                                    {nextAppointment.estado === 'confirmada' && (
                                        <span style={{ background: '#55A98A', color: '#FFF', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '100px', fontWeight: '700' }}>CONFIRMADA ✓</span>
                                    )}
                                </header>

                                <header className="meta-row" style={{ marginTop: '1.2rem' }}>
                                    <span className="meta-label">Horario Confirmado</span>
                                </header>
                                <time className="appointment-time">{nextAppointment.hora}</time>

                                <article className="date-badge" style={{ marginTop: '1.5rem' }}>
                                    <section className="date-badge__accent" style={{ background: '#55A98A' }}>
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
                                        className="btn-primary" 
                                        style={{ marginTop: '1.5rem', width: '100%', height: '44px' }}
                                        onClick={() => confirmAppointment(nextAppointment._id)}
                                    >
                                        Confirmar Asistencia
                                    </button>
                                )}
                                <button 
                                    className="btn-ghost" 
                                    style={{ marginTop: '1rem', width: '100%', height: '40px' }}
                                    onClick={() => navigate('/dashboard/patient/appointments')}
                                >
                                    Ver mi agenda de citas
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>No tienes citas programadas próximamente.</p>
                                <button 
                                    className="btn-primary" 
                                    style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.2rem' }}
                                    onClick={() => setShowApptModal(true)}
                                >
                                    Solicitar Cita
                                </button>
                            </div>
                        )}
                    </article>

                    {/* MIS DOCUMENTOS (NUEVA SECCIÓN) */}
                    <h2 className="grid-col__title" style={{ marginTop: '2.5rem' }}>Mis Informes Médicos</h2>
                    <article className="dashboard-card" style={{ padding: '1.2rem' }}>
                        {patientData?.informes?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {patientData.informes.slice(0, 3).map((doc, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: '#F9FBFB', borderRadius: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.nombre}</p>
                                            <span style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>{new Date(doc.fecha).toLocaleDateString()}</span>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#55A98A' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </a>
                                    </div>
                                ))}
                                {patientData?.informes?.length > 0 && (
                                    <button 
                                        className="btn-ghost" 
                                        style={{ marginTop: '1rem', width: '100%', height: '36px', fontSize: '0.8rem' }}
                                        onClick={() => navigate('/dashboard/patient/docs')}
                                    >
                                        Ver todos los informes ({patientData.informes.length})
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#A0AEC0', fontSize: '0.85rem', textAlign: 'center' }}>Aún no hay informes en tu expediente.</p>
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

                        <ul className="exercise-list" style={{ marginTop: '1.5rem' }}>
                            {exercises.length > 0 ? exercises.map(ex => (
                                <li
                                    key={ex.id}
                                    className={`exercise-list__item ${ex.done ? 'exercise-list__item--done' : ''}`}
                                    onClick={() => toggleExercise(ex.id)}
                                >
                                    <span className="exercise-list__check">{ex.done ? '✓' : ''}</span>
                                    <section className="exercise-list__info" style={{ flex: 1 }}>
                                        <span className="exercise-list__name">{ex.name}</span>
                                        <span className="exercise-list__series">{ex.series}</span>
                                    </section>
                                    {ex.mediaUrl && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPreviewEx(ex); }} 
                                            style={{ border: 'none', cursor: 'pointer', color: '#55A98A', background: '#E8F5F1', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        </button>
                                    )}
                                </li>

                            )) : (
                                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No tienes ejercicios asignados por tu fisio.</p>
                            )}
                            {exercises.length > 0 && (
                                <button 
                                    className="btn-ghost" 
                                    style={{ marginTop: '1.2rem', width: '100%', height: '36px', fontSize: '0.8rem' }}
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

                        <figure className="activity-widget__wave" style={{ margin: '1rem 0' }}>
                            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#55A98A" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#81BAA5" stopOpacity="0.05" />
                                    </linearGradient>
                                </defs>
                                <polygon points={`0,${svgH} ${polyStr} ${svgW},${svgH}`} fill="url(#painGrad)" />
                                <polyline points={polyStr} fill="none" stroke="#55A98A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill="#1A2E35" stroke="#fff" strokeWidth="2" />
                            </svg>
                        </figure>

                        {!submitted ? (
                            <form className="pain-form" onSubmit={handleSubmitDiary} style={{ background: '#F9FBFB', padding: '1.2rem', borderRadius: '18px' }}>
                                <p className="meta-label" style={{ marginBottom: '1rem', textAlign: 'center' }}>¿Cómo te sientes hoy? (Escala EVA)</p>
                                <div className="pain-scale" style={{ gap: '0.4rem', marginBottom: '1.2rem' }}>
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={`pain-dot ${painLevel === n ? 'pain-dot--active' : ''} ${n <= 3 ? 'pain-dot--low' : n <= 6 ? 'pain-dot--mid' : 'pain-dot--high'}`}
                                            onClick={() => setPainLevel(n)}
                                            style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}
                                        >{n}</button>
                                    ))}
                                </div>
                                <textarea 
                                    className="auth__input" 
                                    placeholder="Añade una observación clínica si lo necesitas..." 
                                    style={{ width: '100%', minHeight: '60px', fontSize: '0.85rem', background: '#FFF' }}
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                                <button className="btn-primary" type="submit" disabled={!painLevel} style={{ marginTop: '1rem', height: '44px' }}>
                                    Registrar Evolución
                                </button>
                            </form>
                        ) : (
                            <section className="pain-success" style={{ padding: '2rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#55A98A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>✓</div>
                                <p style={{ fontWeight: '700', marginBottom: '0.3rem' }}>¡Registro guardado!</p>
                                <p className="meta-label">Has marcado un nivel de dolor de {painLevel}/10. Tu fisio ya puede verlo.</p>
                            </section>
                        )}

                        <ul className="activity-list" style={{ marginTop: '1.5rem' }}>
                            <li className="activity-list__item activity-list__item--today">
                                <span className="activity-list__label">Objetivo Diario</span>
                                <span className="activity-list__value">{completedCount}/{exercises.length}</span>
                            </li>
                            <li className="activity-list__item">
                                <span className="activity-list__label">Estado del Plan</span>
                                <span className="activity-list__value" style={{ color: '#55A98A', fontWeight: '700' }}>Activo</span>
                            </li>
                        </ul>
                        <button 
                            className="btn-ghost" 
                            style={{ marginTop: '1.2rem', width: '100%', height: '36px', fontSize: '0.8rem' }}
                            onClick={() => navigate('/dashboard/patient/evolution')}
                        >
                            Ver evolución y gráfico completo
                        </button>
                    </article>
                </section>
            </section>
            {previewEx && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }} onClick={() => setPreviewEx(null)}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '800px', width: '100%', padding: '1.5rem', borderRadius: '28px', background: '#FFFFFF', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1A2E35' }}>{previewEx.name}</h3>
                            <button onClick={() => setPreviewEx(null)} style={{ background: '#F9FBFB', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6B6D', fontWeight: 'bold' }}>✕</button>
                        </header>
                        <div style={{ background: '#F0F4F4', borderRadius: '20px', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {previewEx.mediaUrl.includes('youtube.com') || previewEx.mediaUrl.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={previewEx.mediaUrl.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : isVideo(previewEx.mediaUrl) ? (
                                <video src={previewEx.mediaUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                            ) : (
                                <img src={previewEx.mediaUrl} alt={previewEx.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

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
                                        placeholder="Ej: Revisión de rodilla" 
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

export default PatientDashboardHome;
