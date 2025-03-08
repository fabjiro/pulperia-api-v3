# Etapa 1: Construcción con Node.js y pnpm
FROM node:20-alpine AS builder

# Configuración del entorno de trabajo
WORKDIR /app

# Copia los archivos necesarios para instalar las dependencias
COPY package.json pnpm-lock.yaml ./

# Instala pnpm globalmente y las dependencias del proyecto
RUN npm install -g pnpm@8.15.8 && pnpm install --frozen-lockfile

# Copia el resto del código fuente
COPY . .

# Compila el proyecto
RUN pnpm build

# Etapa 2: Imagen final para producción con Bun
FROM oven/bun AS runner

# Configuración del entorno de trabajo
WORKDIR /app

# Copia los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Instala solo las dependencias de producción con Bun
RUN bun install --production

# Expone el puerto de la aplicación
EXPOSE 3000


# Ejecuta la aplicación con Bun
CMD ["bun", "dist/main.js"]
