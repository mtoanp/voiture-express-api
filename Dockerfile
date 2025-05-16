# ===== STAGE 1: Build the NestJS app =====
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first for layer caching
COPY package*.json ./
RUN npm ci

# Copy the full source
COPY . .

# Build the app (outputs dist/src/main.js)
RUN npm run build


# ===== STAGE 2: Run only the built app =====
FROM node:22-alpine

WORKDIR /app

# Copy only needed parts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

# 🚀 Important: entry is inside dist/src/
CMD ["node", "dist/src/main.js"]
