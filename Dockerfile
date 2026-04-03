# Etapa 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock ./

# Instalar dependencias
RUN bun install

# Copiar código fuente
COPY . .

# Build de la aplicación Astro
RUN bun run build

# Etapa 2: Runtime
FROM oven/bun:1

WORKDIR /app

# Instalar solo dependencias de producción
COPY package.json bun.lock ./
RUN bun install --production

# Copiar el build desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Puerto que expone
EXPOSE 3000

# Variables para exponer el servidor fuera del contenedor
ENV HOST=0.0.0.0
ENV PORT=3000

# Comando para ejecutar Astro SSR con Bun
CMD ["bun", "./dist/server/entry.mjs"]
