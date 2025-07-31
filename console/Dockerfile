# ===========================================
# UI Dockerfile - OPTIMIZED FOR SPEED
# ===========================================

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install all dependencies for build
RUN npm install --silent

# Copy source code
COPY . .

# Build with optimizations
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3268

# Use npx to run serve without global installation
CMD ["npx", "serve", "-s", "dist", "-l", "3268", "--single"]
