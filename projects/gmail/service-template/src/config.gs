/**
 * @fileoverview Configuration and constants for the service
 * @author [Your Name] <[your.email@domain.com]>
 * @version 1.0.0
 * @since [YYYY-MM-DD]
 * @lastmodified [YYYY-MM-DD]
 */

// Service Configuration
const SERVICE_CONFIG = {
  // Service identification
  SERVICE_NAME: '[SERVICE_NAME]',
  VERSION: '1.0.0',
  ENVIRONMENT: 'development', // 'development', 'staging', 'production'
  
  // Logging configuration
  LOG_LEVEL: 'INFO', // 'DEBUG', 'INFO', 'WARN', 'ERROR'
  LOG_TO_CONSOLE: true,
  LOG_TO_SHEET: false,
  
  // Performance settings
  MAX_EXECUTION_TIME: 300000, // 5 minutes in milliseconds
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
  
  // Cache settings
  CACHE_ENABLED: true,
  CACHE_DURATION: 3600, // 1 hour in seconds
  
  // Email settings
  NOTIFICATION_EMAIL: '[admin@domain.com]',
  ERROR_EMAIL: '[errors@domain.com]',
};

// Google Apps Script specific settings
const GAS_CONFIG = {
  // Script properties keys
  PROPERTY_KEYS: {
    API_KEY: 'API_KEY',
    LAST_RUN: 'LAST_RUN',
    ERROR_COUNT: 'ERROR_COUNT',
  },
  
  // Trigger settings
  TRIGGER_INTERVAL: 'DAILY', // 'MINUTES', 'HOURLY', 'DAILY', 'WEEKLY'
  TRIGGER_HOUR: 9, // For daily triggers
  
  // Lock settings
  LOCK_TIMEOUT: 30000, // 30 seconds
};

// External service URLs and endpoints
const API_ENDPOINTS = {
  // Add your API endpoints here
  // EXAMPLE_API: 'https://api.example.com/v1',
};

// Error codes and messages
const ERROR_CODES = {
  GENERAL_ERROR: {
    code: 'GEN_001',
    message: 'An unexpected error occurred'
  },
  VALIDATION_ERROR: {
    code: 'VAL_001',
    message: 'Input validation failed'
  },
  API_ERROR: {
    code: 'API_001',
    message: 'External API request failed'
  },
  PERMISSION_ERROR: {
    code: 'PER_001',
    message: 'Insufficient permissions'
  },
  TIMEOUT_ERROR: {
    code: 'TIM_001',
    message: 'Operation timed out'
  }
};

/**
 * Get configuration value with fallback
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Configuration value
 */
function getConfig(key, defaultValue = null) {
  const keys = key.split('.');
  let value = SERVICE_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Check if service is in development mode
 * @returns {boolean} True if in development mode
 */
function isDevelopment() {
  return SERVICE_CONFIG.ENVIRONMENT === 'development';
}

/**
 * Check if service is in production mode
 * @returns {boolean} True if in production mode
 */
function isProduction() {
  return SERVICE_CONFIG.ENVIRONMENT === 'production';
}
