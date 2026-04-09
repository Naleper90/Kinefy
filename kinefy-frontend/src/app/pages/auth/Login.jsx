import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        // Redirect to dashboard for now
        window.location.href = '/dashboard';
    };

    return (
        <section className="auth">
            <h1 className="auth__title">Kinefy - Login</h1>
            <form className="auth__form" onSubmit={handleSubmit}>
                <fieldset className="auth__group">
                    <label className="auth__label" htmlFor="email">Email:</label>
                    <input
                        id="email"
                        className="auth__input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </fieldset>
                <fieldset className="auth__group">
                    <label className="auth__label" htmlFor="password">Password:</label>
                    <input
                        id="password"
                        className="auth__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </fieldset>
                <button className="auth__button" type="submit">
                    Entrar
                </button>
            </form>
        </section>
    );
};

export default Login;
