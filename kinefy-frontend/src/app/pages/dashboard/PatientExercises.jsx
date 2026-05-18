import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { ExercisesIcon } from '../../components/dashboard/DashboardIcons';

const PatientExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExercise, setSelectedExercise] = useState(null);
    
    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
        return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await api.get('/patients/me');
                setExercises(res.data.ejercicios || []);
                if (res.data.ejercicios?.length > 0) {
                    setSelectedExercise(res.data.ejercicios[0]);
                }
            } catch (err) {
                console.error("Error al cargar ejercicios", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExercises();
    }, []);

    const toggleExercise = async (id) => {
        const ex = exercises.find(e => e._id === id);
        try {
            await api.put(`/patients/exercises/${id}`, { completado: !ex.completado });
            setExercises(prev => prev.map(e => e._id === id ? { ...e, completado: !e.completado } : e));
            if (selectedExercise?._id === id) {
                setSelectedExercise({ ...selectedExercise, completado: !selectedExercise.completado });
            }
        } catch (err) {
            console.error("Error al actualizar ejercicio", err);
        }
    };

    if (loading) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1.5rem', color: '#5A6B6D' }}>Cargando tu plan de ejercicios...</p>
        </div>
    );

    return (
        <main className="patient-exercises animate-in">
            {/* LISTA DE EJERCICIOS (IZQUIERDA) */}
            <aside className="patient-exercises__sidebar">
                <header>
                    <h1 className="home-header__title">Mi Plan</h1>
                    <p className="home-header__subtitle">{exercises.filter(e => e.completado).length}/{exercises.length} completados hoy</p>
                </header>

                <div className="patient-exercises__list">
                    {exercises.map(ex => (
                        <article 
                            key={ex._id}
                            onClick={() => setSelectedExercise(ex)}
                            className={`patient-exercises__card ${selectedExercise?._id === ex._id ? 'patient-exercises__card--active' : ''}`}
                        >
                            <div className="flex-between align-center">
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, color: '#1A2E35', fontSize: '1rem', fontWeight: '700' }}>{ex.nombre}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#5A6B6D' }}>{ex.series}</span>
                                </div>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleExercise(ex._id); }}
                                    style={{ 
                                        width: '28px', height: '28px', borderRadius: '8px', 
                                        background: ex.completado ? '#55A98A' : '#E2E8F0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#FFF', transition: 'all 0.2s'
                                    }}
                                >
                                    {ex.completado && <span style={{ fontSize: '0.9rem' }}>✓</span>}
                                </div>
                            </div>
                        </article>
                    ))}
                    {exercises.length === 0 && (
                        <p className="empty-state">No tienes ejercicios asignados.</p>
                    )}
                </div>
            </aside>

            {/* DETALLE DEL EJERCICIO (DERECHA) */}
            <section className="patient-exercises__content">
                {selectedExercise ? (
                    <>
                        <div className="patient-exercises__header-flex flex-between align-start mb-4">
                            <div>
                                <span className="status-badge status-badge--done">Instrucciones de tu Fisio</span>
                                <h2 className="card-title-big mt-3 mb-1">{selectedExercise.nombre}</h2>
                                <p className="card-subtitle">Objetivo: {selectedExercise.series}</p>
                            </div>
                            <button 
                                onClick={() => toggleExercise(selectedExercise._id)}
                                className={selectedExercise.completado ? "btn-ghost" : "btn-primary"}
                                style={{ width: 'auto', padding: '0 2rem', height: '54px', borderRadius: '14px' }}
                            >
                                {selectedExercise.completado ? "Completado ✓" : "Marcar como hecho"}
                            </button>
                        </div>

                        <div className="patient-exercises__grid">
                            <div style={{ overflowY: 'auto', paddingRight: '1rem' }}>
                                <h4 className="meta-label mb-3">Cómo realizar el ejercicio</h4>
                                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#1A2E35', whiteSpace: 'pre-wrap' }}>
                                    {selectedExercise.descripcion || "Tu fisioterapeuta no ha añadido instrucciones específicas para este ejercicio, pero recuerda seguir las indicaciones dadas en consulta."}
                                </div>
                                
                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#F9FBFB', borderRadius: '20px', border: '1px solid #F0F4F4' }}>
                                    <h5 style={{ margin: '0 0 0.5rem', color: '#55A98A' }}>Recordatorio Clínico</h5>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#5A6B6D' }}>Si sientes dolor agudo durante la ejecución, detén el ejercicio y consulta con tu profesional en la próxima cita.</p>
                                </div>
                            </div>

                            <div className="patient-exercises__media">
                                {selectedExercise.mediaUrl ? (
                                    selectedExercise.mediaUrl.includes('youtube.com') || selectedExercise.mediaUrl.includes('vimeo.com') ? (
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={selectedExercise.mediaUrl.replace('watch?v=', 'embed/')} 
                                            title="Vídeo de ejercicio"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    ) : isVideo(selectedExercise.mediaUrl) ? (
                                        <video 
                                            src={selectedExercise.mediaUrl} 
                                            controls 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                                        />
                                    ) : (
                                        <img src={selectedExercise.mediaUrl} alt={selectedExercise.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )
                                ) : (
                                    <div className="empty-state--centered">
                                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🧘‍♂️</div>
                                        <p style={{ color: '#A0AEC0', maxWidth: '200px' }}>Sin contenido multimedia asignado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state--centered" style={{ flex: 1 }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
                        <h3 className="card-title-big">Selecciona un ejercicio</h3>
                        <p className="card-subtitle">Pulsa en la lista para ver los detalles.</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default PatientExercises;
