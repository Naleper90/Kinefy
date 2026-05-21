import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';

const PatientEvolution = () => {
    const [painHistory, setPainHistory] = useState([]);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [painLevel, setPainLevel] = useState(null);
    const [observation, setObservation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [chartWidth, setChartWidth] = useState(500);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.getBoundingClientRect().width || 500);
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

    const fetchData = async () => {
        try {
            const meRes = await api.get('/patients/me');
            setPatientData(meRes.data);

            const historyRes = await api.get(`/patients/evolution/${meRes.data._id}`);
            if (historyRes.data) {
                // Ordenar por fecha cronológica (el más antiguo primero para el gráfico, pero el timeline al revés)
                const sorted = historyRes.data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                setPainHistory(sorted);
            }
        } catch (err) {
            // Manejo silencioso
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitDiary = async (e) => {
        e.preventDefault();
        if (!patientData || painLevel === null) return;
        try {
            await api.post('/patients/evolution', {
                pacienteId: patientData._id,
                nivelDolor: painLevel,
                observaciones: observation
            });
            setSubmitted(true);
            showNotification("Registro diario completado");
            setObservation('');
            setPainLevel(null);
            fetchData();
        } catch (err) {
            showNotification("No se pudo enviar el registro");
        }
    };

    if (loading) return (
        <div className="evolution-loading">
            <div className="loader loader--centered-margin"></div>
            <p className="evolution-loading__text">Cargando tu evolución clínica...</p>
        </div>
    );

    // Cálculos de colores para escala EVA
    const getPainColor = (level) => {
        if (level <= 2) return '#E8F5F1'; // Leve - Mint
        if (level <= 5) return '#FEF3C7'; // Moderado - Amarillo
        if (level <= 7) return '#FEE2E2'; // Fuerte - Rosa suave
        return '#FCA5A5'; // Muy severo - Rojo suave
    };

    const getPainTextColor = (level) => {
        if (level <= 2) return '#55A98A';
        if (level <= 5) return '#D97706';
        if (level <= 7) return '#EF4444';
        return '#B91C1C';
    };

    const getPainLabel = (level) => {
        if (level === 0) return 'Sin Dolor';
        if (level <= 2) return 'Dolor Leve';
        if (level <= 5) return 'Dolor Moderado';
        if (level <= 7) return 'Dolor Fuerte';
        if (level <= 9) return 'Dolor Muy Fuerte';
        return 'Dolor Insoportable';
    };

    // Preparar puntos del gráfico SVG ampliado
    const svgW = chartWidth, svgH = 165;
    const paddingX = 25;
    const pts = painHistory.length > 0 
        ? painHistory.map((item, i) => {
            const x = paddingX + i * ((svgW - 2 * paddingX) / (Math.max(painHistory.length - 1, 1)));
            // Invertir Y para que 0 dolor esté abajo y 10 dolor esté arriba (mapeado de y=20 a y=120)
            const y = 120 - (item.nivelDolor / 10) * 100;
            return { x, y, level: item.nivelDolor, date: new Date(item.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) };
          })
        : [];

    const linePath = pts.map(p => `${p.x},${p.y}`).join(' L ');
    const areaPath = pts.length > 0
        ? `M ${pts[0].x},120 L ${linePath} L ${pts[pts.length - 1].x},120 Z`
        : '';

    // Timeline ordenado cronológicamente al revés (más reciente arriba)
    const timeline = [...painHistory].reverse();

    return (
        <section className="home animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}

            <header className="home-header evolution-header">
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Mi Evolución Clínica</h1>
                    <p className="home-header__subtitle">Registra tu estado diario (Escala EVA) y analiza tus tendencias de recuperación.</p>
                </hgroup>
            </header>

            <section className="dashboard-grid dashboard-grid--home">
                {/* COLUMNA 1: GRÁFICO Y REGISTRO */}
                <section className="grid-col evolution-card-grid-span2">
                    <h2 className="grid-col__title">Histórico de Dolor (Escala EVA)</h2>
                    <article className="dashboard-card evolution-card--chart">
                        {pts.length > 0 ? (
                            <div>
                                <div className="evolution-chart__container" ref={containerRef} style={{ height: `${svgH}px` }}>
                                    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                                        <defs>
                                            <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Líneas horizontales de referencia */}
                                        {[40, 70, 100].map((yVal, index) => (
                                            <line 
                                                key={index} 
                                                x1="0" 
                                                y1={yVal} 
                                                x2={svgW} 
                                                y2={yVal} 
                                                stroke="#EDF2F2" 
                                                strokeWidth="1.5" 
                                                strokeDasharray="4,4" 
                                            />
                                        ))}

                                        {/* Área sombreada */}
                                        {areaPath && (
                                            <path d={areaPath} fill="url(#painGrad)" />
                                        )}

                                        {/* Línea principal */}
                                        {linePath && (
                                            <path 
                                                d={`M ${linePath}`} 
                                                fill="none" 
                                                stroke="var(--color-brand)" 
                                                strokeWidth="4" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />
                                        )}

                                        {/* Puntos y etiquetas */}
                                        {pts.map((p, idx) => (
                                            <g key={idx}>
                                                <circle 
                                                    cx={p.x} 
                                                    cy={p.y} 
                                                    r="5" 
                                                    fill="var(--color-text-dark)" 
                                                    stroke="#FFF" 
                                                    strokeWidth="2" 
                                                />
                                                {/* Mostrar número arriba del punto */}
                                                <text 
                                                    x={p.x} 
                                                    y={p.y - 12} 
                                                    textAnchor="middle" 
                                                    fontSize="0.75rem" 
                                                    fontWeight="bold" 
                                                    fill="var(--color-text-dark)"
                                                >
                                                    {p.level}
                                                </text>

                                                {/* Eje de fechas en la parte inferior */}
                                                <text 
                                                    x={p.x} 
                                                    y="152" 
                                                    textAnchor="middle" 
                                                    fontSize="0.7rem" 
                                                    fontWeight="700" 
                                                    fill="#718096"
                                                    style={{ textTransform: 'uppercase' }}
                                                >
                                                    {p.date}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <p className="evolution-chart__empty">No hay registros de dolor registrados aún. Envía tu primer diario abajo.</p>
                        )}
                    </article>

                    {/* REGISTRO DIARIO */}
                    <h2 className="grid-col__title evolution-section-title">Registrar Diario Clínico de Hoy</h2>
                    <article className="dashboard-card">
                        {!submitted ? (
                            <form className="pain-form pain-form--padding" onSubmit={handleSubmitDiary}>
                                <span className="meta-label pain-form__label--block">¿Qué nivel de dolor experimentas hoy?</span>
                                
                                {/* Botones del 0 al 10 */}
                                <div className="pain-scale__container">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            type="button"
                                            key={num}
                                            onClick={() => setPainLevel(num)}
                                            className={`pain-scale__btn ${painLevel === num ? 'pain-scale__btn--active' : ''}`}
                                            style={{
                                                background: getPainColor(num),
                                                color: getPainTextColor(num)
                                            }}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                {painLevel !== null && (
                                    <div className="pain-scale__summary">
                                        <span className="pain-scale__summary-text" style={{ color: getPainTextColor(painLevel) }}>
                                            Escala EVA {painLevel}/10 - {getPainLabel(painLevel)}
                                        </span>
                                    </div>
                                )}

                                <div className="pain-form__input-group pain-form__input-group--mb">
                                    <label className="meta-label">Observaciones y Síntomas (Opcional)</label>
                                    <textarea
                                        className="pain-form__textarea pain-form__textarea--refactored"
                                        placeholder="Describe dónde sientes el dolor, qué movimientos te molestan o si el ejercicio ha ayudado..."
                                        rows="3"
                                        value={observation}
                                        onChange={e => setObservation(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="btn-primary pain-form__submit-btn" disabled={painLevel === null} style={{ opacity: painLevel === null ? 0.5 : 1 }}>
                                    Guardar Diario Diario
                                </button>
                            </form>
                        ) : (
                            <div className="pain-success-view">
                                <div className="pain-success-view__icon">✓</div>
                                <h3 className="pain-success-view__title">¡Diario Completado!</h3>
                                <p className="pain-success-view__text">Has registrado tu nivel de dolor de hoy. Tu fisioterapeuta podrá ver estos datos en tiempo real.</p>
                                <button className="btn-ghost pain-success-view__btn" onClick={() => setSubmitted(false)}>Hacer Otro Registro</button>
                            </div>
                        )}
                    </article>
                </section>

                {/* COLUMNA 2: TIMELINE HISTÓRICO */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Historial de Registros</h2>
                    <article className="dashboard-card evolution-card--timeline">
                        {timeline.length > 0 ? (
                            <div className="pain-timeline">
                                {timeline.map((entry, idx) => (
                                    <div key={idx} className="pain-timeline__item">
                                        {/* Círculo indicador del timeline */}
                                        <div 
                                            className="pain-timeline__dot"
                                            style={{
                                                background: getPainTextColor(entry.nivelDolor)
                                            }} 
                                        />
                                        
                                        <header className="pain-timeline__header">
                                            <span className="pain-timeline__date">
                                                {new Date(entry.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                            <span 
                                                className="pain-timeline__badge"
                                                style={{
                                                    background: getPainColor(entry.nivelDolor),
                                                    color: getPainTextColor(entry.nivelDolor)
                                                }}
                                            >
                                                EVA {entry.nivelDolor}
                                            </span>
                                        </header>
                                        
                                        <p className="pain-timeline__desc">
                                            {entry.observaciones || <em className="pain-timeline__empty-obs">Sin observaciones añadidas.</em>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="pain-timeline__empty-text">Aún no hay registros de evolución cargados.</p>
                        )}
                    </article>
                </section>
            </section>
        </section>
    );
};

export default PatientEvolution;
