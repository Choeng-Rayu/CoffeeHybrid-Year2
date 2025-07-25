FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY Bot/package.json Bot/package-lock.json ./
RUN npm install --production

# Copy bot source code
COPY Bot/ ./

CMD ["node", "bot-new.js"]
