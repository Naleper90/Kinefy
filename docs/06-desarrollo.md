# 6. Proceso de Desarrollo y Retos Técnicos

El desarrollo de Kinefy se ha ejecutado siguiendo metodologías ágiles (sprints iterativos), priorizando tener una versión funcional y testeable (MVP) lo antes posible para poder iterar sobre el feedback y mejorar la estabilidad del código.

---

## 6.1. Inicialización y Setup

El proyecto se dividió físicamente en dos repositorios/carpetas de trabajo para mantener la separación estricta entre cliente y servidor:

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
│   └── pages/        # Vistas principales (Dashboard, PatientsList, Reports)
├── styles/       # Arquitectura CSS Vanilla
│   ├── 01-settings/  # Variables y tokens
│   ├── 02-tools/     # (Opcional) Funciones/Mixins
│   ├── 03-generic/   # Reset CSS
│   ├── 04-elements/  # Estilos base de etiquetas (h1, a, p)
│   └── 05-components/# Estilos modulares BEM (buttons, cards, layout)
└── main.jsx      # Punto de entrada de la aplicación
```

### 6.2.2. Arquitectura de Directorios del Backend
El servidor sigue el patrón clásico de diseño MVC (adaptado a API):

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
