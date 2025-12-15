FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the application
RUN npm run build

CMD ["npm", "run", "preview"]
