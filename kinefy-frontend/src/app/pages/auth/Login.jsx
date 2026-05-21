import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../api/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
        <AuthLayout 
            title="Bienvenido de nuevo" 
            subtitle="Inicia sesión en tu cuenta de Kinefy"
            footerActions={
                <>
                    <span className="auth__nav-link--disabled" title="Esta función está deshabilitada temporalmente">¿Olvidaste tu contraseña?</span>
                    <span className="auth__nav-link--disabled" title="Esta función está deshabilitada temporalmente">Crear una cuenta</span>
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
                    <input
                        id="password"
                        className="auth__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Contraseña"
                    />
                </label>

                <button className="auth__button" type="submit">
                    Iniciar Sesión
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
