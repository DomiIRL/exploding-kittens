FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run build:server

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production SERVER_PORT=51399
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 51399
CMD ["node", "dist/server/server/server.js"]
