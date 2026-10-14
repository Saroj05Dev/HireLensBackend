FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# DATABASE_URL is required by prisma7.config.ts at generate time (config validation).
# The actual value doesn't matter for code generation — only for runtime connections.
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Placeholder satisfies prisma7.config.ts validation during build-time generate.
# The real DATABASE_URL is injected at container runtime via env_file / environment.
ENV DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3500

CMD ["node", "dist/index.js"]
