# Google Apps Script Security Standards

## Table of Contents

- [API Key Management](#api-key-management)
- [Data Protection](#data-protection)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## API Key Management

### Configuration

```javascript
const SECURITY_CONFIG = {
  API_KEYS: {
    GOOGLE: {},
    EXTERNAL: {}
  },
  RATE_LIMITS: {
    MAX_CALLS: 100,
    RESET_PERIOD: 60000 // 1 minute
  }
};
```

### Key Rotation

- Rotate API keys every 90 days
- Use environment variables for storage
- Never hardcode API keys
- Implement key validation

### Key Usage Pattern

```javascript
function getApiKey(service) {
  const key = SECURITY_CONFIG.API_KEYS[service];
  if (!key) {
    throw new Error(`API key not found for ${service}`);
  }
  validateKey(key);
  return key;
}

function validateKey(key) {
  if (!key || key.length < 32) {
    throw new Error('Invalid API key format');
  }
}
```

## Data Protection

### Input Validation

```javascript
function validateInput(data) {
  if (!data) {
    throw new Error('Input data is required');
  }
  
  // Validate data type
  if (typeof data !== 'object') {
    throw new Error('Invalid data type');
  }
  
  // Validate required fields
  const requiredFields = ['id', 'name'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  });
  
  return true;
}
```

### Data Sanitization

```javascript
function sanitizeInput(data) {
  // Remove potentially dangerous characters
  const sanitized = JSON.stringify(data)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;');
  
  return JSON.parse(sanitized);
}
```

## Error Handling

### Security Error Handling

```javascript
function handleSecurityError(error, context) {
  // Log error with context
  logSecurityEvent(error, context);
  
  // Don't expose sensitive information
  const userError = {
    message: 'An unexpected error occurred',
    code: 'SECURITY_ERROR'
  };
  
  throw userError;
}

function logSecurityEvent(error, context) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    context: context,
    severity: 'HIGH'
  };
  
  // Log to secure location
  Logger.log(JSON.stringify(securityLog));
}
```

## Rate Limiting

### Rate Limit Configuration

```javascript
const RATE_LIMIT_CONFIG = {
  MAX_CALLS: 100,
  RESET_PERIOD: 60000, // 1 minute
  WINDOW_SIZE: 1000,   // 1 second
  BUCKET_SIZE: 10
};
```

### Rate Limit Implementation

```javascript
function withRateLimit(operation) {
  const now = new Date().getTime();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_SIZE;
  
  // Check rate limit
  const callsInWindow = getRecentCalls(windowStart);
  if (callsInWindow >= RATE_LIMIT_CONFIG.MAX_CALLS) {
    throw new Error('Rate limit exceeded');
  }
  
  try {
    return operation();
  } finally {
    recordCall(now);
  }
}
```

## Best Practices

1. **Authentication**
   - Use OAuth2 for Google services
   - Implement proper token management
   - Handle token expiration
   - Use secure token storage

2. **Authorization**
   - Implement proper access control
   - Use least privilege principle
   - Validate permissions
   - Log access attempts

3. **Data Security**
   - Encrypt sensitive data
   - Implement data validation
   - Use secure data storage
   - Regularly audit data access

4. **Security Monitoring**
   - Log security events
   - Monitor suspicious activity
   - Implement alerting
   - Regular security audits

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-07-21 UTC.
