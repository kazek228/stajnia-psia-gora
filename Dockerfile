# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Copy prisma schema BEFORE npm install (needed for postinstall)
COPY server/prisma ./server/prisma

# Install root dependencies (without running scripts)
RUN npm install --ignore-scripts

# Install server dependencies
WORKDIR /app/server
RUN npm install --ignore-scripts
RUN npx prisma generate --schema=prisma/schema.prisma

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy all source code
WORKDIR /app
COPY . .

# Build client
WORKDIR /app/client
RUN npm run build

# Build server
WORKDIR /app/server
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
