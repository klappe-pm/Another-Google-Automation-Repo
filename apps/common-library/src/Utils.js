/**
 * Common Library - Utility Functions
 * 
 * Purpose: Core utility functions used across all services
 * Service: Shared Library
 * Created: 2025-08-06
 * 
 * This module provides essential utility functions for:
 * - Date formatting and manipulation
 * - String operations and validation
 * - Email and URL validation
 * - File name sanitization
 * - Array and object operations
 */

/**
 * Format date consistently across all services
 * @param {Date} date - Date to format (defaults to now)
 * @param {string} format - Format string or preset name
 * @param {string} timezone - Timezone (defaults to script timezone)
 * @return {string} Formatted date string
 */
function formatDate(date, format = 'yyyy-MM-dd', timezone = null) {
  if (!date || !(date instanceof Date)) {
    date = new Date();
  }
  
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided to formatDate');
  }
  
  // Predefined format patterns
  const formats = {
    'iso': "yyyy-MM-dd'T'HH:mm:ss'Z'",
    'date': 'yyyy-MM-dd',
    'time': 'HH:mm:ss',
    'datetime': 'yyyy-MM-dd HH:mm:ss',
    'friendly': 'MMM dd, yyyy',
    'friendly-time': 'MMM dd, yyyy HH:mm',
    'filename': 'yyyy-MM-dd_HH-mm-ss',
    'year': 'yyyy',
    'month': 'yyyy-MM',
    'compact': 'yyyyMMdd'
  };
  
  const pattern = formats[format] || format;
  const tz = timezone || Session.getScriptTimeZone();
  
  try {
    return Utilities.formatDate(date, tz, pattern);
  } catch (e) {
    throw new Error(`Date formatting failed: ${e.message}`);
  }
}

/**
 * Parse date from string with multiple format support
 * @param {string} dateString - Date string to parse
 * @param {string} format - Expected format (optional)
 * @return {Date} Parsed date object
 */
function parseDate(dateString, format = null) {
  if (!dateString) {
    return new Date();
  }
  
  // Try direct Date parsing first
  let date = new Date(dateString);
  
  // If that fails and format is provided, try parsing with format
  if (isNaN(date.getTime()) && format) {
    // Simple format parsing for common cases
    if (format === 'yyyy-MM-dd') {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
  }
  
  if (isNaN(date.getTime())) {
    throw new Error(`Cannot parse date: ${dateString}`);
  }
  
  return date;
}

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @return {boolean} True if valid email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 simplified regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.toLowerCase());
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @return {boolean} True if valid URL format
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Sanitize filename for Google Drive
 * @param {string} filename - Raw filename
 * @param {number} maxLength - Maximum length (default 200)
 * @return {string} Safe filename for Drive
 */
function sanitizeFileName(filename, maxLength = 200) {
  if (!filename || typeof filename !== 'string') {
    return 'untitled';
  }
  
  return filename
    .replace(/[\/\\:*?"<>|]/g, '_')  // Replace invalid characters
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')  // Remove control characters
    .replace(/^\.+/, '')  // Remove leading dots
    .replace(/\.+$/, '')  // Remove trailing dots
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim()
    .substring(0, maxLength) || 'untitled';
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default '...')
 * @return {string} Truncated string
 */
function truncateString(str, maxLength, suffix = '...') {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  if (str.length <= maxLength) {
    return str;
  }
  
  const truncateLength = maxLength - suffix.length;
  return str.substring(0, truncateLength) + suffix;
}

/**
 * Generate unique identifier
 * @param {string} prefix - Optional prefix
 * @return {string} Unique ID
 */
function generateId(prefix = '') {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Deep clone an object (handles nested objects and arrays)
 * @param {Object} obj - Object to clone
 * @return {Object} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @return {Array} Array of chunks
 */
function chunkArray(array, size) {
  if (!Array.isArray(array) || size < 1) {
    return [];
  }
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Sleep/delay function
 * @param {number} milliseconds - Time to sleep
 */
function sleep(milliseconds) {
  if (milliseconds > 0) {
    Utilities.sleep(milliseconds);
  }
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename or path
 * @return {string} Extension without dot, lowercase
 */
function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @return {boolean} True if empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @return {string} Title cased string
 */
function toTitleCase(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Remove duplicate values from array
 * @param {Array} array - Array with potential duplicates
 * @return {Array} Array with unique values
 */
function uniqueArray(array) {
  if (!Array.isArray(array)) {
    return [];
  }
  
  return [...new Set(array)];
}

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places (default 2)
 * @return {string} Formatted size string
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}