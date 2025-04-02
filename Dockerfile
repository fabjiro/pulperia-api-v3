# Etapa de construcción
FROM node:alpine AS builder

# Configuración del entorno de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar las dependencias
COPY package.json ./

# Instala todas las dependencias del proyecto (incluyendo devDependencies)
RUN npm install

# Copia el resto del código fuente
COPY . .

# Compila el proyecto usando el comando definido en package.json
RUN npm run build

# Etapa final: imagen de producción
FROM node:alpine AS runner

# Configuración del entorno de trabajo
WORKDIR /app

# Copia solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules 

# Expone el puerto de la aplicación
EXPOSE 3000

# Ejecuta la aplicación con Node.js
CMD ["node", "dist/main.js"]
