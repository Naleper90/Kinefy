import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../api/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'fisioterapeuta'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/auth/register', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            console.error("Error en registro:", err);
            setError(err.response?.data?.error || 'Error al crear la cuenta.');
        }
    };

    return (
        <AuthLayout
            title="Crear cuenta"
            subtitle="Únete a la red de fisioterapeutas de Kinefy"
            footerActions={
                <>
                    <span className="auth__nav-label">¿Ya tienes cuenta?</span>
                    <Link to="/login">Inicia sesión</Link>
                </>
            }
        >
            <form className="auth__form" onSubmit={handleSubmit}>
                {success ? (
                    <article className="animate-in" style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ color: '#55A98A', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>¡Bienvenido a Kinefy!</div>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Tu cuenta de profesional ha sido creada. Redirigiendo al login...</p>
                    </article>
                ) : (
                    <>
                        {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                        <label className="auth__field" htmlFor="name">
                            <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <input
                                id="name"
                                className="auth__input"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Nombre completo"
                            />
                        </label>

                        <label className="auth__field" htmlFor="email">
                            <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <input
                                id="email"
                                className="auth__input"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="Correo electrónico"
                            />
                        </label>

                        <label className="auth__field" htmlFor="password">
                            <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <input
                                id="password"
                                className="auth__input"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Crear contraseña"
                            />
                            <button
                                type="button"
                                className="auth__visibility-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="auth__visibility-icon">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="auth__visibility-icon">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </label>

                        <button className="auth__button" type="submit" style={{ marginTop: '1.5rem' }}>
                            Registrarse como Profesional
                        </button>
                    </>
                )}
            </form>
        </AuthLayout>
    );
};

export default Register;
