import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../api/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            
            // Guardamos el token y el usuario real en localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('kinefy_user', JSON.stringify(res.data.user));

            const role = res.data.user.role;

            // Redirección basada en el rol real de la base de datos
            window.location.href = role === 'paciente' ? '/dashboard/patient' : '/dashboard/physio';
        } catch (err) {
            console.error("Error en login:", err);
            setError('Credenciales incorrectas o problema de servidor.');
        }
    };

    return (
        <>
            <AuthLayout 
                title="Bienvenido de nuevo" 
                subtitle="Inicia sesión en tu cuenta de Kinefy"
                footerActions={
                    <>
                        <button 
                            type="button" 
                            className="auth__nav-link-btn" 
                            onClick={() => setShowRecoveryModal(true)}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                        <Link to="/register">Crear una cuenta</Link>
                    </>
                }
            >
                <form className="auth__form" onSubmit={handleSubmit}>
                    {error && <div className="auth__error-message" style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                    <label className="auth__field" htmlFor="email">
                        <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <input
                            id="email"
                            className="auth__input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Correo electrónico..."
                        />
                    </label>

                    <label className="auth__field" htmlFor="password">
                        <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <div className="auth__input-wrapper">
                            <input
                                id="password"
                                className="auth__input"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Contraseña"
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
                        </div>
                    </label>

                    <button className="auth__button" type="submit">
                        Iniciar Sesión
                    </button>
                </form>
            </AuthLayout>

            {showRecoveryModal && (
                <div className="auth__modal-overlay" onClick={() => setShowRecoveryModal(false)}>
                    <div className="auth__modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="auth__modal-title">Recuperación de Contraseña</h3>
                        <p className="auth__modal-text">
                            Por motivos de seguridad y confidencialidad de tus datos de salud, si eres <strong>paciente</strong> y has olvidado tu contraseña debes solicitar el restablecimiento a tu <strong>fisioterapeuta</strong>.
                        </p>
                        <p className="auth__modal-text">
                            Tu especialista podrá generarte una clave temporal desde tu ficha clínica, que recibirás automáticamente en tu correo electrónico.
                        </p>
                        <p className="auth__modal-text">
                            Si eres <strong>fisioterapeuta</strong>, ponte en contacto con el administrador del centro.
                        </p>
                        <button className="auth__modal-btn" onClick={() => setShowRecoveryModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
