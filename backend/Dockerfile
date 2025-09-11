# ---------- Base (instala TODAS las deps, incluidas dev) ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ---------- Producción ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["node","src/server.js"]

# ---------- Tests ----------
FROM base AS test
ENV NODE_ENV=test
CMD ["npm","test"]
