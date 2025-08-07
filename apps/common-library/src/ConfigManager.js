/**
 * Configuration Manager for Google Apps Script Projects
 * 
 * Purpose: Centralized configuration management for cross-account portability
 * Service: Common Library
 * Created: 2025-08-06
 * Author: Generic (No PII)
 * License: MIT
 * 
 * This module provides secure configuration management to ensure scripts
 * are portable across different Google Workspace accounts without exposing
 * personal information, secrets, or account-specific details.
 * 
 * Features:
 * - User-specific settings via PropertiesService
 * - Environment detection (development/production)
 * - Secure secret management
 * - Default configuration templates
 * - Validation and sanitization
 * 
 * Usage:
 *   const config = CommonLib.getConfig('gmail');
 *   const apiKey = CommonLib.getSecureValue('API_KEY');
 */

/**
 * Default configuration templates for each service
 * These provide sensible defaults that work across accounts
 */
const DEFAULT_CONFIGS = {
  gmail: {
    maxThreads: 500,
    batchSize: 50,
    defaultLabel: 'Processed',
    searchDaysBack: 180,
    exportFormat: 'both', // 'pdf', 'markdown', 'both'
    folderStructure: 'YYYY/MM',
    timezone: 'America/New_York',
    dateFormat: 'yyyy-MM-dd',
    includeAttachments: true,
    maxAttachmentSize: 10485760, // 10MB
    logLevel: 'INFO'
  },
  
  drive: {
    maxDepth: 5,
    batchSize: 100,
    indexFileTypes: ['document', 'spreadsheet', 'presentation', 'pdf', 'image'],
    excludeFolders: ['Trash', 'Spam', '.tmp'],
    includeSharedDrives: false,
    includeHidden: false,
    cacheExpiration: 3600, // 1 hour
    maxExecutionTime: 300000, // 5 minutes
    logLevel: 'INFO'
  },
  
  calendar: {
    daysAhead: 30,
    daysBehind: 30,
    includeAllDayEvents: true,
    includeRecurring: true,
    includePrivate: false,
    reminderMinutes: 10,
    defaultDuration: 60, // minutes
    workingHours: { start: 9, end: 17 },
    timezone: 'America/New_York',
    logLevel: 'INFO'
  },
  
  sheets: {
    maxRows: 10000,
    maxColumns: 100,
    headerRow: 1,
    dataValidation: true,
    autoResize: true,
    protectFormulas: true,
    shareMode: 'VIEW', // 'EDIT', 'VIEW', 'NONE'
    exportFormat: 'xlsx', // 'xlsx', 'csv', 'pdf'
    logLevel: 'INFO'
  },
  
  tasks: {
    maxTasks: 1000,
    includeCompleted: false,
    daysForCompleted: 7,
    defaultList: 'My Tasks',
    sortBy: 'due', // 'due', 'title', 'updated'
    exportFormat: 'markdown',
    includeNotes: true,
    logLevel: 'INFO'
  }
};

/**
 * Get configuration for a specific service
 * Merges defaults with user-specific settings
 * 
 * @param {string} service - Service name (gmail, drive, calendar, etc.)
 * @param {Object} overrides - Optional runtime overrides
 * @return {Object} Merged configuration object
 */
function getConfig(service, overrides = {}) {
  // Start with defaults
  const defaultConfig = DEFAULT_CONFIGS[service] || {};
  
  // Get user-specific configuration from Properties
  const userProperties = PropertiesService.getUserProperties();
  const userConfigJson = userProperties.getProperty(`${service}_config`);
  const userConfig = userConfigJson ? JSON.parse(userConfigJson) : {};
  
  // Get script-specific configuration
  const scriptProperties = PropertiesService.getScriptProperties();
  const scriptConfigJson = scriptProperties.getProperty(`${service}_config`);
  const scriptConfig = scriptConfigJson ? JSON.parse(scriptConfigJson) : {};
  
  // Merge configurations (priority: overrides > user > script > defaults)
  return Object.assign({}, defaultConfig, scriptConfig, userConfig, overrides);
}

