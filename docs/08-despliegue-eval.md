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
Se mapean los puertos principales hacia el *host*:
*   Frontend (Nginx Reverse Proxy): `80`
*   Backend API (Node/Express): `5000`
*   Base de Datos NoSQL (MongoDB): `27017`

*Comando de verificación (Consola):*
```bash
> docker ps
```
*Salida obtenida (Evidencia):*
```text
CONTAINER ID   IMAGE                            COMMAND                  CREATED         STATUS         PORTS                                             NAMES
585ca55412e3   kinefy-frontend                  "/docker-entrypoint.…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp, [::]:80->80/tcp               kinefy-web
dd3da4d0e7ac   kinefy-backend                   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp       kinefy-api
7b3dc457618f   mongo:latest                     "docker-entrypoint.s…"   25 hours ago    Up 2 minutes   0.0.0.0:27017->27017/tcp, [::]:27017->27017/tcp   kinefy-db
```
*Explicación:* Los tres servicios están "Up" y escuchando correctamente peticiones desde la máquina anfitriona hacia los contenedores.

### 2. Verificación del Backend a través de Nginx (Petición HTTP)
Comprobamos que el servidor web proxy (Nginx) redirige las solicitudes de la ruta `/api` al backend (Express) y responde a peticiones a través del puerto expuesto utilizando la herramienta `curl` en la terminal.

*Comando utilizado:*
```bash
curl -I http://localhost/api/patients
```

*Salida obtenida (Evidencia de comunicación y autorización correctas):*
```text
HTTP/1.1 401 Unauthorized
Server: nginx/1.30.1
Date: Wed, 20 May 2026 17:56:50 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 80
Connection: keep-alive
X-Powered-By: Express
Access-Control-Allow-Origin: *
ETag: W/"50-vnfZ8p60j7bjY7V3l+bFbxAzL5o"
```
*Explicación:* El proxy inverso de Nginx reenvía la petición al backend y este responde con un `401 Unauthorized`. Esto demuestra que la red entre contenedores funciona, la ruta existe y que, además, la arquitectura de seguridad diseñada en el Criterio 1 (Middleware JWT) está filtrando correctamente las peticiones anónimas procedentes del exterior.

### 3. Verificación de Logs del Proxy (Nginx)
Cuando el frontend o herramientas de red realizan peticiones, el servidor Nginx registra la actividad.

*Comando utilizado:*
```bash
docker logs kinefy-web --tail 5
```
*Salida obtenida:*
```text
2026/05/20 17:55:19 [notice] 1#1: start worker process 41
2026/05/20 17:55:19 [notice] 1#1: start worker process 42
2026/05/20 17:55:19 [notice] 1#1: start worker process 43
2026/05/20 17:55:19 [notice] 1#1: start worker process 44
172.20.0.1 - - [20/May/2026:17:56:50 +0000] "HEAD /api/patients HTTP/1.1" 401 0 "-" "curl/8.19.0" "-"
```
*Explicación:* El log evidencia que el servidor Nginx funciona como proxy inverso y servidor estático, despachando los archivos estáticos en el puerto 80 y registrando las llamadas correctas a `/api/*`.

---

## Justificación de HTTP en entorno local

El entorno Docker local se despliega bajo HTTP (puerto 80) para facilitar el desarrollo y la verificación técnica. En producción, la terminación SSL/HTTPS se delega al proxy de Railway (backend) y a Vercel (frontend), que gestionan los certificados automáticamente. No es necesario configurar certificados locales para validar el funcionamiento del proxy inverso.

## Verificación del proxy Nginx

Comandos de verificación con sus salidas esperadas:

```bash
# Levantar entorno
docker compose up -d
docker compose ps
# Verificar frontend
curl -I http://localhost
# Esperado: HTTP/1.1 200 OK
# Verificar proxy API
curl -I http://localhost/api/auth/login
# Esperado: HTTP/1.1 404 o 405 (llega al backend, Nginx redirige correctamente)
# Ver logs del proxy en tiempo real
docker logs kinefy-frontend -f
```

## Middlewares de seguridad y logs del backend

Se han añadido `helmet`, `morgan` y `express-rate-limit` en `app.js`.

*Fragmento de código relevante:*
```javascript
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Security HTTP headers
app.use(helmet());

// HTTP request logger
app.use(morgan('combined'));

// Rate limiter for login route (DWES/Despliegue)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en un minuto' }
});
app.use('/api/auth/login', loginLimiter);
```

*Salida real de Morgan de las pruebas:*
```text
::ffff:127.0.0.1 - - [21/May/2026:06:59:07 +0000] "GET /api/patients HTTP/1.1" 401 80 "-" "-"
```
