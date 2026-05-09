import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#1A2E35' }}>
            <Link to="/" style={{ color: '#55A98A', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>&larr; Volver</Link>
            <h1 style={{ color: '#55A98A' }}>Política de Privacidad</h1>
            <p><strong>Última actualización: Mayo 2024</strong></p>
            
            <p>En Kinefy, nos tomamos muy en serio la privacidad de sus datos, especialmente al tratarse de información sensible relacionada con su salud. Esta política describe cómo recogemos y tratamos sus datos cumpliendo con el RGPD.</p>
            
            <h2>1. Responsable del Tratamiento</h2>
            <p>El responsable del tratamiento de sus datos es Natalia Alejo Pérez (Proyecto Fin de Ciclo). Puede contactar con nosotros para cualquier duda legal en privacidad@kinefy.example.</p>
            
            <h2>2. Datos que recogemos</h2>
            <p>Recogemos datos de identificación (nombre, email) y datos de salud (ejercicios, niveles de dolor, diagnósticos) proporcionados por usted o su fisioterapeuta.</p>
            
            <h2>3. Finalidad</h2>
            <p>La finalidad es puramente asistencial: permitir el seguimiento de su rehabilitación física y facilitar la comunicación con su fisioterapeuta.</p>
            
            <h2>4. Sus Derechos</h2>
            <p>Usted tiene derecho a acceder, rectificar o suprimir sus datos en cualquier momento. Al ser un entorno clínico, sus datos están protegidos por el deber de confidencialidad profesional.</p>
        </div>
    );
};

export default PrivacyPolicy;
