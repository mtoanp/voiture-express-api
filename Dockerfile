# Stage 1: Build the app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Run the built app
FROM node:22-alpine

WORKDIR /app

# Only copy built code & deps
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Set production env
ENV NODE_ENV=production

# You can pass PORT and other secrets from docker run or env file
CMD ["node", "dist/main.js"]
