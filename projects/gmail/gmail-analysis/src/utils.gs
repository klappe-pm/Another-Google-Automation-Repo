/**
 * @fileoverview Utility functions for common operations
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-07-24
 * @lastmodified 2025-07-24
 */

/**
 * Date and time utilities
 */
class DateUtils {
  /**
   * Format a date to ISO string
   * @param {Date} date - Date to format
   * @returns {string} ISO formatted date string
   */
  static toISOString(date = new Date()) {
    return date.toISOString();
  }
  
  /**
   * Format a date for display
   * @param {Date} date - Date to format
   * @param {string} format - Format string ('short', 'long', 'time')
   * @returns {string} Formatted date string
   */
  static format(date = new Date(), format = 'short') {
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return date.toLocaleTimeString();
      case 'datetime':
        return date.toLocaleString();
      default:
        return date.toString();
    }
  }
  
  /**
   * Add days to a date
   * @param {Date} date - Base date
   * @param {number} days - Number of days to add
   * @returns {Date} New date with added days
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * Check if a date is within a range
   * @param {Date} date - Date to check
   * @param {Date} startDate - Range start date
   * @param {Date} endDate - Range end date
   * @returns {boolean} True if date is within range
   */
  static isInRange(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
  }
}

/**
 * String manipulation utilities
 */
class StringUtils {
  /**
   * Check if a string is empty or null
   * @param {string} str - String to check
   * @returns {boolean} True if string is empty or null
   */
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }
  
  /**
   * Truncate a string to a maximum length
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated string
   */
  static truncate(str, maxLength, suffix = '...') {
    if (!str || str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }
  
  /**
   * Convert string to camelCase
   * @param {string} str - String to convert
   * @returns {string} camelCase string
   */
  static toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }
  
  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static random(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

/**
 * Array manipulation utilities
 */
class ArrayUtils {
  /**
   * Split an array into chunks
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array[]} Array of chunks
   */
  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Remove duplicates from an array
   * @param {Array} array - Array to deduplicate
   * @param {Function} keyFn - Function to extract comparison key
   * @returns {Array} Array without duplicates
   */
  static unique(array, keyFn = null) {
    if (!keyFn) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Flatten a nested array
   * @param {Array} array - Array to flatten
   * @param {number} depth - Depth to flatten (default: 1)
   * @returns {Array} Flattened array
   */
  static flatten(array, depth = 1) {
    return depth > 0 ? array.reduce((acc, val) => 
      acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val), []) : array.slice();
  }
}

/**
 * Object manipulation utilities
 */
class ObjectUtils {
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }
  
  /**
   * Get nested property value safely
   * @param {Object} obj - Object to search
   * @param {string} path - Dot-separated path
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Property value or default
   */
  static get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result;
  }
  
  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} True if object is empty
   */
  static isEmpty(obj) {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
  }
}

/**
 * Validation utilities
 */
class ValidationUtils {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Check if value is a valid number
   * @param {*} value - Value to check
   * @returns {boolean} True if valid number
   */
  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
  
  /**
   * Validate required fields in an object
   * @param {Object} obj - Object to validate
   * @param {string[]} requiredFields - Array of required field names
   * @returns {Object} Validation result with isValid and missing fields
   */
  static validateRequired(obj, requiredFields) {
    const missing = requiredFields.filter(field => 
      obj[field] === undefined || obj[field] === null || obj[field] === ''
    );
    
    return {
      isValid: missing.length === 0,
      missing: missing
    };
  }
}

/**
 * Testing assertion utilities
 */
class Assert {
  static equal(actual, expected, message = null) {
    if (actual !== expected) {
      const errorMessage = message || `Expected ${expected}, but got ${actual}`;
      throw new Error(errorMessage);
    }
  }
  static isTrue(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }
  static isFalse(condition, message = 'Assertion failed') {
    if (condition) {
      throw new Error(message);
    }
  }
}

/**
 * Cache utilities using PropertiesService
 */
class CacheUtils {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Cached value or default
   */
  static get(key, defaultValue = null) {
    try {
      const cached = PropertiesService.getScriptProperties().getProperty(`cache_${key}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.expires && new Date() > new Date(data.expires)) {
          this.delete(key);
          return defaultValue;
        }
        return data.value;
      }
    } catch (error) {
      Logger.warn(`Error reading cache for key '${key}'`, error);
    }
    return defaultValue;
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  static set(key, value, ttl = null) {
    try {
      ttl = ttl || getConfig('CACHE_DURATION', 3600);
      const expires = new Date(Date.now() + (ttl * 1000)).toISOString();
      
      const data = {
        value: value,
        expires: expires,
        created: new Date().toISOString()
      };
      
      PropertiesService.getScriptProperties().setProperty(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      Logger.warn(`Error setting cache for key '${key}'`, error);
    }
  }
  
  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static delete(key) {
    try {
      PropertiesService.getScriptProperties().deleteProperty(`cache_${key}`);
    } catch (error) {
      Logger.warn(`Error deleting cache for key '${key}'`, error);
    }
  }
  
  /**
   * Clear all cache entries
   */
  static clear() {
    try {
      const properties = PropertiesService.getScriptProperties().getProperties();
      const cacheKeys = Object.keys(properties).filter(key => key.startsWith('cache_'));
      
      if (cacheKeys.length > 0) {
        PropertiesService.getScriptProperties().deleteProperties(cacheKeys);
        Logger.info(`Cleared ${cacheKeys.length} cache entries`);
      }
    } catch (error) {
      Logger.error('Error clearing cache', error);
    }
  }
}
