# Stage 1: Install production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma/ ./prisma/
COPY src/ ./src/
COPY tsconfig.json ./
COPY nest-cli.json ./
RUN npm run prisma:generate
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
