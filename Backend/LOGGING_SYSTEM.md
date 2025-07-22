# Coffee Hybrid - Activity Logging System

## Overview
The Coffee Hybrid backend now includes a comprehensive activity logging system that tracks all API requests, authentication attempts, email activities, database operations, and system events.

## Log Files Location
All log files are stored in the `Backend/logs/` directory:

- `activity.log` - General API requests, responses, and system events
- `auth.log` - Authentication-specific activities (login, register, forgot password, etc.)
- `error.log` - Error responses and failed operations
- Email activities are logged in `activity.log` with type "EMAIL"

## Logging Features

### 1. Request/Response Logging
- **Method, URL, IP address, User Agent**
- **Request body** (with sensitive fields redacted)
- **Response status code and duration**
- **User information** (if authenticated)
- **Response size**

### 2. Authentication Logging
- **Login attempts** (successful and failed)
- **Registration attempts**
- **Password reset requests**
- **Google OAuth activities**
- **IP address and user agent tracking**

### 3. Email Activity Logging
- **Email send attempts** (successful and failed)
- **Recipient, subject, message ID**
- **Error details** for failed sends
- **Mock email logging** for development

### 4. System Event Logging
- **Server startup and shutdown**
- **Database connections**
- **Configuration changes**
- **Error conditions**

### 5. Database Activity Logging
- **Query execution** (with duration)
- **Success/failure status**
- **Error details**

## Log Entry Format

### Activity Log Entry
```json
{
  "timestamp": "2025-07-09T05:30:19.076Z",
  "method": "POST",
  "url": "/api/auth/login",
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "userId": "12345",
  "username": "john_doe",
  "body": {
    "emailOrUsername": "john@example.com",
    "password": "***REDACTED***"
  },
  "statusCode": 200,
  "duration": "45ms",
  "responseSize": 156
}
```

### Authentication Log Entry
```json
{
  "timestamp": "2025-07-09T05:30:19.076Z",
  "action": "LOGIN",
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "success": true,
  "statusCode": 200,
  "userId": "12345",
  "username": "john_doe",
  "error": null
}
```

### Email Log Entry
```json
{
  "timestamp": "2025-07-09T05:30:19.076Z",
  "type": "EMAIL",
  "to": "user@example.com",
  "subject": "Password Reset Request",
  "success": true,
  "messageId": "abc123",
  "error": null
}
```

### System Log Entry
```json
{
  "timestamp": "2025-07-09T05:30:19.076Z",
  "type": "SYSTEM",
  "event": "SERVER_STARTUP",
  "details": {
    "port": "4000",
    "environment": "development",
    "hostingType": "local"
  }
}
```

## Security Features

### Sensitive Data Redaction
The following fields are automatically redacted in logs:
- `password`
- `newPassword`
- `confirmPassword`
- `token`
- `resetPasswordToken`

### IP Address Tracking
All requests are logged with the client IP address for security monitoring.

### User Activity Tracking
Authenticated requests include user ID and username for audit trails.

## Configuration

### Environment Variables
- `NODE_ENV` - Controls logging verbosity
- `MOCK_EMAIL` - Enables mock email logging for development

### Log Cleanup
- Logs older than 30 days are automatically cleaned up
- Manual cleanup can be triggered using `cleanupLogs()` function

## Usage Examples

### Monitoring Failed Login Attempts
```bash
grep "LOGIN.*success.*false" Backend/logs/auth.log
```

### Tracking Email Activities
```bash
grep "EMAIL" Backend/logs/activity.log
```

### Monitoring System Events
```bash
grep "SYSTEM" Backend/logs/activity.log
```

### Finding Error Responses
```bash
cat Backend/logs/error.log
```

## Development vs Production

### Development Mode
- Mock email logging enabled
- Detailed error information
- All activities logged

### Production Mode
- Real email sending
- Sensitive information redacted
- Error details limited for security

## Integration Points

The logging system is integrated at multiple levels:

1. **Express Middleware** - Captures all HTTP requests/responses
2. **Authentication Routes** - Specific auth activity logging
3. **Email Service** - Email send/failure logging
4. **Database Layer** - Query execution logging
5. **System Events** - Server lifecycle logging

## Monitoring and Alerts

For production environments, consider:
- Log aggregation tools (ELK stack, Splunk)
- Real-time monitoring dashboards
- Alert systems for error patterns
- Log rotation and archival

## Privacy Compliance

The logging system is designed with privacy in mind:
- Sensitive data is redacted
- User consent considerations
- Data retention policies
- GDPR compliance features
