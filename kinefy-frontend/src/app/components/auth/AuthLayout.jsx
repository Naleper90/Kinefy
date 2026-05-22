import React, { useState } from 'react';
import { KinefyLogo, BlobIcon } from './AuthIcons';


const AuthLayout = ({ children, title, subtitle, footerActions }) => {
    const [showLegal, setShowLegal] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    return (
        <section className="auth-page">
            {/* Panel de Identidad (Izquierda/Fondo según el breakpoint) */}
            <aside className="auth-page__identity">
                <div className="auth-page__identity-content">
                    <KinefyLogo className="auth-page__logo" />
                    <blockquote className="auth-page__quote">
                        &quot;El camino a tu recuperación empieza aquí.&quot;
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
                        <div className="auth__footer-meta">
                            <button
                                type="button"
                                className="auth__footer-link"
                                onClick={() => setShowLegal(true)}
                            >
                                Aviso Legal
                            </button>
                            <span className="auth__footer-separator">•</span>
                            <button
                                type="button"
                                className="auth__footer-link"
                                onClick={() => setShowPrivacy(true)}
                            >
                                Privacidad
                            </button>
                        </div>
                    </footer>

                </article>
            </main>

            {/* Modal de Aviso Legal */}
            {showLegal && (
                <div className="auth__modal-overlay" onClick={() => setShowLegal(false)}>
                    <div className="auth__modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="auth__modal-title">Aviso Legal</h3>
                        <div className="auth__modal-body">
                            <p className="auth__modal-text">
                                <strong>Titular del sitio web:</strong> Natalia Alejo Pérez<br />
                                <strong>Finalidad:</strong> Proyecto Académico de Fin de Ciclo (2º DAW).
                            </p>
                            <p className="auth__modal-text">
                                Este sitio web ha sido creado con fines exclusivamente educativos en el marco del Proyecto Integrado del I.E.S. Rafael Alberti. Toda la información médica o de salud contenida es simulada o con fines demostrativos.
                            </p>
                            <h4 className="auth__modal-subtitle">Propiedad Intelectual</h4>
                            <p className="auth__modal-text">
                                El código fuente y el diseño de Kinefy es propiedad de la autora bajo licencia MIT. Los iconos y tipografías utilizados pertenecen a sus respectivos autores.
                            </p>
                            <h4 className="auth__modal-subtitle">Limitación de Responsabilidad</h4>
                            <p className="auth__modal-text">
                                Kinefy no sustituye en ningún caso el consejo médico profesional. Ante cualquier duda sobre su salud o tratamiento, consulte siempre con su fisioterapeuta colegiado.
                            </p>
                        </div>
                        <button className="auth__modal-btn" onClick={() => setShowLegal(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Política de Privacidad */}
            {showPrivacy && (
                <div className="auth__modal-overlay" onClick={() => setShowPrivacy(false)}>
                    <div className="auth__modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="auth__modal-title">Política de Privacidad</h3>
                        <div className="auth__modal-body">
                            <p className="auth__modal-text">
                                <em>Última actualización: Mayo 2024</em>
                            </p>
                            <p className="auth__modal-text">
                                En Kinefy, nos tomamos muy en serio la privacidad de sus datos, especialmente al tratarse de información sensible relacionada con su salud. Esta política describe cómo recogemos y tratamos sus datos cumpliendo con el RGPD.
                            </p>
                            <h4 className="auth__modal-subtitle">1. Responsable del Tratamiento</h4>
                            <p className="auth__modal-text">
                                El responsable del tratamiento de sus datos es Natalia Alejo Pérez (Proyecto Fin de Ciclo). Puede contactar con nosotros para cualquier duda legal.
                            </p>
                            <h4 className="auth__modal-subtitle">2. Datos que recogemos</h4>
                            <p className="auth__modal-text">
                                Recogemos datos de identificación (nombre, email) y datos de salud (ejercicios, niveles de dolor, diagnósticos) proporcionados por usted o su fisioterapeuta.
                            </p>
                            <h4 className="auth__modal-subtitle">3. Finalidad</h4>
                            <p className="auth__modal-text">
                                La finalidad es puramente asistencial: permitir el seguimiento de su rehabilitación física y facilitar la comunicación con su fisioterapeuta.
                            </p>
                            <h4 className="auth__modal-subtitle">4. Sus Derechos</h4>
                            <p className="auth__modal-text">
                                Usted tiene derecho a acceder, rectificar o suprimir sus datos en cualquier momento. Al ser un entorno clínico simulado, sus datos están protegidos por el deber de confidencialidad académica y profesional.
                            </p>
                        </div>
                        <button className="auth__modal-btn" onClick={() => setShowPrivacy(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AuthLayout;
