import { performance } from 'perf_hooks';

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  // Add request ID for tracking
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Override res.json to capture response size
  const originalJson = res.json;
  let responseSize = 0;

  res.json = function(data) {
    responseSize = JSON.stringify(data).length;
    return originalJson.call(this, data);
  };

  // Monitor response completion
  res.on('finish', () => {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;

    // Calculate memory usage
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };

    // Log performance metrics
    const metrics = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      responseSize: responseSize,
      memoryUsage: {
        rss: Math.round(memoryDiff.rss / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(memoryDiff.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryDiff.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryDiff.external / 1024 / 1024 * 100) / 100 // MB
      },
      timestamp: new Date().toISOString()
    };

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn('🐌 Slow request detected:', metrics);
    }

    // Log high memory usage requests (> 50MB)
    if (memoryDiff.heapUsed > 50 * 1024 * 1024) {
      console.warn('🧠 High memory usage request:', metrics);
    }

    // Log large responses (> 1MB)
    if (responseSize > 1024 * 1024) {
      console.warn('📦 Large response detected:', metrics);
    }

    // Log error responses
    if (res.statusCode >= 400) {
      console.warn('❌ Error response:', metrics);
    }

    // In development, log all requests
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Request metrics:', metrics);
    }
  });

  next();
};

// Database query performance monitoring
export const queryPerformanceMonitor = {
  beforeQuery: (query, options) => {
    options.startTime = performance.now();
  },

  afterQuery: (query, options, result) => {
    if (options.startTime) {
      const duration = performance.now() - options.startTime;
      
      // Log slow queries (> 100ms)
      if (duration > 100) {
        console.warn('🐌 Slow database query:', {
          query: query.sql || query,
          duration: Math.round(duration * 100) / 100,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

// Memory usage monitoring
export const memoryMonitor = () => {
  const usage = process.memoryUsage();
  const formatMemory = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;

  return {
    rss: formatMemory(usage.rss),
    heapUsed: formatMemory(usage.heapUsed),
    heapTotal: formatMemory(usage.heapTotal),
    external: formatMemory(usage.external),
    timestamp: new Date().toISOString()
  };
};

// CPU usage monitoring
export const cpuMonitor = () => {
  const usage = process.cpuUsage();
  return {
    user: usage.user,
    system: usage.system,
    timestamp: new Date().toISOString()
  };
};

// Health check endpoint data
export const getHealthMetrics = () => {
  const memory = memoryMonitor();
  const cpu = cpuMonitor();
  const uptime = process.uptime();

  return {
    status: 'healthy',
    uptime: Math.round(uptime),
    memory: memory,
    cpu: cpu,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    timestamp: new Date().toISOString()
  };
};

// Periodic performance logging
export const startPerformanceLogging = (intervalMs = 60000) => {
  setInterval(() => {
    const metrics = getHealthMetrics();
    
    // Log if memory usage is high (> 500MB)
    if (metrics.memory.heapUsed > 500) {
      console.warn('🧠 High memory usage detected:', metrics);
    }
    
    // Log uptime milestones
    if (metrics.uptime % 3600 === 0) { // Every hour
      console.log('⏰ Server uptime:', `${Math.round(metrics.uptime / 3600)} hours`);
    }
  }, intervalMs);
};
