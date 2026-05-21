# 8. Despliegue de la Aplicación y CI/CD

> [!IMPORTANT]
> **Nota para el Tribunal Evaluador (Módulo Despliegue):**
> La documentación técnica específica exigida para la rúbrica del módulo de Despliegue de Aplicaciones Web (Justificación de herramientas, Criterio 7 sobre artefactos y ficheros, y Criterio 8 sobre verificación de red) ha sido extraída a un documento anexo para facilitar su corrección. 
> **Por favor, diríjase a: [08-despliegue-eval.md](08-despliegue-eval.md)**

---

## 8.1. Estrategia de Control de Versiones

El proyecto Kinefy ha utilizado **Git** como sistema de control de versiones, alojando el código fuente en la plataforma GitHub. 

Para garantizar un historial limpio y coherente (Criterio C5), se ha adoptado una estrategia basada en Ramas de Funcionalidad (*Feature Branches*). La rama `master` la mantuvimos estable en todo momento. El desarrollo nuevo iba siempre en ramas separadas y se integraba mediante Pull Request una vez revisado.

---

## 8.2. Flujo de Integración y Despliegue Continuo (CI/CD)

### Entorno de Desarrollo Local (Docker)
Como se detalla en el documento de Instalación, la fase de *Delivery* local se fundamenta en la contenedorización completa mediante Docker Compose. Esto ha permitido uniformizar el entorno de desarrollo, eliminando el clásico problema de "en mi máquina sí funciona".

### Despliegue en Producción (Vercel + Railway + MongoDB Atlas)

Para el paso a producción (Live Environment), se tomó la decisión de utilizar una arquitectura cloud híbrida y desacoplada mediante plataformas SaaS y PaaS líderes, en lugar de un VPS administrado de forma manual. Las herramientas elegidas son:
- **Vercel**: Alojamiento optimizado para el frontend (React/Vite) como sitio estático de alta velocidad.
- **Railway**: Servidor web / Web Service para el backend (Node/Express), gestionando de manera automática el escalado, variables de entorno y logs.
- **MongoDB Atlas**: Base de datos documental NoSQL gestionada en la nube (DBaaS) para asegurar alta disponibilidad y copias de seguridad continuas.

Elegimos esta combinación principalmente para no tener que gestionar un VPS manualmente. Vercel y Railway se conectan al repositorio de GitHub y despliegan solos con cada push a master, lo que nos ahorra bastante trabajo de infraestructura. El HTTPS lo gestionan ellos automáticamente, y la base de datos queda aislada en Atlas.

---

### Integración Continua (CI) con GitHub Actions (Criterio C5)

Como parte de la calidad y validación del código (Criterio C5), el repositorio integra un flujo de Integración Continua (CI) gestionado con **GitHub Actions**. Este flujo se dispara automáticamente en cada `push` o `pull_request` sobre las ramas principales de desarrollo: `master`, `develop` y las ramas de nuevas funcionalidades (`feature/*`).

El pipeline automatizado se define en el fichero `.github/workflows/ci.yml` y ejecuta las siguientes tareas:
1. Realiza el `checkout` del código fuente.
2. Configura el entorno de ejecución Node.js (versión 18).
3. Instala las dependencias tanto para el backend como para el frontend.
4. Compila el frontend (`npm run build`) para verificar que no existen errores sintácticos de Vite ni TypeScript/Vite.
5. Ejecuta el set de pruebas unitarias (`npm test`) del backend.

*Snippet del flujo de integración (`.github/workflows/ci.yml`):*
```yaml
name: Kinefy CI Workflow

on:
  push:
    branches: [ "master", "develop", "feature/*" ]
  pull_request:
    branches: [ "master" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        
    - name: Install Backend Dependencies
      run: |
        cd kinefy-backend
        npm ci || npm install
        
    - name: Install Frontend Dependencies
      run: |
        cd kinefy-frontend
        npm ci || npm install
        
    - name: Build Frontend
      run: |
        cd kinefy-frontend
        npm run build
        
    - name: Run Backend Tests
      run: |
        cd kinefy-backend
        npm test
```
**Evidencia de ejecución continua:**
El pipeline está integrado orgánicamente en el flujo de trabajo. Como evidencia, durante el desarrollo de ramas como feature/clinical-reports-professionalization, el CI se ha disparado con cada commit (ej. fix: make CORS origin matching more robust, feat: add production seed script), validando el build en un tiempo medio de ~30 segundos por ejecución antes de permitir la subida a producción.

---

### Despliegue Continuo (CD) y Entorno Live

Tras pasar satisfactoriamente la validación en GitHub Actions, la integración con las plataformas de producción automatiza el despliegue de las actualizaciones:

- **Despliegue de Frontend (Vercel)**: Vercel escucha los cambios de la rama `master` en GitHub, descarga el repositorio, ejecuta el build de producción y despliega la aplicación de manera instantánea, asignando la versión en producción.
- **Despliegue de Backend (Railway)**: Railway detecta automáticamente los nuevos commits en la rama protegida `master`, reconstruye la imagen a partir del `Dockerfile` del backend e inicia el nuevo contenedor, gestionando el reemplazo progresivo de la instancia anterior sin tiempo de inactividad (*zero-downtime deployment*).

**URLs de Producción:**
* **Frontend Web (Vercel):** [https://kinefy.vercel.app](https://kinefy.vercel.app)
* **Backend API (Railway):** [https://kinefy-production.up.railway.app](https://kinefy-production.up.railway.app)

