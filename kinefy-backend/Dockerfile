# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY --chown=node:node package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código con permisos para el usuario node
COPY --chown=node:node . .

# Usamos el usuario no privilegiado 'node'
USER node

# Exponemos el puerto
EXPOSE 5000


# Comando para arrancar la aplicación
CMD ["npm", "start"]
