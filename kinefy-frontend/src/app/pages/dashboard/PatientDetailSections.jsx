import React from 'react';
import {
    KneeIcon,
    DownloadIcon,
    CheckIcon,
    TrashIcon,
    UploadIcon,
    ChevronIcon
} from '../../components/dashboard/DashboardIcons';

/**
 * Componente PatientInfoSection
 * Renderiza la sección de Información General/Datos Personales
 */
export const PatientInfoSection = ({
    isEditing,
    editForm,
    setEditForm,
    patient,
    showActivityMenu,
    setShowActivityMenu,
    activityOptions,
    showPassword,
    setShowPassword
}) => {
    return (
        <article className="dashboard-card patient-detail__card">
            <h3 className="card-title-big">Información General</h3>
            <dl className="clinical-data-list">
                <div className="clinical-data-item">
                    <dt className="meta-label">Email de Acceso</dt>
                    <dd>
                        {isEditing ? (
                            <input 
                                className="dashboard__input" 
                                value={editForm.email || ''} 
                                onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                            />
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
                            <input 
                                className="dashboard__input" 
                                value={editForm.telefono || ''} 
                                onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} 
                            />
                        ) : (
                            <span className="clinical-value">{patient.telefono || 'No registrado'}</span>
                        )}
                    </dd>
                </div>

                <div className="clinical-data-item">
                    <dt className="meta-label">Profesión</dt>
                    <dd>
                        {isEditing ? (
                            <input 
                                className="dashboard__input" 
                                value={editForm.profesion || ''} 
                                onChange={e => setEditForm({ ...editForm, profesion: e.target.value })} 
                            />
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
                                <button
                                    type="button"
                                    className="clinical-select__trigger"
                                    onClick={() => setShowActivityMenu(!showActivityMenu)}
                                    aria-haspopup="listbox"
                                    aria-expanded={showActivityMenu}
                                >
                                    <span>{activityOptions.find(o => o.value === editForm.actividadFisica)?.label || 'Seleccionar...'}</span>
                                    <ChevronIcon />
                                </button>
                                {showActivityMenu && (
                                    <div className="clinical-select__menu">
                                        {activityOptions.map(o => (
                                            <button 
                                                type="button"
                                                key={o.value} 
                                                className="clinical-select__option" 
                                                onClick={() => { 
                                                    setEditForm({ ...editForm, actividadFisica: o.value }); 
                                                    setShowActivityMenu(false); 
                                                }}
                                            >
                                                {o.label}
                                            </button>
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
    );
};

/**
 * Componente ExercisePlanSection
 * Renderiza el Plan de Entrenamiento y Diagnóstico Clínico
 */
export const ExercisePlanSection = ({
    isEditing,
    editForm,
    setEditForm,
    patient,
    addExercise,
    removeExercise,
    updateExercise,
    handleFileUpload,
    uploading,
    setShowLibraryModal
}) => {
    return (
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
                                    className="btn-icon--delete"
                                    onClick={() => removeExercise(i)}
                                    title="Eliminar ejercicio"
                                    aria-label="Eliminar ejercicio"
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
    );
};

/**
 * Componente ClinicalDocsSection
 * Renderiza la sección de Documentación Clínica
 */
export const ClinicalDocsSection = ({
    isEditing,
    patient,
    isAddingDoc,
    setIsAddingDoc,
    newDoc,
    setNewDoc,
    uploading,
    handleDocUpload,
    handleAddDocument,
    handleDeleteDocument
}) => {
    return (
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
                            <input 
                                className="dashboard__input" 
                                placeholder="Ej: Resonancia Rodilla" 
                                value={newDoc.nombre || ''} 
                                onChange={e => setNewDoc({ ...newDoc, nombre: e.target.value })} 
                            />
                        </div>
                        <div className="clinical-data-item clinical-data-item--mt-sm">
                            <label className="meta-label meta-label--block">Archivo / Documento</label>
                            <label htmlFor="doc-upload-input" className="file-upload-dropzone">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="file-upload-dropzone__icon">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                {uploading ? (
                                    <div className="file-upload-dropzone__wrapper">
                                        <p className="file-upload-dropzone__title">Subiendo archivo...</p>
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
                                        <p className="file-upload-dropzone__title">Elige un archivo o arrástralo aquí</p>
                                        <span className="file-upload-dropzone__subtitle">PDF, DOC, DOCX hasta 5MB</span>
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
    );
};

/**
 * Componente EvolutionSection
 * Renderiza el Gráfico EVA y el Diario de Observaciones
 */
export const EvolutionSection = ({ evolution }) => {
    return (
        <>
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
                <header className="card-header-flex">
                    <h3 className="card-title-big">Diario de Observaciones</h3>
                    <p className="card-subtitle">Comentarios detallados del paciente sobre su evolución diaria.</p>
                </header>

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
        </>
    );
};
