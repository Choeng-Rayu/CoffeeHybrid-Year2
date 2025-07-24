# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm install

# Copy frontend source code
COPY Frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy the nginx configuration
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
