# -----------------------
# Build stage
# -----------------------
FROM node:lts-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code and build
COPY . .
RUN pnpm run build

# -----------------------
# Production stage - Nginx
# -----------------------
FROM nginx:alpine

# Copy build artifacts from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config to handle /api proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]