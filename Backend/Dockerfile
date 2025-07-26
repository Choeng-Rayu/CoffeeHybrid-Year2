FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --only=production

# Copy backend source code (excluding node_modules and .env)
COPY . ./

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "server.js"]
