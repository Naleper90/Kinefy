import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        window.location.href = '/dashboard';
    };

    return (
        <AuthLayout 
            title="Bienvenido de nuevo" 
            subtitle="Inicia sesión en tu cuenta de fisioterapeuta"
        >
            <form className="auth__form" onSubmit={handleSubmit}>
                <label className="auth__field" htmlFor="email">
                    <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input
                        id="email"
                        className="auth__input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Correo electrónico"
                    />
                </label>

                <label className="auth__field" htmlFor="password">
                    <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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

                <nav className="auth__nav">
                    <Link to="#">¿Olvidaste tu contraseña?</Link>
                    <Link to="/register">Crear una cuenta</Link>
                </nav>
            </form>
        </AuthLayout>
    );
};

export default Login;
