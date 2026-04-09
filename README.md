# Kinefy – Seguimiento de Rehabilitación Física

Kinefy es una aplicación web centrada en facilitar el registro de ejercicios y la monitorización del dolor en procesos de rehabilitación. El proyecto surge para cubrir la falta de comunicación estructural entre las sesiones presenciales de fisioterapia, proporcionando un canal de datos real entre el profesional y el paciente.

## Enfoque y Diseño: Organic Minimalism

El proyecto se aleja de los frameworks de componentes tradicionales para priorizar la mantenibilidad y el rendimiento mediante código artesanal:
- **CSS Puro y BEM**: Arquitectura de estilos basada en bloques, sin dependencias externas.
- **Identidad Visual**: Paleta basada en tonos menta y azul con elementos orgánicos para reducir la carga cognitiva del paciente.
- **Accesibilidad**: Cumplimiento de WCAG AA para asegurar la legibilidad y usabilidad.

## Estado del Proyecto (Sprint 2)

Actualmente se ha completado la base visual y la estructura de navegación:
- **Arquitectura de componentes**: Sistema escalable siguiendo patrones de React.
- **Sistema de diseño**: Variables CSS centralizadas y diseño completamente adaptativo.
- **Interfaz del Paciente**: Registro de actividad, escalas de dolor (1-10) y panel de observaciones.
- **Módulo de Acceso**: Flujo de autenticación con diseño minimalista.
- **API (Desarrollo)**: Estructura base en Node.js/Express con persistencia en MongoDB.

## Stack Tecnológico

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | SPA para evitar recargas constantes en el uso diario. |
| **Estilos** | CSS Pure / BEM | Control total sobre la jerarquía y rendimiento. |
| **Backend** | Node.js / Express | API REST escalable con separación de responsabilidades. |
| **Base de Datos** | MongoDB | Modelo de datos flexible para pautas de salud variables. |
| **Seguridad** | JWT / Bcrypt | Gestión de sesiones segura y cifrado de contraseñas. |

## Documentación del Proyecto

El detalle técnico y académico se encuentra en la carpeta `docs/`:

1.  [Introducción y Justificación](docs/01-introduccion.md)
2.  [Descripción del MVP](docs/02-descripcion.md)
3.  [Instalación](docs/03-instalacion.md)
4.  [Guía de Estilos](docs/04-guia-estilos.md)
5.  [Arquitectura Técnica](docs/05-diseno.md)
6.  [Paso a paso del Desarrollo](docs/06-desarrollo.md)
7.  [Pruebas de Sistema](docs/07-pruebas.md)
8.  [Despliegue](docs/08-despliegue.md)
9.  [Guía de Uso](docs/09-manual-usuario.md)
10. [Conclusiones finales](docs/10-conclusiones.md)

---

## Inicio Rápido

### Requisitos
- Node.js (v18+)
- MongoDB Atlas o local

### Instalación
```bash
# Servidor
cd kinefy-backend && npm install && npm run dev

# Cliente
cd kinefy-frontend && npm install && npm run dev
```

---
Proyecto Final de Ciclo (2º DAW) - **Natalia Alejo Pérez**.
