# Imagen de desarrollo para el frontend (Next.js dev)
FROM node:22-alpine

WORKDIR /app

# pnpm vía corepack (versión fijada a la del proyecto)
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

# Instala dependencias primero para aprovechar la caché de capas
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copia el resto del código (en dev se sobreescribe con el volumen)
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
