import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../api/api';
import { PatientsIcon, ClinicalFolderIcon, UploadIcon, ChevronIcon, ArrowLeftIcon } from '../../components/dashboard/DashboardIcons';

const NewPatient = () => {
    const navigate = useNavigate();
    const [statusMsg, setStatusMsg] = useState(null);
    const [formData, setFormData] = useState({ 
        nombre: '', email: '', 
        telefono: '', diagnostico: '', notas: '', 
        fechaNacimiento: '', profesion: '', actividadFisica: 'moderado' 
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showActivityMenu, setShowActivityMenu] = useState(false);
    const [tempPassword, setTempPassword] = useState(null);

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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles([...selectedFiles, ...files]);
        showNotification(`${files.length} archivo(s) añadidos a la ficha`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/patients', formData);
            if (res.data && res.data.tempPassword) {
                setTempPassword(res.data.tempPassword);
                showNotification(`¡Éxito! Ficha clínica creada.`);
            } else {
                showNotification(`¡Éxito! Ficha clínica creada correctamente.`);
                setTimeout(() => navigate('/dashboard/physio/patients'), 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error al procesar el alta. Revisa los datos.";
            showNotification(errorMsg);
            console.error("Error en registro:", err);
        }
    };

    return (
        <main className="new-patient-page animate-in">
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}

            <header className="clinical-page-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                <button 
                    onClick={() => navigate('/dashboard/physio/patients')} 
                    className="btn-back" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', padding: '0', background: 'none', border: 'none', color: 'var(--color-brand)', cursor: 'pointer' }}
                >
                    <ArrowLeftIcon />
                    <span style={{ fontWeight: '600' }}>Volver al Listado</span>
                </button>
                <div className="clinical-page-header__info">
                    <h1 className="home-header__title" style={{ textAlign: 'left', fontSize: '3rem', margin: '0 0 0.5rem 0' }}>Registro Clínico</h1>
                    <p className="home-header__subtitle" style={{ textAlign: 'left', margin: 0 }}>Apertura de nuevo historial médico y credenciales de acceso.</p>
                </div>
            </header>

            <form className="dashboard-card patient-form" onSubmit={handleSubmit}>
                <section className="patient-form__grid">
                    
                    <fieldset className="patient-form__section">
                        <legend className="patient-form__section-header">
                            <PatientsIcon size={28} color="#55A98A" />
                            <h2 className="card-title-big">Datos de Filiación</h2>
                        </legend>

                        <div className="form-group">
                            <label className="meta-label">Nombre Completo <span className="text-danger">*</span></label>
                            <input
                                className="input-clinical"
                                type="text"
                                placeholder="Nombre y Apellidos..."
                                value={formData.nombre}
                                onChange={e => setFormData({...formData, nombre: e.target.value})}
                                required
                            />
                        </div>

                        <div className="patient-form__row patient-form__row--asymmetric">
                            <div className="form-group">
                                <label className="meta-label">Correo Electrónico <span className="text-danger">*</span></label>
                                <input
                                    className="input-clinical"
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="meta-label">Móvil</label>
                                <input
                                    className="input-clinical"
                                    type="text"
                                    placeholder="+34..."
                                    value={formData.telefono}
                                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="patient-form__row">
                            <div className="form-group">
                                <label className="meta-label">Profesión</label>
                                <input
                                    className="input-clinical"
                                    type="text"
                                    placeholder="Ocupación..."
                                    value={formData.profesion}
                                    onChange={e => setFormData({...formData, profesion: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Actividad Física</label>
                            <div className="clinical-select">
                                <div 
                                    className="clinical-select__trigger" 
                                    onClick={() => setShowActivityMenu(!showActivityMenu)}
                                >
                                    <span className="clinical-select__value">
                                        {activityOptions.find(o => o.value === formData.actividadFisica)?.label || 'Seleccionar nivel...'}
                                    </span>
                                    <ChevronIcon direction={showActivityMenu ? "up" : "down"} size={18} />
                                </div>

                                {showActivityMenu && (
                                    <nav className="clinical-select__menu animate-in">
                                        {activityOptions.map(option => (
                                            <div 
                                                key={option.value}
                                                className={`clinical-select__option ${formData.actividadFisica === option.value ? 'clinical-select__option--selected' : ''}`}
                                                onClick={() => {
                                                    setFormData({...formData, actividadFisica: option.value});
                                                    setShowActivityMenu(false);
                                                }}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="patient-form__section">
                        <legend className="patient-form__section-header">
                            <ClinicalFolderIcon color="#55A98A" size={28} />
                            <h2 className="card-title-big">Historial Clínico</h2>
                        </legend>

                        <div className="form-group">
                            <label className="meta-label">Motivo de Consulta / Diagnóstico <span className="text-danger">*</span></label>
                            <input
                                className="input-clinical"
                                type="text"
                                placeholder="Ej: Cervicalgia crónica..."
                                value={formData.diagnostico}
                                onChange={e => setFormData({...formData, diagnostico: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Fecha de Nacimiento</label>
                            <input
                                className="input-clinical"
                                type="date"
                                value={formData.fechaNacimiento}
                                onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Observaciones e Intervenciones</label>
                            <textarea
                                className="textarea-clinical"
                                placeholder="Describa el historial del paciente, alergias, o cirugías previas..."
                                value={formData.notas}
                                onChange={e => setFormData({...formData, notas: e.target.value})}
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="meta-label">Documentación Adjunta (PDF, JPG)</label>
                            <div 
                                className="dropzone--premium"
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <UploadIcon />
                                <p className="dropzone__text">
                                    {selectedFiles.length > 0 ? `${selectedFiles.length} archivos preparados` : 'Subir pruebas o informes'}
                                </p>
                                <span className="dropzone__subtext">Click para seleccionar archivos</span>
                                <input id="file-upload" type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                        </div>
                    </fieldset>
                </section>

                <footer className="patient-form__footer">
                    <button className="btn-primary patient-form__submit" type="submit">
                        Confirmar y Aperturar Ficha
                    </button>
                </footer>
            </form>

            {/* MODAL DE CONTRASEÑA TEMPORAL */}
            {tempPassword && createPortal(
                <div className="modal-overlay animate-in">
                    <article 
                        className="modal-container modal-container--small"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '400px' }}
                    >
                        <header className="modal-header">
                            <hgroup>
                                <h2 className="modal-title" style={{ color: '#55A98A' }}>Ficha Creada</h2>
                                <p className="modal-subtitle">Se han generado las credenciales de acceso.</p>
                            </hgroup>
                        </header>
                        
                        <div className="modal-content" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <p style={{ fontSize: '0.95rem', color: '#4A5568', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                                Se ha creado la ficha clínica del paciente y enviado una contraseña temporal por correo electrónico.
                            </p>
                            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#7A8C8E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                                Contraseña Temporal de Acceso:
                            </p>
                            <div style={{
                                background: '#F4FAF8',
                                border: '2px dashed #55A98A',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '1.6rem',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#1A2E35',
                                letterSpacing: '2px',
                                userSelect: 'all',
                                margin: '0.5rem 0 1.5rem'
                            }}>
                                {tempPassword}
                            </div>
                            <button 
                                type="button" 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px' }} 
                                onClick={() => {
                                    setTempPassword(null);
                                    navigate('/dashboard/physio/patients');
                                }}
                            >
                                Entendido e Ir al Listado
                            </button>
                        </div>
                    </article>
                </div>,
                document.body
            )}
        </main>
    );
};

export default NewPatient;
