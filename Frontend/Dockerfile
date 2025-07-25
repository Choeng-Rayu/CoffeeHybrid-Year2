FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy frontend source code
COPY . ./

# Build the application for static deployment
RUN npm run build
