import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/api';
import { generatePatientReport } from '../../utils/pdfGenerator';
import { DocsIcon, ReportsIcon, EvolutionIcon, ClinicalFolderIcon } from '../../components/dashboard/DashboardIcons';

const Reports = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, type: null });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);
    const [filter, setFilter] = useState('');

    const showNotification = (msg) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 3000);
    };

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/patients');
                setPatients(res.data);
            } catch (err) {
                console.error("Error al obtener pacientes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const reportsByPatient = patients
        .map(p => ({
            id: p._id,
            name: p.nombre,
            reports: (p.informes || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        }))
        .filter(p => p.reports.length > 0)
        .filter(p => 
            p.name.toLowerCase().includes(filter.toLowerCase()) || 
            p.reports.some(r => r.nombre.toLowerCase().includes(filter.toLowerCase()))
        );

    const exportToExcel = () => {
        const headers = ['Nombre', 'Email', 'Teléfono', 'Estado', 'Última Cita', 'Ejercicios', 'Progreso %', 'Diagnóstico'];
        const rows = patients.map(p => {
            const progress = p.ejercicios?.length > 0 
                ? Math.round((p.ejercicios.filter(e => e.completado).length / p.ejercicios.length) * 100) 
                : 0;
            
            return [
                `"${p.nombre}"`,
                `"${p.email}"`,
                `"${p.telefono || '-'}"`,
                `"${p.estado?.toUpperCase() || 'ACTIVO'}"`,
                `"${p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '-'}"`,
                `"${p.ejercicios?.length || 0}"`,
                `"${progress}%"`,
                `"${(p.diagnostico || '').substring(0, 50)}..."`
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Auditoria_Clinica_Kinefy_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedPatient) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = res.data.url;

            await api.post(`/patients/${selectedPatient._id}/documents`, {
                nombre: file.name,
                url: fileUrl
            });

            const patientsRes = await api.get('/patients');
            setPatients(patientsRes.data);
            setModal({ show: false, type: null });
            setSelectedPatient(null);
            showNotification("Documento importado con éxito");
        } catch (err) {
            console.error("Error al subir el archivo", err);
            showNotification("Error al subir el archivo");
        }
    };

    if (loading) return <section className="loading-state">Cargando centro de informes...</section>;

    return (
        <main className="reports animate-in">
            {statusMsg && createPortal(
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>,
                document.body
            )}

            <header className="home-header">
                <hgroup className="home-header__info">
                    <h1 className="home-header__title">Gestión de Informes</h1>
                    <p className="home-header__subtitle">Auditoría clínica y control de documentación profesional.</p>
                </hgroup>
            </header>

            <section className="reports__grid">
                <article className="dashboard-card">
                    <header className="reports__header-card">
                        <h2 className="grid-col__title">Historial Documental</h2>
                        <input
                            type="text"
                            placeholder="Buscar paciente o archivo..."
                            className="reports__search-input"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </header>

                    <ul className="reports__list">
                        {reportsByPatient.length > 0 ? (
                            reportsByPatient.map((patientGroup) => (
                                <details key={patientGroup.id} className="reports__folder">
                                    <summary className="reports__folder-summary">
                                        <hgroup className="reports__folder-info">
                                            <ClinicalFolderIcon />
                                            <strong className="reports__folder-name">{patientGroup.name}</strong>
                                        </hgroup>
                                        <span className="meta-label">{patientGroup.reports.length} {patientGroup.reports.length === 1 ? 'doc' : 'docs'}</span>
                                    </summary>
                                    
                                    <nav className="reports__folder-content">
                                        {patientGroup.reports.map((report, i) => (
                                            <article key={i} className="reports__item">
                                                <figure className="reports__item-icon">
                                                    <DocsIcon size={18} />
                                                </figure>
                                                <hgroup className="reports__item-info">
                                                    <h4 className="reports__item-title">{report.nombre}</h4>
                                                    <p className="reports__item-meta">{new Date(report.fecha).toLocaleDateString()}</p>
                                                </hgroup>
                                                <a href={report.url} target="_blank" rel="noopener noreferrer" className="status-badge status-badge--done">
                                                    Abrir
                                                </a>
                                            </article>
                                        ))}
                                    </nav>
                                </details>
                            ))
                        ) : (
                            <li className="empty-state">No se han encontrado registros vinculados.</li>
                        )}
                    </ul>
                </article>

                <aside className="dashboard-card dashboard-card--dark">
                    <h2 className="grid-col__title">Acciones de Control</h2>
                    <p className="reports__action-subtitle">Herramientas de exportación y gestión clínica.</p>

                    <nav className="reports__action-grid">
                        <button className="reports__action-btn" onClick={() => setModal({ show: true, type: 'generate' })}>
                            <div className="reports__action-icon"><DocsIcon /></div>
                            <hgroup className="reports__action-text">
                                <span className="reports__action-name">Generar PDF Clínico</span>
                                <span className="reports__action-desc">Ficha oficial de seguimiento.</span>
                            </hgroup>
                        </button>

                        <button className="reports__action-btn" onClick={() => setModal({ show: true, type: 'upload' })}>
                            <div className="reports__action-icon"><ReportsIcon /></div>
                            <hgroup className="reports__action-text">
                                <span className="reports__action-name">Importar Documento</span>
                                <span className="reports__action-desc">Añadir archivos externos.</span>
                            </hgroup>
                        </button>

                        <button className="reports__action-btn" onClick={exportToExcel}>
                            <div className="reports__action-icon"><EvolutionIcon /></div>
                            <hgroup className="reports__action-text">
                                <span className="reports__action-name">Exportar Clínica</span>
                                <span className="reports__action-desc">Auditoría técnica en CSV.</span>
                            </hgroup>
                        </button>
                    </nav>

                    <footer className="reports__footer">
                        <p className="reports__footer-text">Sincronización activa: {new Date().toLocaleDateString()}</p>
                    </footer>
                </aside>
            </section>

            <input 
                type="file" 
                id="report-upload" 
                hidden 
                onChange={handleFileSelect} 
                accept=".pdf,.doc,.docx,image/*"
            />

            {modal.show && createPortal(
                <section className="modal-overlay">
                    <article className="dashboard-card modal-card animate-in">
                        <header className="modal-card__header">
                            <h3 className="card-title-big">
                                {modal.type === 'generate' ? 'Generar Informe' : 'Importar Archivo'}
                            </h3>
                            <p className="card-label">Selecciona el paciente para procesar la acción.</p>
                        </header>
                        
                        <nav className="modal-list">
                            {patients.map(p => (
                                <button
                                    key={p._id}
                                    className="modal-patient-btn"
                                    onClick={() => {
                                        if (modal.type === 'generate') {
                                            generatePatientReport(p, p.citas || []);
                                            setModal({ show: false, type: null });
                                        } else {
                                            setSelectedPatient(p);
                                            document.getElementById('report-upload').click();
                                        }
                                    }}
                                >
                                    <hgroup className="modal-patient-info">
                                        <strong>{p.nombre}</strong>
                                        <span className="modal-patient-meta">{p.email}</span>
                                    </hgroup>
                                </button>
                            ))}
                        </nav>
                        
                        <button className="btn-ghost modal-card__cancel-btn" onClick={() => setModal({ show: false, type: null })}>
                            Cancelar
                        </button>
                    </article>
                </section>,
                document.body
            )}
        </main>
    );
};

export default Reports;