/**
 * Save configuration for a specific service
 * 
 * @param {string} service - Service name
 * @param {Object} config - Configuration to save
 * @param {string} scope - 'user' or 'script'
 */
function saveConfig(service, config, scope = 'user') {
  const properties = scope === 'user' 
    ? PropertiesService.getUserProperties()
    : PropertiesService.getScriptProperties();
  
  // Remove sensitive data before saving
  const sanitizedConfig = sanitizeConfig(config);
  
  properties.setProperty(`${service}_config`, JSON.stringify(sanitizedConfig));
}

/**
 * Get a secure value (API key, token, etc.)
 * Never hardcode these in scripts
 * 
 * @param {string} key - Secret key name
 * @return {string} Secret value or null
 */
function getSecureValue(key) {
  // First check user properties (highest priority)
  const userProperties = PropertiesService.getUserProperties();
  let value = userProperties.getProperty(key);
  
  if (value) return value;
  
  // Then check script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  value = scriptProperties.getProperty(key);
  
  if (value) return value;
  
  // Finally check environment (for CI/CD)
  // Note: This is a placeholder - Google Apps Script doesn't have process.env
  // In practice, you'd set these via Properties UI or API
  
  return null;
}

/**
 * Set a secure value
 * 
 * @param {string} key - Secret key name
 * @param {string} value - Secret value
 * @param {string} scope - 'user' or 'script'
 */
function setSecureValue(key, value, scope = 'user') {
  const properties = scope === 'user'
    ? PropertiesService.getUserProperties()
    : PropertiesService.getScriptProperties();
  
  properties.setProperty(key, value);
}

/**
 * Remove sensitive information from configuration
 * 
 * @param {Object} config - Configuration object
 * @return {Object} Sanitized configuration
 */
function sanitizeConfig(config) {
  const sanitized = Object.assign({}, config);
  
  // List of keys that might contain sensitive data
  const sensitiveKeys = [
    'apiKey', 'apiSecret', 'token', 'password', 'credential',
    'private', 'secret', 'auth', 'key', 'email', 'userId'
  ];
  
  // Remove or mask sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      delete sanitized[key];
    }
  });
  
  return sanitized;
}

/**
 * Get environment (development/production)
 * 
 * @return {string} Environment name
 */
function getEnvironment() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('ENVIRONMENT') || 'production';
}

/**
 * Check if running in development mode
 * 
 * @return {boolean} True if in development
 */
function isDevelopment() {
  return getEnvironment() === 'development';
}

/**
 * Get user preferences with defaults
 * 
 * @return {Object} User preferences
 */
function getUserPreferences() {
  const userProperties = PropertiesService.getUserProperties();
  const prefsJson = userProperties.getProperty('preferences');
  
  const defaults = {
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    firstDayOfWeek: 0, // Sunday
    defaultView: 'grid'
  };
  
  const userPrefs = prefsJson ? JSON.parse(prefsJson) : {};
  return Object.assign({}, defaults, userPrefs);
}

/**
 * Save user preferences
 * 
 * @param {Object} preferences - User preferences to save
 */
function saveUserPreferences(preferences) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('preferences', JSON.stringify(preferences));
}

/**
 * Create a configuration template file
 * This helps users set up their configuration
 * 
 * @param {string} service - Service name
 * @return {Object} Configuration template
 */
function getConfigTemplate(service) {
  const template = Object.assign({}, DEFAULT_CONFIGS[service] || {});
  
  // Add placeholders for user-specific values
  template._instructions = {
    description: `Configuration template for ${service} service`,
    usage: 'Copy this template and customize values as needed',
    saveLocation: 'File > Project Settings > Script Properties',
    security: 'Never commit actual values to version control'
  };
  
  template._userSpecific = {
    email: 'YOUR_EMAIL@domain.com',
    folder: 'YOUR_FOLDER_ID',
    spreadsheet: 'YOUR_SPREADSHEET_ID',
    calendar: 'YOUR_CALENDAR_ID'
  };
  
  return template;
}

