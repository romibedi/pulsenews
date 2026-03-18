# Multi-stage build: React frontend + Express API server
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.js postcss.config.js tailwind.config.js ./
COPY public/ public/
COPY src/ src/
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package.json ./
RUN npm install --omit=dev

# Copy server code
COPY server/ ./

# Copy built frontend into server's public directory
COPY --from=frontend-build /app/dist ./public

# App Runner default port
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Use server.js as the production entrypoint (includes cron)
CMD ["node", "server.js"]
