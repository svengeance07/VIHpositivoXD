FROM node:22-alpine AS frontend-builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public ./public
COPY src ./src

RUN pnpm run build

FROM nginx:1.27-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist/vih-positivo-xd/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1/nginx-health"]

CMD ["nginx", "-g", "daemon off;"]

