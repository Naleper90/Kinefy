import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { KneeIcon, BlobIcon } from '../../components/dashboard/DashboardIcons';
import { generatePatientReport } from '../../utils/pdfGenerator';


const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evolution, setEvolution] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const [editForm, setEditForm] = useState({ 
        nombre: '', email: '', password: '', 
        telefono: '', profesion: '', actividadFisica: '',
        diagnostico: '', notas: '', ejercicios: []
    });
    const [statusMsg, setStatusMsg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showActivityMenu, setShowActivityMenu] = useState(false);
    const [newDoc, setNewDoc] = useState({ nombre: '', url: '' });
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [library, setLibrary] = useState([]);
    const [showLibraryModal, setShowLibraryModal] = useState(false);


    const activityOptions = [
        { value: 'sedentario', label: 'Sedentario (Oficina / Poco movimiento)' },
        { value: 'moderado', label: 'Moderado (1-3 días / semana)' },
        { value: 'activo', label: 'Activo (4-6 días / semana)' },
        { value: 'atleta', label: 'Atleta (Alto rendimiento)' }
    ];

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const fetchPatientData = async () => {
        try {
            const res = await api.get(`/patients`); 
            const found = res.data.find(p => p._id === id);
            setPatient(found);
            setEditForm({ 
                nombre: found.nombre || '', 
                email: found.email || '',
                password: '',
                telefono: found.telefono || '',
                profesion: found.profesion || '',
                actividadFisica: found.actividadFisica || 'moderado',
                diagnostico: found.diagnostico || '',
                notas: found.notas || '',
                ejercicios: found.ejercicios || []
            });

            const resEv = await api.get(`/patients/evolution/${id}`);
            setEvolution(resEv.data);

            const resAppts = await api.get('/appointments');
            const patientAppts = resAppts.data.filter(a => a.paciente?._id === id);
            setAppointments(patientAppts);

            const resLib = await api.get('/exercises');
            setLibrary(resLib.data);
        } catch (err) {

            // Error manejado silenciosamente
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchPatientData();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const dataToSend = { ...editForm };
            if (!dataToSend.password) delete dataToSend.password;
            dataToSend.ejercicios = dataToSend.ejercicios.filter(ex => ex.nombre && ex.nombre.trim() !== '');

            await api.put(`/patients/${id}`, dataToSend);
            setPatient({ ...patient, ...dataToSend });
            setIsEditing(false);
            showNotification("Ficha clínica actualizada y sincronizada");
        } catch (err) {
            showNotification("Error al guardar los cambios en el servidor");
        }
    };

    const addExercise = () => {
        setEditForm({
            ...editForm,
            ejercicios: [...editForm.ejercicios, { nombre: '', series: '', completado: false }]
        });
    };

    const removeExercise = (index) => {
        const newEx = [...editForm.ejercicios];
        newEx.splice(index, 1);
        setEditForm({ ...editForm, ejercicios: newEx });
    };

    const importFromLibrary = (libEx) => {
        setEditForm({
            ...editForm,
            ejercicios: [...editForm.ejercicios, { 
                nombre: libEx.nombre, 
                series: libEx.seriesDefecto || '', 
                completado: false,
                mediaUrl: libEx.mediaUrl || '' 
            }]
        });
        setShowLibraryModal(false);
        showNotification(`Ejercicio "${libEx.nombre}" importado`);
    };


    const updateExercise = (index, field, value) => {
        const newEx = [...editForm.ejercicios];
        newEx[index][field] = value;
        setEditForm({ ...editForm, ejercicios: newEx });
    };

    const handleFileUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateExercise(index, 'mediaUrl', res.data.url);
            showNotification("Archivo multimedia subido correctamente");
        } catch (err) {
            showNotification("Error al subir el archivo");
        } finally {
            setUploading(false);
        }
    };

    const handleAddDocument = async () => {
        if (!newDoc.nombre) return;
        try {
            // En un entorno real, aquí subiríamos el archivo y obtendríamos la URL
            // Por ahora simulamos la subida registrando el nombre del informe
            const res = await api.post(`/patients/${id}/documents`, { 
                nombre: newDoc.nombre, 
                url: newDoc.url || '#' 
            });
            setPatient({ ...patient, informes: res.data });
            setNewDoc({ nombre: '', url: '' });
            setIsAddingDoc(false);
            showNotification("Documento adjuntado correctamente");
        } catch (err) {
            showNotification("Error al subir el documento");
        }
    };

    const handleDeleteDocument = async (docId) => {
        try {
            const res = await api.delete(`/patients/${id}/documents/${docId}`);
            setPatient({ ...patient, informes: res.data });
            showNotification("Documento eliminado del expediente");
        } catch (err) {
            showNotification("Error al eliminar el documento");
        }
    };

    if (loading) return <p style={{ padding: '3rem', textAlign: 'center' }}>Cargando expediente clínico...</p>;
    if (!patient) return <p style={{ padding: '3rem', textAlign: 'center' }}>Paciente no encontrado.</p>;

    const initials = patient.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <main className="patient-detail animate-in">
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}

            <header className="patient-detail__header">
                <nav className="patient-detail__nav">
                    <button onClick={() => navigate('/dashboard/physio/patients')} className="btn-back">
                        ← Volver al listado
                    </button>
                </nav>
                
                <section className="patient-detail__identity">
                    <div className="patient-detail__profile">
                        <figure className="patient-avatar patient-avatar--large">
                            <BlobIcon color="#E8F5F1" />
                            <span className="patient-avatar__initials">{initials}</span>
                        </figure>
                        <div className="patient-detail__info">
                            {isEditing ? (
                                <input 
                                    className="auth__input auth__input--title"
                                    value={editForm.nombre}
                                    onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                                />
                            ) : (
                                <h1 className="patient-detail__name">{patient.nombre}</h1>
                            )}
                            <p className="patient-detail__id">Expediente Clínico # {patient._id.substring(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="patient-detail__actions" style={{ display: 'flex', gap: '1rem' }}>
                        {!isEditing && (
                            <button 
                                className="btn-ghost" 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#55A98A', color: '#55A98A' }}
                                onClick={() => generatePatientReport(patient, appointments)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Descargar Informe PDF
                            </button>
                        )}
                        {isEditing ? (
                            <>
                                <button className="btn-ghost" onClick={() => setIsEditing(false)}>Cancelar</button>
                                <button className="btn-primary" onClick={handleUpdate}>Guardar Cambios</button>
                            </>
                        ) : (
                            <button className="btn-primary" onClick={() => setIsEditing(true)}>Editar Ficha</button>
                        )}
                    </div>

                </section>
            </header>

            <section className="dashboard-grid">
                {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
                <article className="dashboard-card patient-detail__card">
                    <h3 className="card-title-big">Información General</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
                        
                        <div className="form-group">
                            <label className="meta-label">Email de Acceso</label>
                            {isEditing ? (
                                <input className="auth__input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                            ) : (
                                <span className="activity-list__value" style={{ fontSize: '1rem' }}>{patient.email}</span>
                            )}
                        </div>

                        {isEditing && (
                            <div className="form-group">
                                <label className="meta-label">Nueva Contraseña (Opcional)</label>
                                <input className="auth__input" type="password" placeholder="Mín. 6 caracteres" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="meta-label">Teléfono</label>
                            {isEditing ? (
                                <input className="auth__input" value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} />
                            ) : (
                                <span className="activity-list__value">{patient.telefono || 'No registrado'}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Profesión</label>
                            {isEditing ? (
                                <input className="dashboard__input" value={editForm.profesion} onChange={e => setEditForm({...editForm, profesion: e.target.value})} />
                            ) : (
                                <span className="activity-list__value">{patient.profesion || 'No registrada'}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Actividad Física</label>
                            {isEditing ? (
                                <div className="custom-select-container" style={{ position: 'relative' }}>
                                    <div 
                                        className="auth__input" 
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => setShowActivityMenu(!showActivityMenu)}
                                    >
                                        <span>{activityOptions.find(o => o.value === editForm.actividadFisica)?.label || 'Seleccionar...'}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                    {showActivityMenu && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 10, border: '1px solid #eee' }}>
                                            {activityOptions.map(o => (
                                                <div key={o.value} style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => { setEditForm({...editForm, actividadFisica: o.value}); setShowActivityMenu(false); }}>
                                                    {o.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="activity-list__value" style={{ textTransform: 'capitalize' }}>{patient.actividadFisica}</span>
                            )}
                        </div>
                    </div>
                </article>

                {/* COLUMNA DERECHA: TRATAMIENTO Y EJERCICIOS */}
                <article className="dashboard-card patient-detail__card patient-detail__card--wide">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="card-title-big">Plan de Entrenamiento</h3>
                        {isEditing && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-ghost" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: '#55A98A', color: '#55A98A' }} onClick={() => setShowLibraryModal(true)}>
                                    📚 Biblioteca
                                </button>
                                <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={addExercise}>
                                    + Nuevo
                                </button>
                            </div>
                        )}
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isEditing ? (
                            editForm.ejercicios.map((ex, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#F9FBFB', padding: '1rem', borderRadius: '16px', border: '1px solid #F0F4F4' }}>
                                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                        <input 
                                            className="dashboard__input" 
                                            placeholder="Nombre ejercicio" 
                                            style={{ flex: 2, height: '44px' }}
                                            value={ex.nombre} 
                                            onChange={e => updateExercise(i, 'nombre', e.target.value)} 
                                        />
                                        <input 
                                            className="dashboard__input" 
                                            placeholder="3x12, 1min..." 
                                            style={{ flex: 1, height: '44px' }}
                                            value={ex.series} 
                                            onChange={e => updateExercise(i, 'series', e.target.value)} 
                                        />
                                        <button 
                                            onClick={() => removeExercise(i)}
                                            style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            className="dashboard__input" 
                                            placeholder="URL de Vídeo o Imagen (opcional)" 
                                            style={{ fontSize: '0.75rem', height: '36px', borderRadius: '8px', flex: 1 }}
                                            value={ex.mediaUrl || ''} 
                                            onChange={e => updateExercise(i, 'mediaUrl', e.target.value)} 
                                        />
                                        <label className="btn-ghost" style={{ height: '36px', padding: '0 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', borderColor: '#55A98A', color: '#55A98A', whiteSpace: 'nowrap' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            {uploading ? '...' : 'Subir'}
                                            <input type="file" hidden onChange={e => handleFileUpload(e, i)} accept="image/*,video/*" />
                                        </label>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <ul className="exercise-list">
                                {patient.ejercicios?.filter(ex => ex.nombre).length > 0 ? (
                                    patient.ejercicios.filter(ex => ex.nombre).map((ex, i) => (
                                        <li key={i} className={`exercise-list__item ${ex.completado ? 'exercise-list__item--done' : ''}`}>
                                            <span className="exercise-list__check">{ex.completado ? '✓' : ''}</span>
                                            <section className="exercise-list__info">
                                                <span className="exercise-list__name">{ex.nombre}</span>
                                                <span className="exercise-list__series">{ex.series}</span>
                                            </section>
                                        </li>
                                    ))
                                ) : (
                                    <p className="empty-state">No hay ejercicios asignados todavía.</p>
                                )}
                            </ul>
                        )}
                    </div>

                    <div style={{ marginTop: '2.5rem' }}>
                        <label className="meta-label" style={{ fontWeight: '700', color: '#55A98A', marginBottom: '0.8rem', display: 'block' }}>Diagnóstico Clínico</label>
                        {isEditing ? (
                            <textarea 
                                className="dashboard__input" 
                                placeholder="Escribe aquí el diagnóstico detallado..."
                                value={editForm.diagnostico} 
                                onChange={e => setEditForm({...editForm, diagnostico: e.target.value})} 
                            />
                        ) : (
                            <div style={{ background: '#F9FBFB', padding: '1.5rem', borderRadius: '18px', border: '1px solid #F0F4F4', marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.95rem', color: '#1A2E35', margin: 0, lineHeight: '1.6' }}>
                                    {patient.diagnostico || 'Pendiente de valoración clínica.'}
                                </p>
                            </div>
                        )}
                    </div>
                </article>

                {/* DOCUMENTACIÓN CLÍNICA */}
                <article className="dashboard-card patient-detail__card patient-detail__card--full" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FBFB 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 className="card-title-big">Documentación Clínica</h3>
                            <p style={{ fontSize: '0.85rem', color: '#5A6B6D', marginTop: '0.3rem' }}>Informes externos, radiografías y derivaciones en PDF.</p>
                        </div>
                        {isEditing && (
                            <button className="btn-primary" onClick={() => setIsAddingDoc(true)} style={{ width: 'auto', padding: '0 1.2rem', borderRadius: '12px' }}>
                                + Adjuntar Informe
                            </button>
                        )}
                    </div>

                    {isAddingDoc && (
                        <div className="animate-in" style={{ background: '#E8F5F1', padding: '1.5rem', borderRadius: '18px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', border: '1.5px dashed #55A98A' }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="meta-label">Nombre del Documento</label>
                                <input className="auth__input" placeholder="Ej: Resonancia Rodilla Izquierda" value={newDoc.nombre} onChange={e => setNewDoc({...newDoc, nombre: e.target.value})} style={{ background: '#FFF' }} />
                            </div>
                            <div className="form-group" style={{ flex: 1.5 }}>
                                <label className="meta-label">Archivo / Enlace</label>
                                <input className="auth__input" placeholder="Subir PDF o pegar link..." value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} style={{ background: '#FFF' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-ghost" onClick={() => setIsAddingDoc(false)} style={{ height: '54px', borderRadius: '12px' }}>Cancelar</button>
                                <button className="btn-primary" onClick={handleAddDocument} style={{ height: '54px', borderRadius: '12px', padding: '0 1.5rem' }}>Adjuntar</button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {patient.informes?.length > 0 ? (
                            patient.informes.map((doc, i) => (
                                <article key={doc._id || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', background: '#FFFFFF', borderRadius: '18px', border: '1px solid #F0F4F4', transition: 'transform 0.2s' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FDF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E57373' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1A2E35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.nombre}</h4>
                                        <time style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>{new Date(doc.fecha).toLocaleDateString()}</time>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55A98A' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </a>
                                        {isEditing && (
                                            <button onClick={() => handleDeleteDocument(doc._id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FDF2F2', border: 'none', color: '#E57373', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: '#F9FBFB', borderRadius: '18px', border: '1px dashed #E2E8F0' }}>
                                <p style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>No hay documentos adjuntos en este expediente.</p>
                            </div>
                        )}
                    </div>
                </article>

                <article className="dashboard-card patient-detail__card patient-detail__card--full">
                    <h3 className="card-title-big">Evolución del Dolor (Escala EVA)</h3>
                    {evolution.length > 0 ? (
                        <section className="evolution-chart">
                            <div className="evolution-chart__bars">
                                {evolution.map((e, i) => (
                                    <div key={i} className="evolution-chart__bar-container">
                                        <div 
                                            className="evolution-chart__bar" 
                                            style={{ height: `${e.nivelDolor * 10}%`, opacity: 0.3 + (i / evolution.length) }} 
                                        />
                                        <span className="evolution-chart__label">EVA {e.nivelDolor}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="evolution-chart__note">* Datos extraídos del diario clínico.</p>
                        </section>
                    ) : (
                        <p className="empty-state empty-state--centered">El paciente aún no ha registrado datos de dolor.</p>
                    )}
                </article>
            </section>

            {/* MODAL DE BIBLIOTECA */}
            {showLibraryModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '580px', width: '100%', padding: '0', borderRadius: '28px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: 'none', boxShadow: '0 40px 100px rgba(0,0,0,0.25)' }}>
                        <header style={{ padding: '2rem 2.5rem 1.5rem', background: '#F9FBFB', borderBottom: '1px solid #F0F4F4', position: 'relative' }}>
                            <h2 style={{ margin: 0, color: '#1A2E35', fontSize: '1.8rem', fontWeight: '800' }}>Biblioteca de Ejercicios</h2>
                            <p style={{ color: '#5A6B6D', fontSize: '0.85rem', marginTop: '0.4rem' }}>Selecciona un ejercicio para añadirlo al plan de este paciente.</p>
                            <button 
                                onClick={() => setShowLibraryModal(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6B6D', fontSize: '1rem', fontWeight: 'bold' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            >
                                ✕
                            </button>
                        </header>
                        
                        <div style={{ padding: '2rem 2.5rem', overflowY: 'auto', flex: 1 }}>
                            {library.length > 0 ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {library.map(ex => (
                                        <article 
                                            key={ex._id} 
                                            onClick={() => importFromLibrary(ex)} 
                                            style={{ padding: '1.2rem', border: '1.5px solid #F0F4F4', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = '#55A98A'; e.currentTarget.style.background = '#F8FFFE'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = '#F0F4F4'; e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div>
                                                <h4 style={{ margin: 0, color: '#1A2E35', fontSize: '1.05rem', fontWeight: '700' }}>{ex.nombre}</h4>
                                                <span style={{ fontSize: '0.75rem', color: '#55A98A', fontWeight: '800', textTransform: 'uppercase' }}>{ex.categoria}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#1A2E35', fontWeight: '600' }}>{ex.seriesDefecto || '—'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#A0AEC0' }}>Series Sugeridas</div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                                    <p style={{ color: '#5A6B6D', margin: 0 }}>No tienes ejercicios en la biblioteca.</p>
                                    <button className="btn-ghost" onClick={() => navigate('/dashboard/physio/exercises')}>Ir a Biblioteca</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </main>
    );
};

export default PatientDetail;

