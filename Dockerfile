# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL and build dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy all source code first
COPY . .

# Install root dependencies
RUN npm install

# Install and build server
WORKDIR /app/server
RUN npm install
RUN npm run build

# Install and build client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy server built files
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/server/node_modules ./node_modules

# Copy client build for static serving
COPY --from=builder /app/client/dist ./public

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]
# Cache buster: 2025-12-29 12:50:22
