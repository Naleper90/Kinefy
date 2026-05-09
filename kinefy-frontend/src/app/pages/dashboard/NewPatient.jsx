import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const NewPatient = () => {
    const navigate = useNavigate();
    const [statusMsg, setStatusMsg] = useState(null);
    const [formData, setFormData] = useState({ 
        nombre: '', email: '', password: '', 
        telefono: '', diagnostico: '', notas: '', 
        fechaNacimiento: '', profesion: '', actividadFisica: 'moderado' 
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showActivityMenu, setShowActivityMenu] = useState(false);

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
            await api.post('/patients', formData);
            showNotification(`¡Éxito! Ficha clínica creada correctamente.`);
            setTimeout(() => navigate('/dashboard/physio/patients'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error al procesar el alta. Revisa los datos.";
            showNotification(errorMsg);
            console.error("Error en registro:", err);
        }
    };

    return (
        <main className="new-patient animate-in">
            {statusMsg && (
                <article className="toast-notification">
                    <span className="toast-notification__dot">●</span>
                    {statusMsg}
                </article>
            )}

            <header className="patient-detail__header">
                <nav className="patient-detail__nav">
                    <button onClick={() => navigate('/dashboard/physio')} className="btn-back">
                        ← Volver al Panel
                    </button>
                </nav>
                <h1 className="home-header__title">Registro Clínico</h1>
                <p className="home-header__subtitle">Apertura de nuevo historial médico y credenciales de acceso.</p>
            </header>

            <form className="dashboard-card" onSubmit={handleSubmit} style={{ padding: '3.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem' }}>
                    
                    <section className="form-section">
                        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: '#E8F5F1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#55A98A" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <h2 className="card-title-big" style={{ fontSize: '1.4rem', margin: 0 }}>Datos de Filiación</h2>
                        </header>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <div className="form-group">
                                <label className="meta-label">Nombre Completo <span style={{ color: '#E57373' }}>*</span></label>
                                <input
                                    className="dashboard__input"
                                    type="text"
                                    placeholder="Nombre y Apellidos..."
                                    value={formData.nombre}
                                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="meta-label">Correo Electrónico <span style={{ color: '#E57373' }}>*</span></label>
                                    <input
                                        className="dashboard__input"
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
                                        className="dashboard__input"
                                        type="text"
                                        placeholder="+34..."
                                        value={formData.telefono}
                                        onChange={e => setFormData({...formData, telefono: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="meta-label">Contraseña de Acceso <span style={{ color: '#E57373' }}>*</span></label>
                                    <input
                                        className="dashboard__input"
                                        type="password"
                                        placeholder="Mín. 6 caracteres"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="meta-label">Profesión</label>
                                    <input
                                        className="dashboard__input"
                                        type="text"
                                        placeholder="Ocupación..."
                                        value={formData.profesion}
                                        onChange={e => setFormData({...formData, profesion: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="meta-label">Actividad Física</label>
                                <div className="custom-select-container" style={{ position: 'relative' }}>
                                    <div 
                                        className="dashboard__input" 
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                        }}
                                        onClick={() => setShowActivityMenu(!showActivityMenu)}
                                    >
                                        <span style={{ color: formData.actividadFisica ? '#1A2E35' : '#A0AEC0', fontWeight: '600' }}>
                                            {activityOptions.find(o => o.value === formData.actividadFisica)?.label || 'Seleccionar nivel...'}
                                        </span>
                                        <svg 
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            style={{ transition: 'transform 0.3s', transform: showActivityMenu ? 'rotate(180deg)' : 'rotate(0)' }}
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>

                                    {showActivityMenu && (
                                        <div className="animate-in" style={{
                                            position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%',
                                            background: '#FFFFFF',
                                            borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                                            border: '1px solid #E2E8F0', zIndex: 100, overflow: 'hidden', padding: '0.5rem'
                                        }}>
                                            {activityOptions.map(option => (
                                                <div 
                                                    key={option.value}
                                                    style={{ 
                                                        padding: '0.8rem 1.2rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '10px',
                                                        background: formData.actividadFisica === option.value ? '#F0FAF6' : 'transparent',
                                                        color: formData.actividadFisica === option.value ? '#55A98A' : '#1A2E35',
                                                        fontWeight: formData.actividadFisica === option.value ? '700' : '500',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => {
                                                        setFormData({...formData, actividadFisica: option.value});
                                                        setShowActivityMenu(false);
                                                    }}
                                                    onMouseOver={e => { if(formData.actividadFisica !== option.value) e.currentTarget.style.background = '#F9FBFB'; }}
                                                    onMouseOut={e => { if(formData.actividadFisica !== option.value) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: '#FDF2F2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E57373" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <h2 className="card-title-big" style={{ fontSize: '1.4rem', margin: 0 }}>Historial Clínico</h2>
                        </header>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <div className="form-group">
                                <label className="meta-label">Motivo de Consulta / Diagnóstico <span style={{ color: '#E57373' }}>*</span></label>
                                <input
                                    className="dashboard__input"
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
                                    className="dashboard__input"
                                    type="date"
                                    value={formData.fechaNacimiento}
                                    onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="meta-label">Observaciones e Intervenciones</label>
                                <textarea
                                    className="dashboard__input"
                                    placeholder="Describa el historial del paciente, alergias, o cirugías previas..."
                                    value={formData.notas}
                                    onChange={e => setFormData({...formData, notas: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="meta-label">Documentación Adjunta (PDF, JPG)</label>
                                <div 
                                    className="dropzone--premium"
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#55A98A" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#5A6B6D', fontWeight: '500' }}>
                                        {selectedFiles.length > 0 ? `${selectedFiles.length} archivos preparados` : 'Subir pruebas o informes'}
                                    </p>
                                    <span style={{ fontSize: '0.75rem', color: '#999' }}>Click para seleccionar archivos</span>
                                    <input id="file-upload" type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <footer style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '3rem' }}>
                    <button className="btn-primary" type="submit" style={{ width: 'auto', padding: '1.2rem 5rem', fontSize: '1.1rem', borderRadius: '100px', boxShadow: '0 10px 30px rgba(85, 169, 138, 0.3)' }}>
                        Confirmar y Aperturar Ficha
                    </button>
                </footer>
            </form>
        </main>
    );
};

export default NewPatient;
