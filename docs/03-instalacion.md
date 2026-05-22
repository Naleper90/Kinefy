# 3. Guía de Instalación y Entorno Local

Para garantizar la reproducibilidad del entorno de desarrollo y facilitar la evaluación del proyecto, Kinefy se ha "dockerizado". Esto cumple con los estándares modernos de integración y aísla la aplicación del sistema operativo anfitrión.

---

## 3.1. Requisitos Previos

*   **Motor de Contenedores:** Docker Engine v20.10+ y Docker Compose v2+. (Se recomienda Docker Desktop en Windows/Mac).
*   **Git:** Para la clonación del repositorio.
*   **Puertos libres:** Asegurarse de que el puerto `80` (Frontend Nginx) no esté siendo utilizado por otros servicios locales en el anfitrión. El puerto `5000` (Backend) es puramente interno a la red aislada de Docker, por lo que no es necesario liberarlo en el host.

---

## 3.2. Gestión de Variables de Entorno

Por motivos de seguridad, las credenciales reales de la base de datos y los secretos criptográficos no se suben al repositorio.
Antes de arrancar, es obligatorio configurar las variables de entorno:

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/naleper90/kinefy.git
   cd kinefy
   ```

2. Duplicar los archivos de ejemplo en cada subproyecto y renombrarlos a `.env`:
   * En `kinefy-backend`: Copiar `.env.example` a `.env` y establecer una cadena secreta para `JWT_SECRET`.
   * En `kinefy-frontend`: Copiar `.env.example` a `.env` y verificar que `VITE_API_URL` apunte a `/api` (bajo Docker Compose se utiliza el proxy inverso de Nginx de manera transparente) o apuntando directamente al backend para desarrollo local nativo.

---

## 3.3. Despliegue Local mediante Docker Compose

En la raíz del proyecto se incluye el orquestador `compose.yaml` (o `docker-compose.yml`) que levanta de forma simultánea el cliente, el servidor y la base de datos en una misma red virtual.

Para arrancar todo el sistema con una sola instrucción, ejecutar en la raíz del proyecto:

```bash
docker compose up --build -d
```

### 3.3.1. Verificación del despliegue local
Una vez finalizado el proceso de *build* e *install*, la aplicación estará accesible en:
*   **Frontend (App) y API (Proxy):** [http://localhost](http://localhost)
*   **Backend (API directo):** [http://localhost:5000](http://localhost:5000) (acceso directo únicamente para desarrollo nativo fuera de Docker)

Se puede comprobar el estado de los contenedores ejecutando:
```bash
docker ps
```
La salida mostrará tres contenedores activos (`kinefy-web` para el frontend/nginx, `kinefy-api` para el backend y `kinefy-db` para la base de datos MongoDB).

### 3.3.2. Persistencia de Datos en Local
El entorno Docker está configurado para mapear un volumen local a la base de datos de MongoDB. Esto garantiza que, aunque los contenedores se detengan o se destruyan mediante `docker compose down`, los datos de los pacientes y las rutinas permanecerán intactos en la próxima ejecución.

---

## 3.4. Opción Alternativa: Instalación Nativa (NPM)

Si se requiere desarrollar de forma directa sobre los archivos sin la capa de virtualización de Docker, el entorno requiere Node.js v18+ instalado.

1. **Backend:**
   ```bash
   cd kinefy-backend
   npm install
   npm run dev
   ```
2. **Frontend:** En una terminal separada:
   ```bash
   cd kinefy-frontend
   npm install
   npm run dev
   ```
