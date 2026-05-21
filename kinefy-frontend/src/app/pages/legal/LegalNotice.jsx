import React from 'react';
import { Link } from 'react-router-dom';

const LegalNotice = () => {
    return (
        <main className="legal-page">
            <Link to="/" className="legal-page__back-link">&larr; Volver</Link>
            <h1 className="legal-page__title">Aviso Legal</h1>
            <p><strong>Titular del sitio web:</strong> Natalia Alejo Pérez</p>
            <p><strong>Finalidad:</strong> Proyecto Académico de Fin de Ciclo (2º DAW).</p>
            
            <p>Este sitio web ha sido creado con fines exclusivamente educativos en el marco del Proyecto Integrado del I.E.S. Rafael Alberti. Toda la información médica o de salud contenida es simulada o con fines demostrativos.</p>
            
            <h2>Propiedad Intelectual</h2>
            <p>El código fuente y diseño de Kinefy es propiedad de la autora bajo licencia MIT. Los iconos y tipografías utilizados pertenecen a sus respectivos autores.</p>
            
            <h2>Limitación de Responsabilidad</h2>
            <p>Kinefy no sustituye en ningún caso el consejo médico profesional. Ante cualquier duda sobre su salud o tratamiento, consulte siempre con su fisioterapeuta colegiado.</p>
        </main>
    );
};

export default LegalNotice;
