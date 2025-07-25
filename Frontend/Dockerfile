FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy frontend source code
COPY . ./

# Build the application
RUN npm run build

# Expose port for Digital Ocean App Platform
EXPOSE 8080

# Serve the built app using Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
