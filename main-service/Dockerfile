# Usa una imagen base ligera
FROM node:20-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json yarn.lock ./

# Instala las dependencias con Yarn
RUN yarn install

# Copia el resto del proyecto
COPY . .

# Compila la aplicación
RUN yarn build

# Expone el puerto (se debe configurar según el microservicio)
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
