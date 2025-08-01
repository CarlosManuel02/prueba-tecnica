# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias primero (mejora el cacheo de capas)
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar el proyecto NestJS
RUN yarn build

# Etapa 2: Producción
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

CMD ["node", "dist/main"]
