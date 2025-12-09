# Build Stage
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Final Image
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy built app
COPY --from=build /usr/src/app /usr/src/app

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
