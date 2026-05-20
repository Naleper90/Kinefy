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
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: '#5A6B6D', fontWeight: '500' }}>Cargando tus expedientes clínicos...</p>
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
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}

            <header className="home-header" style={{ marginBottom: '2.5rem' }}>
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
                    <section style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {documents.map((doc, idx) => {
                            const fileExt = getFileExtension(doc.url);
                            const isPdf = fileExt === 'PDF';
                            
                            return (
                                <article key={idx} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: '#FFFFFF', border: '1px solid #EBF0F0', justifyContent: 'space-between', minHeight: '200px', transition: 'all 0.3s ease', position: 'relative' }}>
                                    <header style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        {/* Icono de tipo de archivo con color según extensión */}
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: isPdf ? '#FEE2E2' : '#EBF4FF',
                                            color: isPdf ? '#EF4444' : '#3182CE',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: '800'
                                        }}>
                                            {fileExt}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-dark)', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {doc.nombre}
                                            </h3>
                                            <time style={{ fontSize: '0.75rem', color: '#A0AEC0', display: 'block', marginTop: '0.4rem', fontWeight: '600' }}>
                                                Subido el {new Date(doc.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </time>
                                        </div>
                                    </header>

                                    <footer style={{ marginTop: '1.8rem', display: 'flex', gap: '0.8rem' }}>
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn-primary" 
                                            style={{
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                height: '40px',
                                                fontSize: '0.85rem',
                                                flex: 1
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            Descargar
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteDoc(doc._id)}
                                            style={{
                                                background: '#FFF5F5',
                                                color: '#E53E3E',
                                                border: '1px solid #FED7D7',
                                                borderRadius: '14px',
                                                width: '40px',
                                                height: '40px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
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
                    <section style={{ gridColumn: 'span 3' }}>
                        <article className="dashboard-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#F9FBFB', border: '1px dashed #D0DCDC' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: '#EDF2F2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                color: '#A0AEC0'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#4A5568' }}>Expediente Clínico Vacío</h3>
                            <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0 0 1.5rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                                Aún no has subido ningún documento clínico ni tu fisioterapeuta los ha adjuntado.
                            </p>
                            <button className="btn-primary" style={{ width: 'auto', padding: '0.7rem 1.5rem' }} onClick={() => setShowUploadModal(true)}>
                                Subir tu primer documento
                            </button>
                        </article>
                    </section>
                )}
            </section>

            {/* MODAL DE SUBIDA DE ARCHIVOS */}
            {showUploadModal && createPortal(
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-container--premium" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header--clinical">
                            <h2 className="modal-header__title">Subir Documento</h2>
                            <p className="modal-header__subtitle">Adjunta informes médicos externos, recetas o radiografías a tu expediente.</p>
                            <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
                        </header>
                        
                        <div className="modal-body--clinical">
                            <form onSubmit={handleUploadSubmit} className="clinical-form">
                                <div className="clinical-input-group" style={{ marginBottom: '1.2rem' }}>
                                    <label className="meta-label meta-label--brand" style={{ marginBottom: '0.6rem', display: 'block' }}>Seleccionar Archivo</label>
                                    <label 
                                        htmlFor="file-upload-input" 
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem 1.5rem',
                                            border: '2px dashed #C2DFD4',
                                            borderRadius: '20px',
                                            background: '#F4FAF8',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textAlign: 'center',
                                            color: '#55A98A'
                                        }}
                                        className="file-upload-dropzone"
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.8rem' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        {uploadForm.file ? (
                                            <div style={{ width: '100%' }}>
                                                <p style={{ margin: '0 0 0.4rem', fontWeight: '700', fontSize: '0.9rem', color: '#1A2E35', wordBreak: 'break-all' }}>
                                                    {uploadForm.file.name}
                                                </p>
                                                <span style={{ fontSize: '0.75rem', color: '#55A98A', fontWeight: '600' }}>
                                                    {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB - Haz clic para cambiar
                                                </span>
                                            </div>
                                        ) : (
                                            <div>
                                                <p style={{ margin: '0 0 0.3rem', fontWeight: '700', fontSize: '0.9rem', color: '#1A2E35' }}>
                                                    Elige un archivo o arrástralo aquí
                                                </p>
                                                <span style={{ fontSize: '0.75rem', color: '#7A8C8E', fontWeight: '500' }}>
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
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="clinical-input-group" style={{ marginBottom: '1.2rem' }}>
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
                                
                                <div className="clinical-card--dashed" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#5A6B6D', margin: 0 }}>
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
