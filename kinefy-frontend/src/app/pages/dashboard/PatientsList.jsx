import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { BlobIcon, SearchIcon, PlusIcon, TrashIcon, ViewIcon, WarningIcon } from '../../components/dashboard/DashboardIcons';

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
            console.error("Error fetching patients", err);
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
            console.error("Error deleting patient", err);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        const nombreLower = patient.nombre?.toLowerCase() || "";
        const emailLower = patient.email?.toLowerCase() || "";

        // Dividimos el nombre en palabras para que busque por inicio de nombre O inicio de apellidos
        const nameParts = nombreLower.split(" ");
        const matchesName = nameParts.some(part => part.startsWith(searchLower));

        return matchesName || emailLower.startsWith(searchLower);
    });

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <main className="patients-page animate-in">
            <header className="patients-header">
                <hgroup>
                    <h1 className="home-header__title">Historial Clínico</h1>
                    <p className="home-header__subtitle">Gestión centralizada de expedientes y evolución clínica.</p>
                </hgroup>

                <nav className="patients-controls">
                    <div className="patients-search">
                        <span className="patients-search__icon"><SearchIcon strokeWidth={2.5} /></span>
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="patients-search__input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-callout"
                        onClick={() => navigate('/dashboard/physio/patients/new')}
                    >
                        <PlusIcon />
                        <span>Nuevo Paciente</span>
                    </button>
                </nav>
            </header>

            <section className="patients-grid">
                {loading ? (
                    <article className="loading-state">
                        <div className="loader" style={{ margin: '0 auto 1rem' }}></div>
                        <p>Sincronizando expedientes clínicos...</p>
                    </article>
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map((p, i) => {
                        const initials = p.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        const progress = p.ejercicios?.length > 0
                            ? Math.round((p.ejercicios.filter(e => e.completado).length / p.ejercicios.length) * 100)
                            : 0;

                        return (
                            <article
                                key={p._id}
                                className="patient-card"
                                onClick={() => navigate(`/dashboard/physio/patients/${p._id}`)}
                            >
                                <div className="patient-card__main">
                                    <figure className="patient-card__avatar">
                                        <BlobIcon color={i % 2 === 0 ? "#E8F5F1" : "#F0FAF6"} />
                                        <span className="patient-card__initials">{initials}</span>
                                    </figure>
                                    <hgroup className="patient-card__info">
                                        <span className="patient-card__name">{p.nombre}</span>
                                        <span className="patient-card__email">{p.email}</span>
                                    </hgroup>
                                </div>

                                <div className="patient-progress">
                                    <header className="patient-progress__header">
                                        <span className="patient-progress__label">Recuperación</span>
                                        <span className="patient-progress__value">{progress}%</span>
                                    </header>
                                    <div className="patient-progress__track">
                                        <div className="patient-progress__bar" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="patient-card__meta">
                                    <span className="patient-card__meta-label">Alta Clínica</span>
                                    <span className="patient-card__meta-value">{formatDate(p.createdAt)}</span>
                                </div>

                                <div className="patient-card__status">
                                    <span className="status-badge status-badge--done">Activo</span>
                                </div>

                                <nav className="patient-card__actions">
                                    <button
                                        className="patient-action-btn patient-action-btn--delete"
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(p._id); }}
                                        title="Eliminar Expediente"
                                    >
                                        <TrashIcon size={18} />
                                    </button>
                                    <button 
                                        className="patient-action-btn patient-action-btn--view"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/physio/patients/${p._id}`); }}
                                        title="Ver Expediente"
                                    >
                                        <ViewIcon size={18} />
                                    </button>
                                </nav>
                            </article>
                        );
                    })
                ) : (
                    <article className="empty-state">
                        <p>No se han encontrado expedientes con ese criterio de búsqueda.</p>
                    </article>
                )}
            </section>

            {showDeleteConfirm && (
                <section className="modal-overlay">
                    <article className="dashboard-card modal-card animate-in" style={{ textAlign: 'center' }}>
                        <figure style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FDF2F2', color: '#E57373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <WarningIcon />
                        </figure>
                        <h3 className="card-title-big" style={{ marginBottom: '0.8rem' }}>¿Eliminar este paciente?</h3>
                        <p className="card-label" style={{ marginBottom: '2rem' }}>Esta acción es definitiva. Se borrará su ficha clínica, su historial de evolución y su cuenta de acceso a Kinefy.</p>
                        <footer style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, height: '48px' }}>Cancelar</button>
                            <button className="btn-primary" onClick={handleDeletePatient} style={{ flex: 1, height: '48px', background: '#E57373', borderColor: '#E57373' }}>Eliminar Ficha</button>
                        </footer>
                    </article>
                </section>
            )}
        </main>
    );
};

export default PatientsList;
