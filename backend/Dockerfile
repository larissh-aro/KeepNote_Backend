FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy sources
COPY . .

# Final image
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy built app from builder
COPY --from=build /usr/src/app /usr/src/app

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
