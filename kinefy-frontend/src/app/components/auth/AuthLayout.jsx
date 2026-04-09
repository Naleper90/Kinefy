import React from 'react';
import { KinefyLogo, BlobIcon } from './AuthIcons';

const AuthLayout = ({ children, title, subtitle, footerActions }) => {
    return (
        <section className="auth-page">
            {/* Panel de Identidad (Izquierda/Fondo según el breakpoint) */}
            <aside className="auth-page__identity">
                <div className="auth-page__identity-content">
                    <KinefyLogo className="auth-page__logo" />
                    <blockquote className="auth-page__quote">
                        "El camino a tu recuperación empieza aquí."
                    </blockquote>
                </div>
                {/* Composición de acuarelas dual (Menta + Azul) */}
                <BlobIcon className="auth-page__identity-blob auth-page__identity-blob--mint" color="#98D2C1" />
                <BlobIcon className="auth-page__identity-blob auth-page__identity-blob--blue" color="#B4E1FF" />
            </aside>

            {/* Panel de Formulario (Derecha) */}
            <main className="auth-page__form-container">
                <article className="auth">
                    <header className="auth__header">
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                    </header>

                    <section className="auth__body">
                        {children}
                    </section>

                    <footer className="auth__footer">
                        {footerActions && (
                            <nav className="auth__nav" aria-label="Navegación de autenticación">
                                {footerActions}
                            </nav>
                        )}
                    </footer>
                </article>
            </main>
        </section>
    );
};

export default AuthLayout;
