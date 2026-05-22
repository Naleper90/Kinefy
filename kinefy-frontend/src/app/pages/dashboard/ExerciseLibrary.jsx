import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';
import { SearchIcon, PlusIcon, UploadIcon } from '../../components/dashboard/DashboardIcons';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentExercise, setCurrentExercise] = useState({
        nombre: '', descripcion: '', categoria: 'Fuerza', mediaUrl: '', seriesDefecto: ''
    });
    const [statusMsg, setStatusMsg] = useState(null);
    const [uploading, setUploading] = useState(false);

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentExercise(prev => ({ ...prev, mediaUrl: res.data.url }));
            showNotification("Archivo multimedia subido correctamente");
        } catch (err) {
            showNotification("Error al subir el archivo");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
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
        fetchExercises();
    }, []);

    const filteredExercises = exercises.filter(ex => 
        ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exercisesByCategory = filteredExercises.reduce((acc, ex) => {
        const cat = ex.categoria || 'Sin Categoría';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
        return acc;
    }, {});

    const categoriesList = Object.keys(exercisesByCategory).sort();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/exercises/${currentExercise._id}`, currentExercise);
                showNotification("Ejercicio actualizado con éxito");
            } else {
                await api.post('/exercises', currentExercise);
                showNotification("Ejercicio creado con éxito");
            }
            setShowModal(false);
            const res = await api.get('/exercises');
            setExercises(res.data);
        } catch (err) {
            showNotification("Error al guardar el ejercicio");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este ejercicio?")) return;
        try {
            await api.delete(`/exercises/${id}`);
            setExercises(exercises.filter(ex => ex._id !== id));
            showNotification("Ejercicio eliminado con éxito");
        } catch (err) {
            showNotification("Error al eliminar");
        }
    };

    return (
        <main className="patients-page animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}
            <header className="patients-header">
                <hgroup>
                    <h1 className="home-header__title">Biblioteca de Ejercicios</h1>
                    <p className="home-header__subtitle">Gestiona tu catálogo personalizado de ejercicios.</p>
                </hgroup>
                
                <nav className="patients-controls">
                    <div className="patients-search">
                        <span className="patients-search__icon"><SearchIcon strokeWidth={2.5} /></span>
                        <input 
                            type="text" 
                            placeholder="Buscar ejercicio..." 
                            className="patients-search__input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button className="btn-callout" onClick={() => { setShowModal(true); setIsEditing(false); setCurrentExercise({ nombre: '', descripcion: '', categoria: 'Fuerza', mediaUrl: '', seriesDefecto: '' }); }}>
                        <PlusIcon />
                        <span>Nuevo Ejercicio</span>
                    </button>
                </nav>
            </header>

            {loading ? (
                <div className="empty-state--centered">
                    <p>Cargando biblioteca...</p>
                </div>
            ) : (
                <div className="exercise-folders">
                    {categoriesList.length > 0 ? (
                        categoriesList.map(cat => (
                            <details key={cat} className="reports__folder" open={searchTerm.length > 0}>
                                <summary className="reports__folder-summary">
                                    <hgroup className="reports__folder-info">
                                        <div className="folder-icon-wrapper">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4H9L11 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" strokeLinejoin="round"/><path d="M12 11V15M10 13H14" strokeLinecap="round"/><rect x="10" y="8" width="4" height="1" rx="0.5" fill="currentColor"/></svg>
                                        </div>
                                        <strong className="reports__folder-name">{cat}</strong>
                                    </hgroup>
                                    <span className="meta-label">{exercisesByCategory[cat].length} ejercicios</span>
                                </summary>
                                
                                <section className="exercise-grid">
                                    {exercisesByCategory[cat].map((ex) => (
                                        <article key={ex._id} className="exercise-card">
                                            <header className="exercise-card__header">
                                                <span className={`category-badge category-badge--${ex.categoria?.toLowerCase() || 'fuerza'}`}>
                                                    {ex.categoria}
                                                </span>
                                                <nav className="exercise-card__actions">
                                                    <button className="exercise-card__btn exercise-card__btn--edit" onClick={() => { setShowModal(true); setIsEditing(true); setCurrentExercise(ex); }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button className="exercise-card__btn exercise-card__btn--delete" onClick={() => handleDelete(ex._id)}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                </nav>
                                            </header>
                                            
                                            <h3 className="exercise-card__title">{ex.nombre}</h3>
                                            <p className="exercise-card__description">{ex.descripcion || 'Sin descripción.'}</p>
                                            
                                            <footer className="exercise-card__footer">
                                                {ex.mediaUrl ? (
                                                    <a href={ex.mediaUrl} target="_blank" rel="noopener noreferrer" className="exercise-card__media-link">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        Multimedia
                                                    </a>
                                                ) : (
                                                    <span className="exercise-card__meta--disabled">Sin multimedia</span>
                                                )}
                                                <span className="exercise-card__meta">Reps: {ex.seriesDefecto || '-'}</span>
                                            </footer>
                                        </article>
                                    ))}
                                </section>
                            </details>
                        ))
                    ) : (
                        <div className="empty-state-card">
                            <p>No se han encontrado resultados.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-container--premium">
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">{isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
                            <p className="modal-header__subtitle">Detalles de tu catálogo personalizado.</p>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form id="exerciseForm" onSubmit={handleSubmit} className="clinical-form">
                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Nombre del Ejercicio</label>
                                    <input 
                                        className="input-clinical"
                                        type="text" 
                                        placeholder="Ej: Sentadilla Goblet"
                                        value={currentExercise.nombre} 
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, nombre: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">Descripción / Instrucciones</label>
                                    <textarea 
                                        className="textarea-clinical"
                                        placeholder="Describe la ejecución técnica..."
                                        value={currentExercise.descripcion} 
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, descripcion: e.target.value })} 
                                    />
                                </div>

                                <div className="clinical-form-row">
                                    <div className="clinical-input-group relative">
                                        <label className="meta-label meta-label--brand">Categoría</label>
                                        <div className="select-clinical__trigger" onClick={() => setShowCategoryList(!showCategoryList)}>
                                            <span>{currentExercise.categoria}</span>
                                            <svg className={`chevron ${showCategoryList ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        {showCategoryList && (
                                            <div className="select-clinical__dropdown animate-in">
                                                {['Fuerza', 'Movilidad', 'Flexibilidad', 'Cardio', 'Core', 'Equilibrio', 'Otro'].map(cat => (
                                                    <div 
                                                        key={cat} 
                                                        className={`select-clinical__option ${currentExercise.categoria === cat ? 'select-clinical__option--selected' : ''}`}
                                                        onClick={() => { setCurrentExercise({...currentExercise, categoria: cat}); setShowCategoryList(false); }}
                                                    >
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="clinical-input-group">
                                        <label className="meta-label meta-label--brand">Series/Reps</label>
                                        <input 
                                            className="input-clinical"
                                            type="text" 
                                            placeholder="Ej: 3x12"
                                            value={currentExercise.seriesDefecto} 
                                            onChange={(e) => setCurrentExercise({ ...currentExercise, seriesDefecto: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="clinical-input-group">
                                    <label className="meta-label meta-label--brand">URL Multimedia o Archivo Propio</label>
                                    <div className="exercise-card__media-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                        <input 
                                            className="input-clinical"
                                            type="text" 
                                            placeholder="YouTube, Vimeo o archivo subido..."
                                            value={currentExercise.mediaUrl} 
                                            onChange={(e) => setCurrentExercise({ ...currentExercise, mediaUrl: e.target.value })} 
                                            style={{ flex: 1, margin: 0 }}
                                        />
                                        <label className="btn-upload-label" style={{ margin: 0, padding: '10px 14px', height: '100%', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                            <UploadIcon size={14} />
                                            <span>{uploading ? '...' : 'Subir'}</span>
                                            <input 
                                                type="file" 
                                                hidden 
                                                onChange={handleFileUpload} 
                                                accept="image/*,video/*" 
                                            />
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <footer className="modal-footer--clinical">
                            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="submit" form="exerciseForm" className="btn-primary--soft">
                                {isEditing ? 'Actualizar' : 'Guardar Ejercicio'}
                            </button>
                        </footer>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
};

export default ExerciseLibrary;
