FROM node:20-alpine AS base

LABEL maintainer="F1 Champions API"
LABEL version="1.0.0"
LABEL description="F1 World Champions API"

WORKDIR /app

ARG PORT=3000

# Build dependencies stage for production
FROM base AS deps-prod
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Build dependencies stage dev (all dependencies)
FROM base AS deps-dev
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Development stage
FROM deps-dev AS development
COPY . .
EXPOSE $PORT
CMD ["npm", "run", "start:dev"]

# Build stage
FROM deps-dev AS build
COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Reuse production dependencies from deps-prod stage
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=deps-prod /app/package*.json ./
COPY --from=build /app/dist ./dist

EXPOSE $PORT

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

CMD ["node", "dist/main.js"] 