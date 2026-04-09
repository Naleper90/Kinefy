import React, { useState } from 'react';
import { AppointmentsIcon, ExercisesIcon } from '../../components/dashboard/DashboardIcons';

const PatientDashboardHome = () => {
    const [exercises, setExercises] = useState([
        { id: 1, name: 'Extensión de rodilla',       series: '3x15',  done: false },
        { id: 2, name: 'Sentadilla asistida',         series: '3x10',  done: false },
        { id: 3, name: 'Estiramiento cuádriceps',     series: '2x30s', done: true  },
        { id: 4, name: 'Elevación de pierna recta',   series: '3x12',  done: false },
    ]);

    const [painLevel, setPainLevel]   = useState(null);
    const [observation, setObservation] = useState('');
    const [submitted, setSubmitted]   = useState(false);

    const toggleExercise = (id) =>
        setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, done: !ex.done } : ex));

    const handleSubmitDiary = (e) => { e.preventDefault(); setSubmitted(true); };

    const completedCount = exercises.filter(e => e.done).length;
    const progressPct    = Math.round((completedCount / exercises.length) * 100);

    const painHistory  = [6, 5, 7, 4, 5, 3, painLevel ?? 3];
    const svgW = 240, svgH = 70;
    const pts  = painHistory.map((v, i) => ({
        x: i * (svgW / (painHistory.length - 1)),
        y: svgH - (v / 10) * svgH,
    }));
    const polyStr = pts.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <section className="home">
            <header className="home-header">
                <h1 className="home-header__title">Buenos días, Carlos.</h1>
                <p className="home-header__subtitle">Tienes {exercises.filter(e => !e.done).length} ejercicios pendientes hoy.</p>
            </header>

            <section className="dashboard-grid">
                <section className="grid-col">
                    <h3 className="grid-col__title">Próxima Cita</h3>
                    <article className="dashboard-card">
                        <h2 className="card-title-big">Natalia A.</h2>
                        <span className="card-label">Fisioterapeuta</span>

                        <header className="meta-row">
                            <span className="meta-label">Hora</span>
                        </header>
                        <time className="appointment-time" dateTime="2026-04-11T10:30">10:30 AM</time>

                        <header className="meta-row">
                            <span className="meta-label">Motivo</span>
                        </header>
                        <article className="appointment-reason" style={{ marginBottom: '1rem' }}>
                            <AppointmentsIcon />
                            <span>Sesión de seguimiento</span>
                        </article>

                        <figure className="date-badge">
                            <span className="date-badge__day">Viernes</span>
                            <span className="date-badge__full">11 Abril 2025</span>
                        </figure>

                        <footer className="appointment-actions" style={{ marginTop: '1.2rem' }}>
                            <button className="btn-primary">Confirmar asistencia</button>
                        </footer>
                    </article>
                </section>

                <section className="grid-col">
                    <h3 className="grid-col__title">Mis Ejercicios</h3>
                    <article className="dashboard-card">
                        <section className="exercise-progress">
                            <header className="exercise-progress__header">
                                <span className="exercise-progress__label">
                                    <ExercisesIcon /> {completedCount}/{exercises.length}
                                </span>
                                <span className="exercise-progress__pct">{progressPct}%</span>
                            </header>
                            <div className="progress-bar--mini">
                                <div className="progress-bar__fill" style={{ '--progress': `${progressPct}%` }} />
                            </div>
                        </section>

                        <ul className="exercise-list" style={{ marginTop: '1rem' }}>
                            {exercises.map(ex => (
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
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="grid-col">
                    <h3 className="grid-col__title">Mi Evolución</h3>
                    <article className="dashboard-card">
                        <header className="activity-widget__header">
                            <p className="activity-widget__subtitle">Nivel de molestia <strong>(Últimas 24h)</strong></p>
                        </header>

                        <figure className="activity-widget__wave" style={{ margin: '0.8rem 0' }}>
                            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#88C9B0" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#88C9B0" stopOpacity="0.02" />
                                    </linearGradient>
                                </defs>
                                <polygon
                                    points={`0,${svgH} ${polyStr} ${svgW},${svgH}`}
                                    fill="url(#painGrad)"
                                />
                                <polyline
                                    points={polyStr}
                                    fill="none"
                                    stroke="#88C9B0"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle
                                    cx={pts[pts.length - 1].x}
                                    cy={pts[pts.length - 1].y}
                                    r="4" fill="#1A2E35" stroke="#fff" strokeWidth="1.5"
                                />
                            </svg>
                        </figure>

                        {!submitted ? (
                            <form className="pain-form" onSubmit={handleSubmitDiary}>
                                <p className="meta-label">¿Cuánto te duele hoy?</p>
                                <div className="pain-scale">
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={`pain-dot ${painLevel === n ? 'pain-dot--active' : ''} ${n <= 3 ? 'pain-dot--low' : n <= 6 ? 'pain-dot--mid' : 'pain-dot--high'}`}
                                            onClick={() => setPainLevel(n)}
                                        >{n}</button>
                                    ))}
                                </div>
                                <textarea 
                                    className="pain-input" 
                                    placeholder="Observaciones..." 
                                    rows={1}
                                    value={observation}
                                    onChange={e => setObservation(e.target.value)}
                                />
                                <footer className="pain-actions" style={{ marginTop: '0.6rem' }}>
                                    <button className="btn-primary" type="submit" disabled={!painLevel}>
                                        Registrar entrada
                                    </button>
                                </footer>
                            </form>
                        ) : (
                            <section className="pain-success">
                                <span className="pain-success__icon">✓</span>
                                <p>Registrado. <strong>Nivel {painLevel}/10</strong></p>
                                {observation && <p className="meta-label">"{observation}"</p>}
                            </section>
                        )}

                        <ul className="activity-list" style={{ marginTop: '1rem' }}>
                            {[
                                { label: 'Ejercicios hoy', value: `${completedCount}/${exercises.length}` },
                                { label: 'Sesiones totales', value: '12' },
                                { label: 'Días seguidos', value: '9 días', today: true },
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

export default PatientDashboardHome;
