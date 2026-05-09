import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [currentExercise, setCurrentExercise] = useState({
        nombre: '', descripcion: '', categoria: 'Fuerza', mediaUrl: '', seriesDefecto: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const categories = ['Movilidad', 'Fuerza', 'Core', 'Estiramiento', 'Equilibrio', 'Otro'];

    const fetchExercises = async () => {
        try {
            const res = await api.get('/exercises');
            setExercises(res.data);
        } catch (err) {
            console.error("Error cargando biblioteca");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/exercises/${currentExercise._id}`, currentExercise);
            } else {
                await api.post('/exercises', currentExercise);
            }
            setShowModal(false);
            setCurrentExercise({ nombre: '', descripcion: '', categoria: 'Fuerza', mediaUrl: '', seriesDefecto: '' });
            setIsEditing(false);
            setShowCategoryList(false);
            fetchExercises();
        } catch (err) {
            alert("Error al guardar el ejercicio");
        }
    };

    const handleEdit = (ex) => {
        setCurrentExercise(ex);
        setIsEditing(true);
        setShowModal(true);
        setShowCategoryList(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este ejercicio de tu biblioteca?")) return;
        try {
            await api.delete(`/exercises/${id}`);
            fetchExercises();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    return (
        <section className="exercise-library-page animate-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#1A2E35', fontWeight: '800' }}>Biblioteca de Ejercicios</h1>
                    <p style={{ color: '#5A6B6D', marginTop: '0.3rem' }}>Gestiona tu catálogo personalizado de ejercicios.</p>
                </div>
                <button className="btn-primary" onClick={() => { setShowModal(true); setIsEditing(false); setCurrentExercise({ nombre: '', descripcion: '', categoria: 'Fuerza', mediaUrl: '', seriesDefecto: '' }); }} style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '12px' }}>
                    + Nuevo Ejercicio
                </button>
            </header>

            {loading ? (
                <p>Cargando biblioteca...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {exercises.length > 0 ? (
                        exercises.map(ex => (
                            <article key={ex._id} className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#55A98A', background: '#E8F5F1', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                        {ex.categoria}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEdit(ex)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6B6D' }}>✎</button>
                                        <button onClick={() => handleDelete(ex._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>✕</button>
                                    </div>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1A2E35' }}>{ex.nombre}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#5A6B6D', flex: 1 }}>{ex.descripcion || 'Sin descripción.'}</p>
                                {ex.mediaUrl && (
                                    <div style={{ fontSize: '0.75rem', color: '#55A98A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>▶</span> Multimedia vinculada
                                    </div>
                                )}
                                <div style={{ borderTop: '1px solid #F0F4F4', paddingTop: '1rem', fontSize: '0.8rem', color: '#A0AEC0' }}>
                                    Sugerencia: {ex.seriesDefecto || 'No definida'}
                                </div>
                            </article>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: '#F9FBFB', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                            <p style={{ color: '#A0AEC0' }}>Tu biblioteca está vacía. Empieza a añadir tus ejercicios favoritos.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '520px', width: '100%', padding: '0', borderRadius: '28px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: 'none', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}>
                        <header style={{ padding: '2rem 2rem 1.5rem', background: '#F9FBFB', borderBottom: '1px solid #F0F4F4', position: 'relative' }}>
                            <h2 style={{ margin: 0, color: '#1A2E35', fontSize: '1.8rem', fontWeight: '800' }}>{isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
                            <p style={{ color: '#5A6B6D', fontSize: '0.85rem', marginTop: '0.4rem' }}>Detalles de tu catálogo personalizado.</p>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6B6D', fontSize: '1rem', fontWeight: 'bold' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            >
                                ✕
                            </button>
                        </header>
                        
                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div className="form-group">
                                    <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Nombre del Ejercicio</label>
                                    <input 
                                        className="dashboard__input"
                                        required 
                                        placeholder="Ej: Sentadilla isométrica"
                                        value={currentExercise.nombre} 
                                        onChange={e => setCurrentExercise({...currentExercise, nombre: e.target.value})} 
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Categoría</label>
                                        <div style={{ position: 'relative' }}>
                                            <div 
                                                onClick={() => setShowCategoryList(!showCategoryList)}
                                                style={{ height: '50px', borderRadius: '12px', border: '1.5px solid #E2E8F0', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#F9FBFB', transition: 'all 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.borderColor = '#55A98A'}
                                                onMouseOut={e => e.currentTarget.style.borderColor = showCategoryList ? '#55A98A' : '#E2E8F0'}
                                            >
                                                <span style={{ color: '#1A2E35', fontWeight: '600', fontSize: '0.9rem' }}>{currentExercise.categoria}</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55A98A" strokeWidth="3" style={{ transform: showCategoryList ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </div>
                                            
                                            {showCategoryList && (
                                                <div className="animate-in" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100, background: '#FFFFFF', borderRadius: '14px', boxShadow: '0 15px 40px rgba(26, 46, 53, 0.12)', border: '1px solid #E2E8F0', padding: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                                                    {categories.map(c => (
                                                        <div 
                                                            key={c} 
                                                            onClick={() => { setCurrentExercise({...currentExercise, categoria: c}); setShowCategoryList(false); }}
                                                            style={{ padding: '0.8rem 1rem', borderRadius: '10px', cursor: 'pointer', color: currentExercise.categoria === c ? '#55A98A' : '#1A2E35', background: currentExercise.categoria === c ? '#F0FAF6' : 'transparent', fontWeight: currentExercise.categoria === c ? '700' : '500', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                                            onMouseOver={e => { if(currentExercise.categoria !== c) e.currentTarget.style.background = '#F9FBFB'; }}
                                                            onMouseOut={e => { if(currentExercise.categoria !== c) e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            {c}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Series</label>
                                        <input 
                                            className="dashboard__input"
                                            placeholder="Ej: 3x12"
                                            value={currentExercise.seriesDefecto} 
                                            onChange={e => setCurrentExercise({...currentExercise, seriesDefecto: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>Instrucciones</label>
                                    <textarea 
                                        className="dashboard__input"
                                        placeholder="Pasos para realizar el ejercicio..."
                                        value={currentExercise.descripcion} 
                                        onChange={e => setCurrentExercise({...currentExercise, descripcion: e.target.value})} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.5rem' }}>URL Multimedia</label>
                                    <input 
                                        className="dashboard__input"
                                        placeholder="Link de vídeo o imagen"
                                        value={currentExercise.mediaUrl} 
                                        onChange={e => setCurrentExercise({...currentExercise, mediaUrl: e.target.value})} 
                                    />
                                </div>

                                <footer style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1, height: '50px', borderRadius: '12px' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, height: '50px', borderRadius: '12px', background: '#55A98A', boxShadow: '0 10px 20px rgba(85, 169, 138, 0.2)' }}>
                                        {isEditing ? 'Actualizar' : 'Guardar Ejercicio'}
                                    </button>
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

export default ExerciseLibrary;
