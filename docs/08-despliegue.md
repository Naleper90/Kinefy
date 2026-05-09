# Despliegue de la aplicación web

Este apartado detalla la arquitectura y el proceso de despliegue de Kinefy, cumpliendo con los requisitos de gestión de artefactos y verificación de red.

## 1. Gestión de Artefactos de Despliegue (Criterio 7 - RA4)

La aplicación utiliza **Docker** y **Docker Compose** para garantizar un entorno reproducible y aislado. Los artefactos principales son:

### 1.1. Dockerfiles
Se han implementado Dockerfiles específicos para el frontend y el backend:

**Backend (`kinefy-backend/Dockerfile`):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend (`kinefy-frontend/Dockerfile`):**
Utiliza un sistema de construcción multietapa para optimizar el peso de la imagen y servir los estáticos mediante Nginx.
```dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 1.2. Orquestación con Docker Compose
El archivo `docker-compose.yml` centraliza la gestión de los tres servicios necesarios: Base de datos (MongoDB), API (Backend) y Web (Frontend).

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: kinefy-db
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
    networks: ["kinefy-network"]

  backend:
    build: ./kinefy-backend
    container_name: kinefy-api
    ports: ["5000:5000"]
    environment:
      - MONGO_URI=mongodb://mongodb:27017/kinefy
    depends_on: ["mongodb"]
    networks: ["kinefy-network"]

  frontend:
    build: ./kinefy-frontend
    container_name: kinefy-web
    ports: ["80:80"]
    depends_on: ["backend"]
    networks: ["kinefy-network"]
```

## 2. Verificación de Red y Proxy Inverso (Criterio 8 - RA5 & Criterio 3)

### 2.1. Configuración del Servidor Web como Front (Proxy Inverso)
Se ha configurado **Nginx** no solo para servir los archivos estáticos, sino para actuar como proxy inverso, redirigiendo las peticiones `/api` al contenedor del backend. Esto centraliza la seguridad y evita problemas de CORS.

**Fragmento de `nginx.conf`:**
```nginx
location /api {
    proxy_pass http://backend:5000/api;
    proxy_set_header Host $host;
}
```

### 2.2. Verificación de Conectividad
Para validar que el despliegue funciona correctamente, se utilizan los siguientes comandos:

1. **Estado de los contenedores:**
   `docker compose ps`
   *Salida esperada:* Todos los servicios en estado `Up`.

2. **Prueba de red desde el host:**
   `curl -I http://localhost/api`
   *Verificación:* Si devuelve un código `200 OK` o `301`, la red entre Nginx y el Backend es operativa.

3. **Comunicación interna:**
   El backend se conecta a MongoDB mediante el nombre de servicio `mongodb` definido en la red `kinefy-network`, lo cual demuestra el uso correcto de la resolución de nombres interna de Docker.

## 3. Implementación de Funcionalidades Críticas (Email)

Se ha integrado el envío de correos electrónicos mediante **Nodemailer** para la notificación de nuevos pacientes. La configuración se gestiona mediante variables de entorno en el archivo `.env`.

**Evidencia de implementación:**
```javascript
// kinefy-backend/src/utils/mailer.js
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
```
