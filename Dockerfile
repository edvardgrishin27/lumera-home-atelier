# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Build arguments for Vite env variables (needed at build time)
ARG VITE_ADMIN_UUID

# Make them available as env vars during build
ENV VITE_ADMIN_UUID=$VITE_ADMIN_UUID

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (log format + cache + server)
COPY nginx-log.conf /etc/nginx/conf.d/00-log.conf
COPY nginx-cache.conf /etc/nginx/conf.d/01-cache.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create cache directory for S3 proxy
RUN mkdir -p /var/cache/nginx/s3

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
