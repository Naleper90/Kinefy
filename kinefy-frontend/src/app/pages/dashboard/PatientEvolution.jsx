import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const PatientEvolution = () => {
    const [painHistory, setPainHistory] = useState([]);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [painLevel, setPainLevel] = useState(null);
    const [observation, setObservation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);

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
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#5A6B6D', fontWeight: '500' }}>Cargando tu evolución clínica...</p>
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

    // Preparar puntos del gráfico SVG ampliado (500x150)
    const svgW = 500, svgH = 150;
    const pts = painHistory.length > 0 
        ? painHistory.map((item, i) => {
            const x = i * (svgW / (Math.max(painHistory.length - 1, 1)));
            // Invertir Y para que 0 dolor esté abajo y 10 dolor esté arriba
            const y = svgH - ((item.nivelDolor / 10) * (svgH - 20) + 10);
            return { x, y, level: item.nivelDolor, date: new Date(item.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) };
          })
        : [];

    const linePath = pts.map(p => `${p.x},${p.y}`).join(' L ');
    const areaPath = pts.length > 0
        ? `M 0,${svgH} L ${linePath} L ${pts[pts.length - 1].x},${svgH} Z`
        : '';

    // Timeline ordenado cronológicamente al revés (más reciente arriba)
    const timeline = [...painHistory].reverse();

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
                    <h1 className="home-header__title">Mi Evolución Clínica</h1>
                    <p className="home-header__subtitle">Registra tu estado diario (Escala EVA) y analiza tus tendencias de recuperación.</p>
                </hgroup>
            </header>

            <section className="dashboard-grid dashboard-grid--home">
                {/* COLUMNA 1: GRÁFICO Y REGISTRO */}
                <section className="grid-col" style={{ gridColumn: 'span 2' }}>
                    <h2 className="grid-col__title">Histórico de Dolor (Escala EVA)</h2>
                    <article className="dashboard-card" style={{ padding: '2rem 1.5rem', background: '#FFFFFF', border: '1px solid #EBF0F0' }}>
                        {pts.length > 0 ? (
                            <div>
                                <div style={{ position: 'relative', width: '100%', height: `${svgH}px`, margin: '1rem 0' }}>
                                    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Líneas horizontales de referencia */}
                                        {[0.2, 0.5, 0.8].map((ratio, index) => (
                                            <line 
                                                key={index} 
                                                x1="0" 
                                                y1={svgH * ratio} 
                                                x2={svgW} 
                                                y2={svgH * ratio} 
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
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', marginTop: '0.8rem' }}>
                                    {pts.map((p, idx) => (
                                        <span key={idx} style={{ fontSize: '0.7rem', color: '#718096', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {p.date}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', padding: '2rem 0', color: '#718096' }}>No hay registros de dolor registrados aún. Envía tu primer diario abajo.</p>
                        )}
                    </article>

                    {/* REGISTRO DIARIO */}
                    <h2 className="grid-col__title" style={{ marginTop: '2.5rem' }}>Registrar Diario Clínico de Hoy</h2>
                    <article className="dashboard-card">
                        {!submitted ? (
                            <form className="pain-form" onSubmit={handleSubmitDiary} style={{ padding: '0.5rem' }}>
                                <span className="meta-label" style={{ marginBottom: '1rem', display: 'block' }}>¿Qué nivel de dolor experimentas hoy?</span>
                                
                                {/* Botones del 0 al 10 */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'space-between', marginBottom: '1.8rem' }}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            type="button"
                                            key={num}
                                            onClick={() => setPainLevel(num)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                border: painLevel === num ? '2.5px solid var(--color-brand)' : '1px solid #E2E8F0',
                                                background: getPainColor(num),
                                                color: getPainTextColor(num),
                                                fontWeight: 'bold',
                                                fontSize: '1.05rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transform: painLevel === num ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'all 0.2s ease',
                                                boxShadow: painLevel === num ? '0 5px 15px rgba(85, 169, 138, 0.3)' : 'none'
                                            }}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                {painLevel !== null && (
                                    <div style={{ marginBottom: '1.5rem', background: '#F4FAF8', padding: '0.8rem 1.2rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: getPainTextColor(painLevel) }}>
                                            Escala EVA {painLevel}/10 - {getPainLabel(painLevel)}
                                        </span>
                                    </div>
                                )}

                                <div className="pain-form__input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="meta-label">Observaciones y Síntomas (Opcional)</label>
                                    <textarea
                                        className="pain-form__textarea"
                                        placeholder="Describe dónde sientes el dolor, qué movimientos te molestan o si el ejercicio ha ayudado..."
                                        rows="3"
                                        value={observation}
                                        onChange={e => setObservation(e.target.value)}
                                        style={{ width: '100%', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '14px', outline: 'none', background: '#F9FBFB', resize: 'vertical' }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={painLevel === null} style={{ width: '100%', height: '48px', opacity: painLevel === null ? 0.5 : 1 }}>
                                    Guardar Diario Diario
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E8F5F1', color: '#55A98A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</div>
                                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-text-dark)' }}>¡Diario Completado!</h3>
                                <p style={{ color: 'var(--color-text-soft)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Has registrado tu nivel de dolor de hoy. Tu fisioterapeuta podrá ver estos datos en tiempo real.</p>
                                <button className="btn-ghost" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={() => setSubmitted(false)}>Hacer Otro Registro</button>
                            </div>
                        )}
                    </article>
                </section>

                {/* COLUMNA 2: TIMELINE HISTÓRICO */}
                <section className="grid-col">
                    <h2 className="grid-col__title">Historial de Registros</h2>
                    <article className="dashboard-card" style={{ padding: '1.5rem' }}>
                        {timeline.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.4rem' }}>
                                {timeline.map((entry, idx) => (
                                    <div key={idx} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #EBF0F0', paddingBottom: '0.5rem' }}>
                                        {/* Círculo indicador del timeline */}
                                        <div style={{
                                            position: 'absolute',
                                            left: '-7px',
                                            top: '4px',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: getPainTextColor(entry.nivelDolor),
                                            border: '2px stroke #FFF'
                                        }} />
                                        
                                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: '700' }}>
                                                {new Date(entry.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                padding: '2px 8px',
                                                borderRadius: '8px',
                                                background: getPainColor(entry.nivelDolor),
                                                color: getPainTextColor(entry.nivelDolor)
                                            }}>
                                                EVA {entry.nivelDolor}
                                            </span>
                                        </header>
                                        
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-dark)', lineHeight: '1.4', fontWeight: '500' }}>
                                            {entry.observaciones || <em style={{ color: '#A0AEC0', fontSize: '0.8rem' }}>Sin observaciones añadidas.</em>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#A0AEC0', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Aún no hay registros de evolución cargados.</p>
                        )}
                    </article>
                </section>
            </section>
        </section>
    );
};

export default PatientEvolution;
