FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci

# Copy frontend source code
COPY . ./

# Build the application for production
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Create a non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# Change ownership of the app directory
RUN chown -R appuser:appuser /usr/src/app

USER appuser

EXPOSE 3000

# Serve the built application with SPA routing support using serve.json
CMD ["serve", "-c", "serve.json", "-l", "3000"]
