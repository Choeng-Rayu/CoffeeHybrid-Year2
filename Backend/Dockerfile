FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY Backend/package.json Backend/package-lock.json ./
RUN npm install --production

# Copy backend source code
COPY Backend/ ./

EXPOSE 5000
CMD ["node", "server.js"]
