# syntax=docker/dockerfile:1

############################
# 1) Build stage
############################
FROM node:22-bullseye-slim AS builder
WORKDIR /app

# --- NOVO: build args/vars para o Astro -----------------
ARG SITE_URL
ARG ASTRO_BASE
# (opcional) compat: BASE_PATH se você preferir esse nome
ARG BASE_PATH
# Disponibiliza para o processo de build do Astro
ENV SITE_URL=${SITE_URL}
ENV ASTRO_BASE=${ASTRO_BASE}
ENV BASE_PATH=${BASE_PATH}
# ---------------------------------------------------------

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# O build já "enxerga" SITE_URL/ASTRO_BASE pelos ENV acima
RUN pnpm build

RUN pnpm prune --prod

############################
# 2) Runtime stage
############################
FROM node:22-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Usuário não-root
RUN useradd -m -u 10001 nodeuser

# Copia artefatos mínimos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Porta padrão; DO sobrescreve $PORT
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080
USER nodeuser

# Site é 100% estático (GitHub Pages) — serve os arquivos gerados em dist/
CMD ["sh", "-c", "node_modules/.bin/serve dist -l tcp://0.0.0.0:${PORT}"]