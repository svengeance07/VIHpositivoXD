FROM node:22-alpine AS builder

WORKDIR /app

# Herramientas nativas necesarias en Alpine (musl) si argon2 requiere compilación local
RUN apk add --no-cache python3 make g++ \
  && corepack enable \
  && corepack prepare pnpm@12.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json drizzle.config.ts ./
COPY src ./src

RUN pnpm run build \
  && pnpm prune --prod

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --chown=node:node package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((r) => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["node", "dist/server.js"]

