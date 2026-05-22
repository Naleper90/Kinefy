import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import {
    KneeIcon,
    BlobIcon,
    DownloadIcon,
    EditIcon,
    CheckIcon,
    SaveIcon,
    ArrowLeftIcon,
    TrashIcon,
    UploadIcon,
    ChevronIcon,
    FilePdfIcon
} from '../../components/dashboard/DashboardIcons';
import { generatePatientReport } from '../../utils/pdfGenerator';

/**
 * Componente Detalle del Paciente
 * Gestiona la visualización y edición de la ficha clínica, plan de ejercicios
 * y documentación médica del paciente.
 */
const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evolution, setEvolution] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const [editForm, setEditForm] = useState({
        nombre: '', email: '',
        telefono: '', profesion: '', actividadFisica: 'moderado',
        diagnostico: '', notas: '', ejercicios: [],
        newPassword: ''
    });
    const [statusMsg, setStatusMsg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showActivityMenu, setShowActivityMenu] = useState(false);
    const [newDoc, setNewDoc] = useState({ nombre: '', url: '' });
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [library, setLibrary] = useState([]);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [tempPassword, setTempPassword] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


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
                telefono: found.telefono || '',
                profesion: found.profesion || '',
                actividadFisica: found.actividadFisica || 'moderado',
                diagnostico: found.diagnostico || '',
                notas: found.notas || '',
                ejercicios: found.ejercicios || [],
                newPassword: ''
            });

            const resEv = await api.get(`/patients/evolution/${id}`);
            setEvolution(resEv.data);

            const resAppts = await api.get('/appointments');
            const patientAppts = resAppts.data.filter(a => a.paciente?._id === id);
            setAppointments(patientAppts);

            const resLib = await api.get('/exercises');
            setLibrary(resLib.data);
        } catch (err) {
            // Error controlado en la petición de datos
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
            dataToSend.ejercicios = dataToSend.ejercicios.filter(ex => ex.nombre && ex.nombre.trim() !== '');
            // Si no se escribió contraseña nueva, la eliminamos para no mandar un campo vacío
            if (!dataToSend.newPassword || dataToSend.newPassword.trim() === '') {
                delete dataToSend.newPassword;
            }

            await api.put(`/patients/${id}`, dataToSend);
            setPatient({ ...patient, ...dataToSend });
            setEditForm(prev => ({ ...prev, newPassword: '' }));
            setIsEditing(false);
            setShowPassword(false);
            showNotification(dataToSend.newPassword ? 'Ficha actualizada y contraseña enviada al paciente por email' : 'Ficha clínica actualizada y sincronizada');
        } catch (err) {
            showNotification('Error al guardar los cambios en el servidor');
        }
    };



    const handleResetPassword = async () => {
        setShowConfirmReset(false);
        setIsResetting(true);
        try {
            const res = await api.post(`/patients/${id}/reset-password`);
            tempPasswordRef.current = res.data.tempPassword;
            setTempPassword(res.data.tempPassword);
            setShowPasswordModal(true);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Error al restablecer la contraseña';
            showNotification(errorMsg);
        } finally {
            setIsResetting(false);
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
    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Auto-rellenar el nombre si está vacío
        if (!newDoc.nombre) {
            const cleanName = file.name.split('.').slice(0, -1).join('.');
            setNewDoc(prev => ({ ...prev, nombre: cleanName }));
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewDoc(prev => ({ ...prev, url: res.data.url }));
            showNotification("Archivo cargado correctamente");
        } catch (err) {
            console.error("Error upload doc:", err);
            showNotification("Error al cargar el archivo");
        } finally {
            setUploading(false);
        }
    };

    const handleAddDocument = async () => {
        if (!newDoc.nombre) {
            showNotification("Por favor, indica un nombre para el documento");
            return;
        }
        if (!newDoc.url) {
            showNotification("Por favor, sube un archivo o pega un enlace primero");
            return;
        }

        try {
            const res = await api.post(`/patients/${id}/documents`, {
                nombre: newDoc.nombre,
                url: newDoc.url || '#'
            });
            setPatient({ ...patient, informes: res.data });
            setNewDoc({ nombre: '', url: '' });
            setIsAddingDoc(false);
            showNotification("Documento adjuntado correctamente");
        } catch (err) {
            console.error("Error adding doc:", err);
            showNotification("Error al adjuntar el documento");
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

    if (loading) {
        return (
            <article className="loading-state">
                <div className="loader clinical-loader"></div>
                <p>Sincronizando expediente clínico...</p>
            </article>
        );
    }

    if (!patient) {
        return (
            <article className="empty-state">
                <p>No se ha encontrado el expediente del paciente.</p>
                <button className="btn-ghost" onClick={() => navigate('/dashboard/physio/patients')}>Volver al listado</button>
            </article>
        );
    }

    const initials = (patient.nombre || 'Paciente').split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <main className="patients-page animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}

            <header className="patient-detail__header">
                <nav className="patient-detail__nav">
                    <button onClick={() => navigate('/dashboard/physio/patients')} className="btn-back">
                        <ArrowLeftIcon />
                        <span>Volver al listado</span>
                    </button>
                </nav>

                <section className="patient-detail__identity">
                    <header className="patient-detail__profile">
                        <figure className="patient-avatar patient-avatar--large">
                            <BlobIcon color="#E8F5F1" />
                            <span className="patient-avatar__initials">{initials}</span>
                        </figure>
                        <hgroup className="patient-detail__info">
                            {isEditing ? (
                                <input
                                    className="dashboard__input dashboard__input--title"
                                    value={editForm.nombre || ''}
                                    onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                />
                            ) : (
                                <h1 className="patient-detail__name">{patient.nombre || 'Paciente Sin Nombre'}</h1>
                            )}
                            <p className="patient-detail__id">Expediente Clínico # {patient._id.substring(0, 8).toUpperCase()}</p>
                        </hgroup>
                    </header>

                    <nav className="patient-detail__actions">
                        {!isEditing && (
                            <button className="btn-primary" onClick={() => generatePatientReport(patient, appointments, evolution)}>
                                <FilePdfIcon size={20} />
                                <span>Descargar Informe PDF</span>
                            </button>
                        )}
                        {isEditing ? (
                            <hgroup className="patient-detail__edit-actions">
                                <button type="button" className="btn-ghost" onClick={() => { setIsEditing(false); setShowPassword(false); }}>Cancelar</button>
                                <button type="button" className="btn-primary" onClick={handleUpdate}>
                                    <SaveIcon />
                                    <span>Guardar Cambios</span>
                                </button>
                            </hgroup>
                        ) : (
                            <button type="button" className="btn-primary" onClick={() => { setIsEditing(true); setShowPassword(false); }}>
                                <EditIcon />
                                <span>Editar Ficha</span>
                            </button>
                        )}
                    </nav>
                </section>
            </header>

            <section className="dashboard-grid">
                {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
                <article className="dashboard-card patient-detail__card">
                    <h3 className="card-title-big">Información General</h3>
                    <dl className="clinical-data-list">

                        <div className="clinical-data-item">
                            <dt className="meta-label">Email de Acceso</dt>
                            <dd>
                                {isEditing ? (
                                    <input className="dashboard__input" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                ) : (
                                    <span className="clinical-value">{patient.email}</span>
                                )}
                            </dd>
                        </div>


                        <div className="clinical-data-item">
                            <dt className="meta-label">Contraseña de Acceso</dt>
                            <dd>
                                {isEditing ? (
                                    <div className="dashboard__input-wrapper">
                                        <input
                                            className="dashboard__input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Escribe una nueva contraseña (opcional)"
                                            value={editForm.newPassword || ''}
                                            onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="dashboard__visibility-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dashboard__visibility-icon">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dashboard__visibility-icon">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <span className="clinical-value clinical-value--obfuscated">
                                        ••••••••  <em className="clinical-value__helper-text">(edita la ficha para cambiarla)</em>
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div className="clinical-data-item">
                            <dt className="meta-label">Teléfono</dt>
                            <dd>
                                {isEditing ? (
                                    <input className="dashboard__input" value={editForm.telefono || ''} onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} />
                                ) : (
                                    <span className="clinical-value">{patient.telefono || 'No registrado'}</span>
                                )}
                            </dd>
                        </div>

                        <div className="clinical-data-item">
                            <dt className="meta-label">Profesión</dt>
                            <dd>
                                {isEditing ? (
                                    <input className="dashboard__input" value={editForm.profesion || ''} onChange={e => setEditForm({ ...editForm, profesion: e.target.value })} />
                                ) : (
                                    <span className="clinical-value">{patient.profesion || 'No registrada'}</span>
                                )}
                            </dd>
                        </div>

                        <div className="clinical-data-item">
                            <dt className="meta-label">Actividad Física</dt>
                            <dd>
                                {isEditing ? (
                                    <div className="clinical-select">
                                        <div
                                            className="clinical-select__trigger"
                                            onClick={() => setShowActivityMenu(!showActivityMenu)}
                                        >
                                            <span>{activityOptions.find(o => o.value === editForm.actividadFisica)?.label || 'Seleccionar...'}</span>
                                            <ChevronIcon />
                                        </div>
                                        {showActivityMenu && (
                                            <div className="clinical-select__menu">
                                                {activityOptions.map(o => (
                                                    <div key={o.value} className="clinical-select__option" onClick={() => { setEditForm({ ...editForm, actividadFisica: o.value }); setShowActivityMenu(false); }}>
                                                        {o.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="clinical-value clinical-value--capitalize">{patient.actividadFisica}</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </article>

                {/* COLUMNA DERECHA: TRATAMIENTO Y EJERCICIOS */}
                <article className="dashboard-card patient-detail__card patient-detail__card--wide">
                    <header className="card-header-flex">
                        <h3 className="card-title-big">Plan de Entrenamiento</h3>
                        {isEditing && (
                            <nav className="card-actions-nav">
                                <button
                                    type="button"
                                    className="btn-ghost btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowLibraryModal(true);
                                    }}
                                >
                                    Biblioteca
                                </button>
                                <button type="button" className="btn-primary btn-sm" onClick={addExercise}>
                                    + Nuevo
                                </button>
                            </nav>
                        )}
                    </header>


                    <section className="exercise-grid">
                        {isEditing ? (
                            editForm.ejercicios.map((ex, i) => (
                                <article key={i} className="exercise-card">
                                    <div className="exercise-card__inputs">
                                        <input
                                            className="dashboard__input"
                                            placeholder="Nombre ejercicio"
                                            value={ex.nombre || ''}
                                            onChange={e => updateExercise(i, 'nombre', e.target.value)}
                                        />
                                        <input
                                            className="dashboard__input"
                                            placeholder="Series/Reps"
                                            value={ex.series || ''}
                                            onChange={e => updateExercise(i, 'series', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn-delete-icon"
                                            onClick={() => removeExercise(i)}
                                            title="Eliminar ejercicio"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                    <div className="exercise-card__media-actions">
                                        <input
                                            className="dashboard__input dashboard__input--sm"
                                            placeholder="URL del vídeo"
                                            value={ex.mediaUrl || ''}
                                            onChange={e => updateExercise(i, 'mediaUrl', e.target.value)}
                                        />
                                        <label className="btn-upload-label">
                                            <UploadIcon size={14} />
                                            <span>{uploading ? '...' : 'Subir'}</span>
                                            <input type="file" hidden onChange={e => handleFileUpload(e, i)} accept="image/*,video/*" />
                                        </label>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <ul className="exercise-list">
                                {patient.ejercicios?.filter(ex => ex.nombre).length > 0 ? (
                                    patient.ejercicios.filter(ex => ex.nombre).map((ex, i) => (
                                        <li key={i} className={`exercise-list__item ${ex.completado ? 'exercise-list__item--done' : ''}`}>
                                            <span className="exercise-list__check">
                                                {ex.completado && <CheckIcon size={12} />}
                                            </span>
                                            <div className="exercise-list__content">
                                                <span className="exercise-list__name">{ex.nombre}</span>
                                                <span className="exercise-list__series">{ex.series}</span>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className="clinical-empty-state">
                                        <p>No hay ejercicios asignados todavía en este plan.</p>
                                    </div>
                                )}
                            </ul>
                        )}
                    </section>

                    <footer className="clinical-diagnosis">
                        <label className="meta-label">Diagnóstico Clínico</label>
                        {isEditing ? (
                            <textarea
                                className="dashboard__input dashboard__input--textarea"
                                placeholder="Escribe aquí el diagnóstico detallado..."
                                value={editForm.diagnostico || ''}
                                onChange={e => setEditForm({ ...editForm, diagnostico: e.target.value })}
                            />
                        ) : (
                            <article className="clinical-report-box">
                                <p>{patient.diagnostico || 'Pendiente de valoración clínica.'}</p>
                            </article>
                        )}
                    </footer>
                </article>

                {/* DOCUMENTACIÓN CLÍNICA */}
                <article className="dashboard-card patient-detail__card patient-detail__card--full">
                    <header className="card-header-flex">
                        <hgroup>
                            <h3 className="card-title-big">Documentación Clínica</h3>
                            <p className="card-subtitle">Informes externos, radiografías y derivaciones en PDF.</p>
                        </hgroup>
                        {isEditing && (
                            <button type="button" className="btn-primary btn-sm" onClick={() => setIsAddingDoc(true)}>
                                + Adjuntar Informe
                            </button>
                        )}
                    </header>

                    {isAddingDoc && (
                        <article className="clinical-upload-zone animate-in">
                            <div className="clinical-upload-zone__fields">
                                <div className="clinical-data-item">
                                    <label className="meta-label">Nombre del Documento</label>
                                    <input className="dashboard__input" placeholder="Ej: Resonancia Rodilla" value={newDoc.nombre || ''} onChange={e => setNewDoc({ ...newDoc, nombre: e.target.value })} />
                                </div>
                                <div className="clinical-data-item clinical-data-item--mt-sm">
                                    <label className="meta-label meta-label--block">Archivo / Documento</label>
                                    <label
                                        htmlFor="doc-upload-input"
                                        className="file-upload-dropzone"
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="file-upload-dropzone__icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        {uploading ? (
                                            <div className="file-upload-dropzone__wrapper">
                                                <p className="file-upload-dropzone__title">
                                                    Subiendo archivo...
                                                </p>
                                                <span className="file-upload-dropzone__subtitle file-upload-dropzone__subtitle--success">
                                                    Por favor, espera un momento
                                                </span>
                                            </div>
                                        ) : newDoc.url ? (
                                            <div className="file-upload-dropzone__wrapper">
                                                <p className="file-upload-dropzone__filename">
                                                    {newDoc.url.split('/').pop().replace(/^\d+-/, '')}
                                                </p>
                                                <span className="file-upload-dropzone__subtitle file-upload-dropzone__subtitle--success">
                                                    ¡Archivo listo! Haz clic aquí para cambiarlo
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="file-upload-dropzone__wrapper">
                                                <p className="file-upload-dropzone__title">
                                                    Elige un archivo o arrástralo aquí
                                                </p>
                                                <span className="file-upload-dropzone__subtitle">
                                                    PDF, DOC, DOCX hasta 10MB
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                    <input
                                        id="doc-upload-input"
                                        type="file"
                                        required
                                        onChange={handleDocUpload}
                                        className="u-hidden"
                                        accept=".pdf,.doc,.docx"
                                    />
                                </div>
                            </div>
                            <nav className="clinical-upload-zone__actions">
                                <button type="button" className="btn-ghost" onClick={() => setIsAddingDoc(false)}>Cancelar</button>
                                <button type="button" className="btn-primary" onClick={handleAddDocument}>Adjuntar</button>
                            </nav>
                        </article>
                    )}

                    <section className="document-grid">
                        {patient.informes?.length > 0 ? (
                            patient.informes.map((doc, i) => (
                                <article key={doc._id || i} className="document-card">
                                    <figure className="document-card__icon">
                                        <KneeIcon size={24} />
                                    </figure>
                                    <div className="document-card__info">
                                        <h4 className="document-card__name">{doc.nombre}</h4>
                                        <time className="document-card__date">{new Date(doc.fecha).toLocaleDateString()}</time>
                                    </div>
                                    <nav className="document-card__actions">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="patient-action-btn patient-action-btn--view" title="Descargar">
                                            <DownloadIcon size={18} />
                                        </a>
                                        {isEditing && (
                                            <button onClick={() => handleDeleteDocument(doc._id)} className="patient-action-btn patient-action-btn--delete" title="Eliminar">
                                                <TrashIcon size={18} />
                                            </button>
                                        )}
                                    </nav>
                                </article>
                            ))
                        ) : (
                            <div className="clinical-empty-state">
                                <p>No hay documentos adjuntos en este expediente todavía.</p>
                            </div>
                        )}
                    </section>
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
                            <p className="evolution-chart__note">* Datos extraídos del diario clínico del paciente.</p>
                        </section>
                    ) : (
                        <div className="clinical-empty-state">
                            <p>El paciente aún no ha registrado datos de dolor.</p>
                        </div>
                    )}
                </article>

                <article className="dashboard-card patient-detail__card patient-detail__card--full">
                    <hgroup className="card-header-flex">
                        <div>
                            <h3 className="card-title-big">Diario de Observaciones</h3>
                            <p className="card-subtitle">Comentarios detallados del paciente sobre su evolución diaria.</p>
                        </div>
                    </hgroup>

                    <div className="evolution-feed">
                        {evolution.length > 0 ? (
                            [...evolution].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((entry, idx) => (
                                <article key={idx} className="evolution-feed__item">
                                    <header className="evolution-feed__header">
                                        <time className="evolution-feed__date">
                                            {new Date(entry.fecha).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </time>
                                        <span className={`status-badge status-badge--eva-${entry.nivelDolor > 6 ? 'high' : entry.nivelDolor > 3 ? 'mid' : 'low'}`}>
                                            Nivel EVA: {entry.nivelDolor}
                                        </span>
                                    </header>
                                    <div className="evolution-feed__body">
                                        <p className="evolution-feed__text">
                                            {entry.observaciones || "Sin observaciones adicionales para este registro."}
                                        </p>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="clinical-empty-state">
                                <p>No existen notas u observaciones en el historial del paciente.</p>
                            </div>
                        )}
                    </div>
                </article>
            </section>

            {/* MODAL DE BIBLIOTECA */}
            {showLibraryModal && createPortal(
                <div className="modal-overlay">
                    <article
                        className="modal-container modal-container--medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="modal-header">
                            <hgroup>
                                <h2 className="modal-title">Biblioteca de Ejercicios</h2>
                                <p className="modal-subtitle">Selecciona un ejercicio para añadirlo al plan del paciente.</p>
                            </hgroup>
                            <button type="button" className="btn-close-circle" onClick={() => setShowLibraryModal(false)}>✕</button>
                        </header>

                        <div className="modal-content">
                            {(library && Array.isArray(library) && library.length > 0) ? (
                                <div className="library-grid">
                                    {library.map(ex => (
                                        <div key={ex._id} className="library-item"
                                            onClick={() => importFromLibrary(ex)}
                                        >
                                            <hgroup>
                                                <h4 className="library-item__name">{ex.nombre}</h4>
                                                <span className="library-item__tag">{ex.categoria}</span>
                                            </hgroup>
                                            <div className="library-item__meta">
                                                <span className="library-item__value">{ex.seriesDefecto || '—'}</span>
                                                <span className="library-item__label">Series Sugeridas</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="modal-empty-state">
                                    <span className="modal-empty-state__icon">📚</span>
                                    <p>No tienes ejercicios en la biblioteca.</p>
                                    <button className="btn-ghost" onClick={() => navigate('/dashboard/physio/exercises')}>Ir a Biblioteca</button>
                                </div>
                            )}
                        </div>
                    </article>
                </div>,
                document.body
            )}

        </main>
    );
};

export default PatientDetail;
