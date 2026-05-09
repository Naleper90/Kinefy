import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { BlobIcon } from '../../components/dashboard/DashboardIcons';

const PatientsList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            setPatients(res.data);
        } catch (err) {
            // Error manejado
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDeletePatient = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/patients/${showDeleteConfirm}`);
            setShowDeleteConfirm(null);
            fetchPatients();
        } catch (err) {
            // Error manejado
        }
    };

    const filteredPatients = patients.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <section className="patients-list-page animate-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h1 className="home-header__title" style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>Historial Clínico</h1>
                        <p className="home-header__subtitle">Gestión centralizada de expedientes y evolución de pacientes.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <svg style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#55A98A', zIndex: 5, opacity: 0.8 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                placeholder="Buscar paciente..." 
                                className="auth__input auth__input--search"
                                style={{ 
                                    borderRadius: '14px', 
                                    background: '#FFFFFF',
                                    border: '1px solid rgba(85, 169, 138, 0.2)',
                                    fontSize: '0.9rem',
                                    height: '48px'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn-primary" 
                            onClick={() => navigate('/dashboard/physio/patients/new')}
                            style={{ width: 'auto', height: '48px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Nuevo Paciente
                        </button>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem' }}>
                            <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                            <p style={{ color: '#5A6B6D', fontWeight: '500' }}>Sincronizando expedientes...</p>
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((p, i) => {
                            const initials = p.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                            const progress = p.ejercicios?.length > 0 
                                ? Math.round((p.ejercicios.filter(e => e.completado).length / p.ejercicios.length) * 100) 
                                : 0;

                            return (
                                <article 
                                    key={p._id} 
                                    className="patient-list-card"
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        padding: '0.9rem 1.6rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(220px, 1.2fr) 1fr 1fr 110px 100px',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        border: '1px solid rgba(26, 46, 53, 0.05)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/dashboard/physio/patients/${p._id}`)}
                                >
                                    {/* INFO PRINCIPAL */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                                        <figure style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                                            <BlobIcon color={i % 2 === 0 ? "#E8F5F1" : "#F0FAF6"} />
                                            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#55A98A' }}>
                                                {initials}
                                            </span>
                                        </figure>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                            <span style={{ fontWeight: '700', color: '#1A2E35', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#5A6B6D', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</span>
                                        </div>
                                    </div>

                                    {/* PROGRESO */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#5A6B6D', textTransform: 'uppercase', opacity: 0.5 }}>Recuperación</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#55A98A' }}>{progress}%</span>
                                        </div>
                                        <div style={{ height: '4px', background: '#F0F5F4', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${progress}%`, background: '#55A98A', borderRadius: '10px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                    </div>

                                    {/* FECHA */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#5A6B6D', textTransform: 'uppercase', opacity: 0.5 }}>Alta</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#1A2E35' }}>{formatDate(p.createdAt)}</span>
                                    </div>

                                    {/* ESTADO */}
                                    <div>
                                        <span style={{ 
                                            padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.65rem', 
                                            background: '#E8F5F1', color: '#55A98A', fontWeight: '700', display: 'inline-block'
                                        }}>
                                            Activo
                                        </span>
                                    </div>

                                    {/* ACCIONES */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                        <button 
                                            className="btn-ghost"
                                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(p._id); }}
                                            style={{ 
                                                width: '34px', height: '34px', borderRadius: '10px', background: '#FDF2F2',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E57373',
                                                border: 'none', padding: 0
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                        <div style={{ 
                                            width: '34px', height: '34px', borderRadius: '10px', background: '#F9FBFB',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55A98A',
                                            border: '1px solid rgba(85, 169, 138, 0.1)'
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <article className="dashboard-card" style={{ textAlign: 'center', padding: '4rem', borderStyle: 'dashed', background: 'transparent' }}>
                            <p style={{ color: '#5A6B6D', fontSize: '1.1rem' }}>No se han encontrado pacientes registrados con ese nombre.</p>
                        </article>
                    )}
                </div>
            </section>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PACIENTE */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 46, 53, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999, padding: '1.5rem' }}>
                    <div className="dashboard-card animate-in" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FDF2F2', color: '#E57373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                        <h3 style={{ fontSize: '1.4rem', color: '#1A2E35', marginBottom: '0.8rem' }}>¿Eliminar este paciente?</h3>
                        <p style={{ color: '#5A6B6D', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>Esta acción es definitiva. Se borrará su ficha clínica, su historial de evolución y su cuenta de acceso a Kinefy.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, height: '48px', borderRadius: '12px' }}>Cancelar</button>
                            <button className="btn-primary" onClick={handleDeletePatient} style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#E57373', borderColor: '#E57373', boxShadow: '0 8px 20px rgba(229, 115, 115, 0.25)' }}>Eliminar Ficha</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PatientsList;
