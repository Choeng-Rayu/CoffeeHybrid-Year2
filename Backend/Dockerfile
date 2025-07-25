FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --production

# Copy backend source code
COPY . ./

EXPOSE 5000
CMD ["node", "server.js"]
