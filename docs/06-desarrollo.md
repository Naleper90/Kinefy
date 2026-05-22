# 6. Proceso de Desarrollo y Retos Técnicos

El desarrollo de Kinefy se ha ejecutado siguiendo metodologías ágiles (sprints iterativos), priorizando tener una versión funcional y testeable (MVP) lo antes posible para poder iterar sobre el feedback y mejorar la estabilidad del código.

---

## 6.1. Inicialización y Setup

El proyecto se dividió en dos carpetas de trabajo dentro del mismo repositorio para mantener la separación estricta entre cliente y servidor.

### Frontend (`kinefy-frontend`)
Se inicializó el proyecto utilizando **Vite** con la plantilla de React. La elección de Vite frente al clásico `create-react-app` se fundamenta en su servidor de desarrollo basado en ES modules nativos (HMR ultra-rápido) y su proceso de build optimizado.
*   **Dependencias clave instaladas:** `react-router-dom` para la gestión del enrutado SPA, y la vinculación de los archivos CSS globales y de componentes utilizando el estándar BEM.

### Backend (`kinefy-backend`)
Se inicializó un proyecto Node vacío (`npm init`) configurando el package.json para soportar scripts de desarrollo con `nodemon`.
*   **Dependencias clave instaladas:** `express` (framework), `mongoose` (modelado de base de datos), `jsonwebtoken` y `bcryptjs` (seguridad), `cors` (habilitar peticiones cruzadas desde el frontend) y `dotenv` (gestión de variables de entorno).

---

## 6.2. Estructuración del Código

### 6.2.1. Arquitectura de Directorios del Frontend
Para mantener un código predecible y escalable, se implementó una estructura basada en responsabilidades (*Feature/Page-based routing*):

```text
src/
├── api/          # Configuración de Axios/fetch y endpoints
├── app/
│   ├── auth/         # Componentes y páginas de Login/Registro
│   ├── components/   # Componentes reusables (Layouts, Sidebar, Icons)
│   └── pages/        # Vistas principales (Dashboard - modularizado con PatientDetailSections.jsx, PatientsList, Reports)
├── styles/       # Arquitectura CSS Vanilla
│   ├── 01-settings/  # Variables y tokens
│   ├── 02-tools/     # (Opcional) Funciones/Mixins
│   ├── 03-generic/   # Reset CSS
│   ├── 04-elements/  # Estilos base de etiquetas (h1, a, p)
│   └── 05-components/# Estilos modulares BEM (buttons, cards, layout)
└── main.jsx      # Punto de entrada de la aplicación
```

### 6.2.2. Arquitectura de Directorios del Backend
El servidor sigue el patrón MVC adaptado a API REST (sin capa View, sustituida por las respuestas JSON de los controladores):

```text
src/
├── config/       # Conexión a MongoDB
├── controllers/  # Lógica de negocio (authController, patientController)
├── middlewares/  # Validaciones (verifyToken, isFisio)
├── models/       # Esquemas de Mongoose (User, Exercise, Appointment)
└── routes/       # Definición de endpoints HTTP
```

---

## 6.3. Retos Técnicos y Soluciones

Durante el desarrollo se presentaron diversos desafíos arquitectónicos que requirieron soluciones específicas:

### 1. Gestión del Estado Asíncrono (React)
*   **Reto:** Al navegar entre el Dashboard y la lista de pacientes, se realizaban peticiones redundantes a la API, provocando tiempos de carga (`loading states`) continuos.
*   **Solución:** Se implementaron `useEffect` estratégicos combinados con un estado local robusto en los componentes padre. Aunque se evaluó el uso de Context API o Redux, para el alcance del MVP fue suficiente una elevación del estado (*Lifting State Up*) en los layouts principales para evitar la sobreingeniería.

### 2. Implementación del "Organic Minimalism" en CSS Puro
*   **Reto:** Conseguir que los componentes (especialmente los botones y tarjetas) tuvieran formas orgánicas y asimétricas ("blobs") que además se animaran de forma fluida al interactuar, sin penalizar el rendimiento ni usar librerías de SVG pesado.
*   **Solución:** Se dominó el uso avanzado de la propiedad `border-radius` con 8 valores (`border-radius: x x x x / y y y y`). Mediante transiciones cúbicas (`cubic-bezier`) en el `:hover`, se logró que el CSS Engine del navegador calculara las interpolaciones matemáticas de forma nativa a 60fps, resultando en animaciones "líquidas" con impacto cero en el hilo principal de JavaScript.

### 3. Problemas de HMR (Hot Module Replacement) con Vite
*   **Reto:** En fases avanzadas de estilizado, se produjeron errores `500 Internal Server Error` y desconexiones del servidor Vite al inyectar reglas complejas o corruptas de CSS (problemas de codificación UTF-16 en Windows).
*   **Solución:** Se sanearon los archivos `.css` problemáticos, asegurando una codificación UTF-8 estricta. Además, se modularizó el archivo gigante de estilos en componentes más pequeños dentro de `05-components/`, lo que redujo el tamaño de los módulos recargados por Vite y estabilizó por completo el entorno de desarrollo local.

### 4. Refactorización de Componentes Complejos y Control de Calidad Estricto (ESLint en CI/CD)
*   **Reto:** El componente `PatientDetail.jsx` creció en exceso de complejidad, superando las 800 líneas de código y mezclando lógica de diferentes secciones (datos del paciente, historial clínico, citas, etc.), lo cual dificultaba su mantenimiento y provocaba advertencias y errores de ESLint que bloqueaban el pipeline de CI/CD.
*   **Solución:** Se realizó una refactorización modular extrema, extrayendo las secciones secundarias (citas, ejercicios, historial y evolución) a un nuevo archivo complementario `PatientDetailSections.jsx`. Además, se subsanaron más de 40 warnings y errores de ESLint en todo el frontend (como dependencias incorrectas de `useEffect`, referencias inútiles e importaciones huérfanas) y se configuró el pipeline de GitHub Actions para que fallara y bloqueara la integración si el linter detecta algún problema, garantizando la sostenibilidad y limpieza del código a largo plazo.

---

## 6.4. Planificación del Proyecto (GitHub Projects)

Para el seguimiento del desarrollo y garantizar una metodología de trabajo ágil (Kanban/Scrum) transparente, el ciclo de vida de las tareas se ha gestionado mediante la herramienta integrada de GitHub. 

*   **Enlace al Tablero del Proyecto:** [GitHub Project - Kinefy #5](https://github.com/users/Naleper90/projects/5)

El flujo de trabajo y la distribución de columnas en el tablero se estructuran de la siguiente manera:

*   **Backlog:** Historias de usuario nucleares del MVP (ej. HU-01 a HU-09) y epics a futuro.
*   **Por Hacer (To Do):** Tareas del sprint que se van a acometer a corto plazo.
*   **En Progreso (In Progress):** Tareas en desarrollo activo (asociadas a ramas de funcionalidad `feature/*`).
*   **En Revisión / CI:** Pull Requests abiertas para revisión, donde el pipeline de **GitHub Actions** valida automáticamente la compilación del frontend y los tests unitarios del backend.
*   **Hecho (Done):** Funcionalidades completamente integradas en la rama `master` y desplegadas de forma continua en producción (Vercel y Railway).
