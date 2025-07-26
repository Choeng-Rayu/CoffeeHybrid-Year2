// Centralized error handling middleware
export default function errorHandler(err, req, res, next) {
  // Log error details for debugging (but not to client)
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let status = err.status || err.statusCode || 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  } else if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = 'Database validation error';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Resource already exists';
  } else if (status < 500) {
    // Client errors - safe to show message
    message = err.message || message;
  }

  // Prepare response
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString()
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      message: err.message,
      stack: err.stack
    };
  }

  // Add request ID for tracking
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(status).json(response);
}
