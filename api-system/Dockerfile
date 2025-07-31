# ===========================================
# API Dockerfile - OPTIMIZED FOR SPEED
# ===========================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies for build
RUN npm install --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application, node_modules, and package files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]