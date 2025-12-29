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

# Copy server package files and install production deps
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/prisma ./prisma
RUN npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy server built files
COPY --from=builder /app/server/dist ./dist

# Copy client build for static serving
COPY --from=builder /app/client/dist ./public

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start server with database sync
CMD ["sh", "-c", "echo 'Starting...' && npx prisma db push --schema=prisma/schema.prisma --skip-generate && echo 'DB synced, starting node...' && ls -la && ls -la dist/ && node dist/index.js"]
