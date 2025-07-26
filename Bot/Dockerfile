FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm ci --only=production

# Copy bot source code
COPY . ./

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Health check (if your bot has a health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bot is running')" || exit 1

CMD ["node", "bot-new.js"]
