import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';

const PatientDocs = () => {
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        nombre: '',
        file: null
    });

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const fetchPatientData = async () => {
        try {
            const res = await api.get('/patients/me');
            setPatientData(res.data);
        } catch (err) {
            // Manejo silencioso
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setUploadForm(prev => ({
                ...prev,
                file: selectedFile,
                nombre: prev.nombre || selectedFile.name.split('.')[0] // Autocompletar nombre
            }));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.file || !patientData) return;

        setUploading(true);
        try {
            // 1. Subir el archivo real al servidor (/api/upload)
            const formData = new FormData();
            formData.append('file', uploadForm.file);

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = uploadRes.data.url;

            // 2. Asociar el archivo en el historial del expediente del paciente
            await api.post(`/patients/${patientData._id}/documents`, {
                nombre: uploadForm.nombre || uploadForm.file.name,
                url: fileUrl
            });

            showNotification("Documento subido correctamente");
            setShowUploadModal(false);
            setUploadForm({ nombre: '', file: null });
            fetchPatientData();
        } catch (err) {
            showNotification("Error al subir el documento");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento del expediente?")) return;
        try {
            await api.delete(`/patients/${patientData._id}/documents/${docId}`);
            showNotification("Documento eliminado correctamente");
            fetchPatientData();
        } catch (err) {
            showNotification("No se pudo eliminar el documento");
        }
    };

    if (loading) return (
        <div className="docs-loading">
            <div className="loader loader--centered-margin"></div>
            <p className="docs-loading__text">Cargando tus expedientes clínicos...</p>
        </div>
    );

    const documents = patientData?.informes || [];

    const getFileExtension = (url) => {
        if (!url) return 'PDF';
        const parts = url.split('.');
        const ext = parts[parts.length - 1].toUpperCase();
        return ext.length <= 4 ? ext : 'PDF';
    };

    return (
        <section className="home animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}

            <header className="home-header docs-header">
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Mis Documentos Clínicos</h1>
                    <p className="home-header__subtitle">Consulta, descarga o sube tus propios informes médicos, radiografías y recetas firmadas.</p>
                </hgroup>
                <button className="btn-callout" onClick={() => setShowUploadModal(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Subir Documento
                </button>
            </header>

            <section className="dashboard-grid">
                {documents.length > 0 ? (
                    <section className="docs-grid">
                        {documents.map((doc, idx) => {
                            const fileExt = getFileExtension(doc.url);
                            const isPdf = fileExt === 'PDF';
                            
                            return (
                                <article key={idx} className="dashboard-card doc-card">
                                    <header className="doc-card__header">
                                        {/* Icono de tipo de archivo con color según extensión */}
                                        <div className={`doc-card__icon ${isPdf ? 'doc-card__icon--pdf' : 'doc-card__icon--doc'}`}>
                                            {fileExt}
                                        </div>
                                        <div className="doc-card__meta">
                                            <h3 className="doc-card__title">
                                                {doc.nombre}
                                            </h3>
                                            <time className="doc-card__date">
                                                Subido el {new Date(doc.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </time>
                                        </div>
                                    </header>

                                    <footer className="doc-card__footer">
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn-primary doc-card__download-btn"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            Descargar
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteDoc(doc._id)}
                                            className="doc-card__delete-btn"
                                            title="Eliminar documento"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </footer>
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    <section className="docs-empty-wrapper">
                        <article className="dashboard-card docs-empty-card">
                            <div className="docs-empty-card__icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </div>
                            <h3 className="docs-empty-card__title">Expediente Clínico Vacío</h3>
                            <p className="docs-empty-card__text">
                                Aún no has subido ningún documento clínico ni tu fisioterapeuta los ha adjuntado.
                            </p>
                            <button className="btn-primary docs-empty-card__btn" onClick={() => setShowUploadModal(true)}>
                                Subir tu primer documento
                            </button>
                        </article>
                    </section>
                )}
            </section>

            {/* MODAL DE SUBIDA DE ARCHIVOS */}
            {showUploadModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-container--premium modal-container--premium--sm" onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">Subir Documento</h2>
                            <p className="modal-header__subtitle">Adjunta informes médicos externos, recetas o radiografías a tu expediente.</p>
                            <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleUploadSubmit} className="clinical-form">
                                <div className="clinical-input-group clinical-input-group--mb">
                                    <label className="meta-label meta-label--brand meta-label--block">Seleccionar Archivo</label>
                                    <label 
                                        htmlFor="file-upload-input" 
                                        className="file-upload-dropzone"
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="file-upload-dropzone__icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        {uploadForm.file ? (
                                            <div className="file-upload-dropzone__wrapper">
                                                <p className="file-upload-dropzone__filename">
                                                    {uploadForm.file.name}
                                                </p>
                                                <span className="file-upload-dropzone__subtitle file-upload-dropzone__subtitle--success">
                                                    {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB - Haz clic para cambiar
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="file-upload-dropzone__wrapper">
                                                <p className="file-upload-dropzone__title">
                                                    Elige un archivo o arrástralo aquí
                                                </p>
                                                <span className="file-upload-dropzone__subtitle">
                                                    PDF, PNG, JPG hasta 10MB
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                    <input 
                                        id="file-upload-input"
                                        type="file" 
                                        required 
                                        onChange={handleFileChange}
                                        className="u-hidden"
                                    />
                                </div>
                                <div className="clinical-input-group clinical-input-group--mb">
                                    <label className="meta-label meta-label--brand">Nombre del Documento</label>
                                    <input 
                                        type="text" 
                                        className="input-clinical" 
                                        placeholder="Ej: Radiografía lumbar, Receta médica" 
                                        required
                                        value={uploadForm.nombre} 
                                        onChange={e => setUploadForm({...uploadForm, nombre: e.target.value})} 
                                    />
                                </div>
                                
                                <div className="clinical-card--dashed clinical-card--dashed-spacing">
                                    <p className="clinical-card__disclaimer-text">
                                        * Los documentos subidos formarán parte de tu expediente clínico y estarán disponibles de forma segura en la plataforma.
                                    </p>
                                </div>

                                <footer className="modal-footer--clinical-inside">
                                    <button type="button" className="btn-ghost" onClick={() => setShowUploadModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary--soft" disabled={uploading || !uploadForm.file}>
                                        {uploading ? "Subiendo..." : "Subir Archivo"}
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

export default PatientDocs;
