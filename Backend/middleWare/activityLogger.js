import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const activityLogPath = path.join(logsDir, 'activity.log');
const errorLogPath = path.join(logsDir, 'error.log');
const authLogPath = path.join(logsDir, 'auth.log');

// Utility function to format timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Utility function to get client IP
const getClientIP = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

// Utility function to write to log file
const writeToLog = (filePath, message) => {
  const logEntry = `${getTimestamp()} - ${message}\n`;
  fs.appendFileSync(filePath, logEntry);
};

// Main activity logging middleware
export const activityLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = getTimestamp();
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId = req.user?.id || 'anonymous';
  const username = req.user?.username || 'anonymous';

  // Log request details
  const requestLog = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip,
    userAgent,
    userId,
    username,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  };

  // Write request log
  writeToLog(activityLogPath, `REQUEST: ${JSON.stringify(requestLog)}`);

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log response details
    const responseLog = {
      timestamp: getTimestamp(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip,
      userId,
      username,
      responseSize: JSON.stringify(data).length
    };

    writeToLog(activityLogPath, `RESPONSE: ${JSON.stringify(responseLog)}`);

    // Log errors separately
    if (res.statusCode >= 400) {
      const errorLog = {
        ...responseLog,
        error: data.error || data.message || 'Unknown error',
        stack: data.stack
      };
      writeToLog(errorLogPath, `ERROR: ${JSON.stringify(errorLog)}`);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Authentication-specific logging middleware
export const authLogger = (req, res, next) => {
  const timestamp = getTimestamp();
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Override res.json for auth endpoints
  const originalJson = res.json;
  res.json = function(data) {
    const authLog = {
      timestamp,
      action: getAuthAction(req.originalUrl, req.method),
      ip,
      userAgent,
      success: res.statusCode < 400,
      statusCode: res.statusCode,
      userId: data.user?.id || req.body?.emailOrUsername || req.body?.email || 'unknown',
      username: data.user?.username || 'unknown',
      error: data.error || undefined
    };

    writeToLog(authLogPath, `AUTH: ${JSON.stringify(authLog)}`);
    return originalJson.call(this, data);
  };

  next();
};

// Database activity logger
export const dbLogger = {
  logQuery: (query, params, duration, success, error) => {
    const log = {
      timestamp: getTimestamp(),
      type: 'DATABASE',
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params ? JSON.stringify(params).substring(0, 100) : undefined,
      duration: `${duration}ms`,
      success,
      error: error?.message
    };
    writeToLog(activityLogPath, `DB: ${JSON.stringify(log)}`);
  }
};

// Email activity logger
export const emailLogger = {
  logEmailSent: (to, subject, success, messageId, error) => {
    const log = {
      timestamp: getTimestamp(),
      type: 'EMAIL',
      to,
      subject,
      success,
      messageId,
      error: error?.message
    };
    writeToLog(activityLogPath, `EMAIL: ${JSON.stringify(log)}`);
  }
};

// System event logger
export const systemLogger = {
  logEvent: (event, details) => {
    const log = {
      timestamp: getTimestamp(),
      type: 'SYSTEM',
      event,
      details
    };
    writeToLog(activityLogPath, `SYSTEM: ${JSON.stringify(log)}`);
  }
};

// Utility functions
const sanitizeBody = (body) => {
  if (!body) return undefined;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'newPassword', 'confirmPassword', 'token', 'resetPasswordToken'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
};

const getAuthAction = (url, method) => {
  if (url.includes('/login')) return 'LOGIN';
  if (url.includes('/register')) return 'REGISTER';
  if (url.includes('/forgot-password')) return 'FORGOT_PASSWORD';
  if (url.includes('/reset-password')) return 'RESET_PASSWORD';
  if (url.includes('/google')) return 'GOOGLE_AUTH';
  return `${method}_${url}`;
};

// Log cleanup utility (optional - runs daily)
export const cleanupLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  
  [activityLogPath, errorLogPath, authLogPath].forEach(logPath => {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (now - stats.mtime.getTime() > maxAge) {
        fs.writeFileSync(logPath, ''); // Clear old logs
        systemLogger.logEvent('LOG_CLEANUP', { file: logPath });
      }
    }
  });
};

export default {
  activityLogger,
  authLogger,
  dbLogger,
  emailLogger,
  systemLogger,
  cleanupLogs
};
