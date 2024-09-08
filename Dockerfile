# Usa la imagen de Node.js v20.13.1 basada en Alpine
FROM node:20.13.1-alpine

# Instala pnpm globalmente
RUN npm install -g pnpm

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de pnpm-lock.yml y package.json
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instala las dependencias del proyecto usando pnpm
RUN pnpm install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación
RUN pnpm build

# Expone el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación en producción
CMD ["sh", "-c", "pnpm build && pnpm start:prod"]

