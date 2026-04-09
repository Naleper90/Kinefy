import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register attempt:', { name, email, password });
    };

    return (
        <AuthLayout 
            title="Crear cuenta" 
            subtitle="Únete a la red de fisioterapeutas de Kinefy"
        >
            <form className="auth__form" onSubmit={handleSubmit}>
                <label className="auth__field" htmlFor="name">
                    <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input
                        id="name"
                        className="auth__input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nombre completo"
                    />
                </label>

                <label className="auth__field" htmlFor="email">
                    <svg className="auth__field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
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
                        placeholder="Crear contraseña"
                    />
                </label>

                <button className="auth__button" type="submit">
                    Registrarse
                </button>

                <nav className="auth__nav">
                    <span style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>¿Ya tienes cuenta?</span>
                    <Link to="/login">Inicia sesión</Link>
                </nav>
            </form>
        </AuthLayout>
    );
};

export default Register;
