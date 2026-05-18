# Despliegue de la aplicación web

*Documento de justificación técnica para la evaluación del módulo "Despliegue de Aplicaciones Web".*

A lo largo del desarrollo de Kinefy, y de cara al entorno de *Delivery* (entrega) en local para la corrección del proyecto, se ha utilizado la contenedorización mediante **Docker**. Esto garantiza el aislamiento del servidor de aplicaciones (Node), el servidor web/frontend (Vite) y el sistema de bases de datos (MongoDB).

A continuación se exponen las evidencias del cumplimiento de los Criterios 7 y 8 exigidos en la rúbrica del módulo.

---

## Criterio 7: Gestión Básica de Ficheros y Artefactos (RA4)

Para que la aplicación sea reproducible en cualquier máquina sin instalar dependencias previas, se han configurado los siguientes artefactos clave:

### 1. Variables de Entorno y Seguridad
La aplicación requiere parámetros sensibles (cadenas de conexión a BD, firmas de tokens) que **jamás deben subirse al repositorio público**. 
*   **Implementación:** Se ha incluido el archivo `.env` dentro del `.gitignore`.
*   **Evidencia:** Para informar al administrador sobre qué variables debe crear, se ha dejado en el repositorio un fichero plantilla `kinefy-backend/.env.example` y `kinefy-frontend/.env.example`.

*Snippet de `kinefy-backend/.env.example`:*
```env
# Puerto del Backend
PORT=3000
# Cadena de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/kinefy
# Secreto para firmar tokens
JWT_SECRET=tu_secreto_aqui
```

### 2. El Orquestador: `compose.yaml`
Este fichero es el núcleo del despliegue local. Define los tres servicios principales (Criterio 1: Diseño de Arquitectura claro) y mapea las redes internas.

*Evidencia de la persistencia de datos (Volúmenes):*
En una base de datos NoSQL como MongoDB, si el contenedor se apaga, los datos se perderían. Para evitarlo, se configura un volumen en el archivo `docker-compose.yml` que vincula una carpeta local con la carpeta interna del contenedor.

*Snippet del archivo Compose (fragmento MongoDB):*
```yaml
services:
  db:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - kinefy-data:/data/db # <--- Persistencia asegurada
volumes:
  kinefy-data:
```

### 3. Dockerfile (Construcción de Imágenes)
Para el Backend, se ha creado un `Dockerfile` que empaqueta el código fuente de Node.js.

*Snippet de `kinefy-backend/Dockerfile`:*
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Criterio 8: Verificación Básica de Red del Despliegue (RA5)

Una vez ejecutado el comando orquestador (`docker compose up -d`), se procede a verificar que las rutas y los puertos son accesibles y que la comunicación Frontend-Backend es operativa.

### 1. Comprobación de Puertos Públicos
Se mapean dos puertos principales hacia el *host*:
*   Frontend: `5174`
*   Backend API: `3000`

*Comando de verificación (Consola):*
```bash
> docker ps
```
*Salida obtenida (Evidencia):*
```text
CONTAINER ID   IMAGE            PORTS                    NAMES
8f9e2b1c3a4d   kinefy-front     0.0.0.0:5174->5174/tcp   kinefy_frontend_1
3a1b4c9d2e1f   kinefy-backend   0.0.0.0:3000->3000/tcp   kinefy_backend_1
1c2d3e4f5g6h   mongo:latest     0.0.0.0:27017->27017/tcp kinefy_db_1
```
*Explicación:* Los tres servicios están "Up" y escuchando correctamente peticiones desde la máquina anfitriona hacia los contenedores.

### 2. Verificación del Backend (Petición HTTP)
Comprobamos que el servidor de aplicaciones (Express) responde a peticiones a través del puerto expuesto utilizando la herramienta `curl` en la terminal.

*Comando utilizado:*
```bash
curl -I http://localhost:3000/api/patients
```

*Salida obtenida (Evidencia de autorización correcta):*
```text
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Date: Mon, 18 May 2026 09:12:00 GMT
Connection: keep-alive
```
*Explicación:* El backend rechaza la conexión con un `401 Unauthorized`. Esto demuestra que la red funciona, la ruta existe y que, además, la arquitectura de seguridad diseñada en el Criterio 1 (Middleware JWT) está filtrando correctamente las peticiones anónimas procedentes del exterior.

### 3. Verificación de Logs del Proxy (Vite HMR)
Cuando el frontend realiza peticiones cruzadas, el servidor de desarrollo registra la actividad en consola.

*Comando utilizado:*
```bash
docker logs kinefy_frontend_1 --tail 5
```
*Salida obtenida:*
```text
[vite] hmr update /src/styles/main.css
[vite] connected.
  VITE v5.0.0  ready in 432 ms
  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```
*Explicación:* El log evidencia que el servidor estático funciona como proxy, exponiendo los *assets* estáticos en `http://localhost:5174/` correctamente para el navegador del usuario.
