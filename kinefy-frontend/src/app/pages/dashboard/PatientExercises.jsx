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
        <div className="patient-exercises__loading-wrapper">
            <div className="loader loader--margin-auto"></div>
            <p className="patient-exercises__loading-text">Cargando tu plan de ejercicios...</p>
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
                            <div className="patient-exercises__card-header">
                                <div className="patient-exercises__card-info">
                                    <h4 className="patient-exercises__card-title">{ex.nombre}</h4>
                                    <span className="patient-exercises__card-meta">{ex.series}</span>
                                </div>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleExercise(ex._id); }}
                                    className={`patient-exercises__checkbox ${ex.completado ? 'patient-exercises__checkbox--completed' : ''}`}
                                >
                                    {ex.completado && <span className="patient-exercises__checkbox-check">✓</span>}
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
                        <div className="patient-exercises__header-flex">
                            <div>
                                <span className="status-badge status-badge--done">Instrucciones de tu Fisio</span>
                                <h2 className="card-title-big patient-exercises__title">{selectedExercise.nombre}</h2>
                                <p className="card-subtitle">Objetivo: {selectedExercise.series}</p>
                            </div>
                            <button 
                                onClick={() => toggleExercise(selectedExercise._id)}
                                className={selectedExercise.completado ? "btn-ghost patient-exercises__action-btn" : "btn-primary patient-exercises__action-btn"}
                            >
                                {selectedExercise.completado ? "Completado ✓" : "Marcar como hecho"}
                            </button>
                        </div>

                        <div className="patient-exercises__grid">
                            <div className="patient-exercises__desc-col">
                                <h4 className="meta-label patient-exercises__section-label">Cómo realizar el ejercicio</h4>
                                <div className="patient-exercises__instructions">
                                    {selectedExercise.descripcion || "Tu fisioterapeuta no ha añadido instrucciones específicas para este ejercicio, pero recuerda seguir las indicaciones dadas en consulta."}
                                </div>
                                
                                <div className="patient-exercises__clinical-alert">
                                    <h5 className="patient-exercises__clinical-alert-title">Recordatorio Clínico</h5>
                                    <p className="patient-exercises__clinical-alert-text">Si sientes dolor agudo durante la ejecución, detén el ejercicio y consulta con tu profesional en la próxima cita.</p>
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
                                            className="patient-exercises__video"
                                        />
                                    ) : (
                                        <img src={selectedExercise.mediaUrl} alt={selectedExercise.nombre} className="patient-exercises__image" />
                                    )
                                ) : (
                                    <div className="empty-state--centered">
                                        <div className="patient-exercises__empty-icon">🧘‍♂️</div>
                                        <p className="patient-exercises__empty-text">Sin contenido multimedia asignado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state--centered empty-state--flex-1">
                        <div className="patient-exercises__empty-icon patient-exercises__empty-icon--small">👋</div>
                        <h3 className="card-title-big">Selecciona un ejercicio</h3>
                        <p className="card-subtitle">Pulsa en la lista para ver los detalles.</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default PatientExercises;
