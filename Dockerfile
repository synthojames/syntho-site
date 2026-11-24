# Two-stage build: compile the static site with Node, serve it with nginx.
# Kept free of BuildKit-only syntax so it also builds under kaniko.

# ---- build ----
FROM node:26-alpine AS build
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1

# Install the exact pnpm version pinned in package.json's "packageManager" field.
COPY package.json pnpm-lock.yaml ./
RUN npm install -g "$(node -p "require('./package.json').packageManager")" \
 && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- runtime ----
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
