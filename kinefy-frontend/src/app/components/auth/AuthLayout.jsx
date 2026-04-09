import React from 'react';
import { KinefyLogo, BotanicalDecoration } from './AuthIcons';

/**
 * Purist & Premium Auth Layout (Restored Branding)
 */
const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="auth-page">
            <main className="auth">
                <header className="auth__header">
                    <KinefyLogo />
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </header>

                {children}

                <footer className="auth__footer">
                    <span className="auth__ornament">
                        <BotanicalDecoration />
                    </span>
                </footer>
            </main>
        </div>
    );
};

export default AuthLayout;
