import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/auth/me');
                setName(res.data.name || '');
                setEmail(res.data.email || '');
            } catch (err) {
                console.error("Error cargando perfil:", err);
                showNotification("Error al cargar los datos del perfil", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleSavePersonal = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/auth/me', { name, email });
            showNotification(res.data.msg || "Perfil actualizado con éxito", "success");
            
            // Sincronizar localStorage
            const localUser = JSON.parse(localStorage.getItem('kinefy_user')) || {};
            const updatedUser = { ...localUser, ...res.data.user };
            localStorage.setItem('kinefy_user', JSON.stringify(updatedUser));
            
            // Recargar para aplicar cambios al layout
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error("Error actualizando perfil:", err);
            const errorMsg = err.response?.data?.error || "Error al actualizar los datos";
            showNotification(errorMsg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showNotification("Las contraseñas nuevas no coinciden", "error");
            return;
        }
        if (newPassword.length < 6) {
            showNotification("La nueva contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        setSaving(true);
        try {
            const res = await api.put('/auth/me', {
                currentPassword,
                newPassword
            });
            showNotification(res.data.msg || "Contraseña actualizada con éxito", "success");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Error cambiando contraseña:", err);
            const errorMsg = err.response?.data?.error || "Error al cambiar la contraseña";
            showNotification(errorMsg, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <div className="settings-loading__spinner"></div>
                <p>Cargando configuración...</p>
            </div>
        );
    }

    return (
        <section className="settings-page">
            <header className="settings-header">
                <h1 className="settings-title">Configuración</h1>
                <p className="settings-subtitle">Gestiona tus datos personales y las opciones de seguridad de tu cuenta</p>
            </header>

            <article className="settings-card">
                <nav className="settings-tabs" aria-label="Secciones de configuración">
                    <button 
                        className={`settings-tab ${activeTab === 'personal' ? 'settings-tab--active' : ''}`}
                        onClick={() => { setActiveTab('personal'); setNotification(null); }}
                    >
                        Datos personales
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'security' ? 'settings-tab--active' : ''}`}
                        onClick={() => { setActiveTab('security'); setNotification(null); }}
                    >
                        Seguridad
                    </button>
                </nav>

                <div className="settings-content">
                    {notification && (
                        <div className={`settings-alert settings-alert--${notification.type}`} role="alert">
                            <span className="settings-alert__icon">
                                {notification.type === 'success' ? '✓' : '⚠'}
                            </span>
                            <p className="settings-alert__message">{notification.msg}</p>
                        </div>
                    )}

                    {activeTab === 'personal' ? (
                        <form onSubmit={handleSavePersonal} className="settings-form">
                            <div className="settings-form__group">
                                <label className="settings-form__label" htmlFor="name">Nombre completo</label>
                                <input 
                                    id="name"
                                    type="text" 
                                    className="settings-form__input" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    placeholder="Tu nombre..."
                                />
                            </div>

                            <div className="settings-form__group">
                                <label className="settings-form__label" htmlFor="email">Correo electrónico</label>
                                <input 
                                    id="email"
                                    type="email" 
                                    className="settings-form__input" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="settings-form__btn"
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSaveSecurity} className="settings-form">
                            <div className="settings-form__group">
                                <label className="settings-form__label" htmlFor="currentPassword">Contraseña actual</label>
                                <input 
                                    id="currentPassword"
                                    type="password" 
                                    className="settings-form__input" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="settings-form__group">
                                <label className="settings-form__label" htmlFor="newPassword">Nueva contraseña</label>
                                <input 
                                    id="newPassword"
                                    type="password" 
                                    className="settings-form__input" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required 
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div className="settings-form__group">
                                <label className="settings-form__label" htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                                <input 
                                    id="confirmPassword"
                                    type="password" 
                                    className="settings-form__input" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="settings-form__btn"
                                disabled={saving}
                            >
                                {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </article>
        </section>
    );
};

export default Settings;
