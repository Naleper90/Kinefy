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
        <main className="patient-exercises animate-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: '2rem' }}>
            {/* LISTA DE EJERCICIOS (IZQUIERDA) */}
            <aside style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <header style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#1A2E35', fontWeight: '800', margin: 0 }}>Mi Plan</h1>
                    <p style={{ color: '#5A6B6D', fontSize: '0.9rem', marginTop: '0.4rem' }}>{exercises.filter(e => e.completado).length}/{exercises.length} completados hoy</p>
                </header>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {exercises.map(ex => (
                        <article 
                            key={ex._id}
                            onClick={() => setSelectedExercise(ex)}
                            style={{ 
                                padding: '1.2rem', 
                                background: selectedExercise?._id === ex._id ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                                borderRadius: '20px',
                                border: '1.5px solid',
                                borderColor: selectedExercise?._id === ex._id ? '#55A98A' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                boxShadow: selectedExercise?._id === ex._id ? '0 10px 25px rgba(85, 169, 138, 0.15)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <p style={{ textAlign: 'center', color: '#A0AEC0', padding: '2rem' }}>No tienes ejercicios asignados.</p>
                    )}
                </div>
            </aside>

            {/* DETALLE DEL EJERCICIO (DERECHA) */}
            <section style={{ flex: 1, background: '#FFFFFF', borderRadius: '32px', padding: '2.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
                {selectedExercise ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <span style={{ background: '#E8F5F1', color: '#55A98A', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Instrucciones de tu Fisio</span>
                                <h2 style={{ fontSize: '2.4rem', color: '#1A2E35', fontWeight: '800', margin: '0.8rem 0 0.4rem' }}>{selectedExercise.nombre}</h2>
                                <p style={{ fontSize: '1.2rem', color: '#5A6B6D', fontWeight: '600' }}>Objetivo: {selectedExercise.series}</p>
                            </div>
                            <button 
                                onClick={() => toggleExercise(selectedExercise._id)}
                                className={selectedExercise.completado ? "btn-ghost" : "btn-primary"}
                                style={{ width: 'auto', padding: '0 2rem', height: '54px', borderRadius: '14px' }}
                            >
                                {selectedExercise.completado ? "Completado ✓" : "Marcar como hecho"}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem', flex: 1, overflow: 'hidden' }}>
                            <div style={{ overflowY: 'auto', paddingRight: '1rem' }}>
                                <h4 className="meta-label" style={{ marginBottom: '1.2rem' }}>Cómo realizar el ejercicio</h4>
                                <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#1A2E35', whiteSpace: 'pre-wrap' }}>
                                    {selectedExercise.descripcion || "Tu fisioterapeuta no ha añadido instrucciones específicas para este ejercicio, pero recuerda seguir las indicaciones dadas en consulta."}
                                </div>
                                
                                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#F9FBFB', borderRadius: '20px', border: '1px solid #F0F4F4' }}>
                                    <h5 style={{ margin: '0 0 0.5rem', color: '#55A98A' }}>Recordatorio Clínico</h5>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#5A6B6D' }}>Si sientes dolor agudo durante la ejecución, detén el ejercicio y consulta con tu profesional en la próxima cita.</p>
                                </div>
                            </div>

                            <div style={{ background: '#F0F4F4', borderRadius: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🧘‍♂️</div>
                                        <p style={{ color: '#A0AEC0', maxWidth: '200px' }}>Sin contenido multimedia asignado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
                        <h3 style={{ color: '#1A2E35' }}>Selecciona un ejercicio</h3>
                        <p style={{ color: '#5A6B6D' }}>Pulsa en la lista de la izquierda para ver los detalles.</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default PatientExercises;
