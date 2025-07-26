FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --only=production

# Copy backend source code
COPY . ./

EXPOSE 5000

CMD ["node", "server.js"]
