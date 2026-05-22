import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import {
    BlobIcon,
    EditIcon,
    SaveIcon,
    ArrowLeftIcon,
    FilePdfIcon
} from '../../components/dashboard/DashboardIcons';
import { generatePatientReport } from '../../utils/pdfGenerator';
import {
    PatientInfoSection,
    ExercisePlanSection,
    ClinicalDocsSection,
    EvolutionSection
} from './PatientDetailSections';

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

    const fetchPatientData = useCallback(async () => {
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

    }, [id]);

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

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
                <PatientInfoSection
                    isEditing={isEditing}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    patient={patient}
                    showActivityMenu={showActivityMenu}
                    setShowActivityMenu={setShowActivityMenu}
                    activityOptions={activityOptions}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />

                <ExercisePlanSection
                    isEditing={isEditing}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    patient={patient}
                    addExercise={addExercise}
                    removeExercise={removeExercise}
                    updateExercise={updateExercise}
                    handleFileUpload={handleFileUpload}
                    uploading={uploading}
                    setShowLibraryModal={setShowLibraryModal}
                />

                <ClinicalDocsSection
                    isEditing={isEditing}
                    patient={patient}
                    isAddingDoc={isAddingDoc}
                    setIsAddingDoc={setIsAddingDoc}
                    newDoc={newDoc}
                    setNewDoc={setNewDoc}
                    uploading={uploading}
                    handleDocUpload={handleDocUpload}
                    handleAddDocument={handleAddDocument}
                    handleDeleteDocument={handleDeleteDocument}
                />

                <EvolutionSection
                    evolution={evolution}
                />
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
