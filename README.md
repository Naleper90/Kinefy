# Kinefy – Plataforma web de seguimiento de rehabilitación física

Kinefy es una solución digital diseñada para mejorar la comunicación entre fisioterapeutas y pacientes durante los procesos de rehabilitación. Permite a los profesionales asignar ejercicios y monitorizar la evolución del dolor, mientras que los pacientes disponen de un diario estructurado para registrar su actividad y sensaciones.

## Stack Tecnológico

- **Frontend:** React (Vite) + React Router + Axios
- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB (Mongoose)
- **Autenticación:** JWT (JSON Web Tokens) + Bcryptjs

## Estructura del Repositorio

```text
kinefy/
├── docs/              # Documentación oficial del proyecto
├── kinefy-backend/    # Servidor API Node.js/Express
└── kinefy-frontend/   # Cliente React/Vite
```

## Documentación del Proyecto

El seguimiento y la documentación detallada del proyecto se encuentra en la carpeta `docs/`:

1. [Introducción, objetivos y antecedentes](docs/01-introduccion.md)
2. [Descripción del proyecto](docs/02-descripcion.md)
3. [Instalación y preparación](docs/03-instalacion.md)
4. [Guía de estilos y prototipado](docs/04-guia-estilos.md)
5. [Diseño técnico](docs/05-diseno.md)
6. [Desarrollo](docs/06-desarrollo.md)
7. [Pruebas](docs/07-pruebas.md)
8. [Despliegue](docs/08-despliegue.md)
9. [Manual de usuario](docs/09-manual-usuario.md)
10. [Conclusiones](docs/10-conclusiones.md)

## Configuración y Despliegue

### Requisitos Previos

- Node.js (v18+)
- MongoDB (Local o Atlas)

### Backend

1. Entra en `kinefy-backend/`.
2. Instala las dependencias: `npm install`.
3. Copia `.env.example` a `.env` y configura tus variables.
4. Inicia el servidor: `npm start` o `npm run dev`.

### Frontend

1. Entra en `kinefy-frontend/`.
2. Instala las dependencias: `npm install`.
3. Inicia el cliente: `npm run dev`.

## Estado Actual
**Sprint 1 – Análisis y diseño**
- [x] Propuesta formal del proyecto.
- [x] Estructura inicial del repositorio.
- [x] Estructura de documentación oficial (guion DAW).
- [ ] Implementación de modelos y autenticación base.

## Enlaces de Interés
- [GitHub Projects](https://github.com/Naleper90/Kinefy/projects)
