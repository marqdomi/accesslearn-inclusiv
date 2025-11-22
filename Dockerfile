# Frontend Dockerfile for Azure Container Apps
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script to nginx's entrypoint directory
# nginx:alpine automatically executes scripts in /docker-entrypoint.d/ before starting
COPY docker-entrypoint.sh /docker-entrypoint.d/99-inject-config.sh
RUN chmod +x /docker-entrypoint.d/99-inject-config.sh

# Expose port 8080 (Azure Container Apps default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use nginx's default entrypoint (which will run our script from /docker-entrypoint.d/)
# No need to override ENTRYPOINT - nginx's entrypoint will handle it