/**
 * Validate configuration against schema
 * 
 * @param {string} service - Service name
 * @param {Object} config - Configuration to validate
 * @return {Object} Validation result {valid: boolean, errors: Array}
 */
function validateConfig(service, config) {
  const errors = [];
  const schema = getConfigSchema(service);
  
  // Check required fields
  if (schema.required) {
    schema.required.forEach(field => {
      if (!config[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }
  
  // Check field types
  if (schema.fields) {
    Object.keys(schema.fields).forEach(field => {
      if (config[field] !== undefined) {
        const expectedType = schema.fields[field].type;
        const actualType = typeof config[field];
        
        if (expectedType && actualType !== expectedType) {
          errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`);
        }
        
        // Check constraints
        const constraints = schema.fields[field];
        if (constraints.min !== undefined && config[field] < constraints.min) {
          errors.push(`Field ${field} must be >= ${constraints.min}`);
        }
        if (constraints.max !== undefined && config[field] > constraints.max) {
          errors.push(`Field ${field} must be <= ${constraints.max}`);
        }
        if (constraints.enum && !constraints.enum.includes(config[field])) {
          errors.push(`Field ${field} must be one of: ${constraints.enum.join(', ')}`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Get configuration schema for validation
 * 
 * @param {string} service - Service name
 * @return {Object} Configuration schema
 */
function getConfigSchema(service) {
  const schemas = {
    gmail: {
      required: ['maxThreads', 'batchSize'],
      fields: {
        maxThreads: { type: 'number', min: 1, max: 10000 },
        batchSize: { type: 'number', min: 1, max: 100 },
        searchDaysBack: { type: 'number', min: 1, max: 3650 },
        exportFormat: { type: 'string', enum: ['pdf', 'markdown', 'both'] },
        logLevel: { type: 'string', enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'] }
      }
    },
    drive: {
      required: ['maxDepth', 'batchSize'],
      fields: {
        maxDepth: { type: 'number', min: 1, max: 10 },
        batchSize: { type: 'number', min: 1, max: 500 },
        maxExecutionTime: { type: 'number', min: 60000, max: 360000 }
      }
    }
    // Add more schemas as needed
  };
  
  return schemas[service] || { required: [], fields: {} };
}

/**
 * Clear all configuration for a service
 * 
 * @param {string} service - Service name
 * @param {string} scope - 'user', 'script', or 'all'
 */
function clearConfig(service, scope = 'user') {
  if (scope === 'user' || scope === 'all') {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty(`${service}_config`);
  }
  
  if (scope === 'script' || scope === 'all') {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteProperty(`${service}_config`);
  }
}

/**
 * Export configuration for backup or sharing
 * 
 * @param {string} service - Service name
 * @return {string} JSON string of configuration
 */
function exportConfig(service) {
  const config = getConfig(service);
  const sanitized = sanitizeConfig(config);
  
  return JSON.stringify(sanitized, null, 2);
}

/**
 * Import configuration from JSON
 * 
 * @param {string} service - Service name
 * @param {string} jsonConfig - JSON configuration string
 * @param {string} scope - 'user' or 'script'
 * @return {Object} Result {success: boolean, errors: Array}
 */
function importConfig(service, jsonConfig, scope = 'user') {
  try {
    const config = JSON.parse(jsonConfig);
    const validation = validateConfig(service, config);
    
    if (validation.valid) {
      saveConfig(service, config, scope);
      return { success: true, errors: [] };
    } else {
      return { success: false, errors: validation.errors };
    }
  } catch (error) {
    return { success: false, errors: [`Invalid JSON: ${error.message}`] };
  }
}