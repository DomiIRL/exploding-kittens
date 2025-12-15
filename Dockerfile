FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_HOST
ARG VITE_PORT
ARG VITE_ALLOWED_HOSTS

# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_HOST=$VITE_HOST
ENV VITE_PORT=$VITE_PORT
ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS

# Build the application
RUN npm run build

CMD ["npm", "run", "preview"]
