FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --production

# Copy bot source code
COPY . ./

CMD ["node", "bot-new.js"]
