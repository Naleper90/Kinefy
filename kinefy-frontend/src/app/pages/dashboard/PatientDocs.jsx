import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const PatientDocs = () => {
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <header className="home-header" style={{ marginBottom: '2.5rem' }}>
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Mis Documentos Clínicos</h1>
                    <p className="home-header__subtitle">Consulta, descarga y visualiza todos tus informes de alta, recetas y pautas firmadas por tu fisioterapeuta.</p>
                </hgroup>
            </header>

            <section className="dashboard-grid">
                {documents.length > 0 ? (
                    <section style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {documents.map((doc, idx) => {
                            const fileExt = getFileExtension(doc.url);
                            const isPdf = fileExt === 'PDF';
                            
                            return (
                                <article key={idx} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: '#FFFFFF', border: '1px solid #EBF0F0', justifyContent: 'space-between', minHeight: '200px', transition: 'all 0.3s ease' }}>
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

                                    <footer style={{ marginTop: '1.8rem' }}>
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
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            Descargar Archivo
                                        </a>
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
                            <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                                Tu fisioterapeuta aún no ha subido ningún informe clínico, radiografía o pauta firmada a tu portal. Estarán disponibles aquí tan pronto como los adjunte.
                            </p>
                        </article>
                    </section>
                )}
            </section>
        </section>
    );
};

export default PatientDocs;
