/**
  * Script Name: common-utils
  *
  * Script Summary:
  * Common utility functions used across multiple Google Apps Script projects.
  *
  * Script Purpose:
  * - Provide date formatting and manipulation utilities
  * - Generate unique identifiers
  * - Validate common data formats
  * - String manipulation helpers
  *
  * Script Functions:
  * - formatDate(): Format dates consistently
  * - parseDate(): Parse date strings flexibly
  * - generateId(): Generate unique identifiers
  * - validateEmail(): Validate email format
  * - validateUrl(): Validate URL format
  * - truncateString(): Truncate strings with ellipsis
  * - sanitizeFileName(): Clean filename for Drive
  * - sleep(): Wrapper for Utilities.sleep with validation
  * - chunk(): Split array into chunks
  * - debounce(): Create debounced function
  *
  * Script Dependencies:
  * - None (standalone utility module)
  *
  * Google Services:
  * - Utilities: For core utility functions
  */

/**
  * Common date format patterns
  */
const DateFormats = {
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'',
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  FRIENDLY: 'MMM dd, yyyy',
  FRIENDLY_TIME: 'MMM dd, yyyy HH:mm',
  FILENAME: 'yyyy-MM-dd_HH-mm-ss'
};

/**
  * Formats a date using specified format or pattern
  * @param {Date} date - The date to format
  * @param {string} format - Format pattern or key from DateFormats
  * @param {string} timezone - Optional timezone (defaults to script timezone)
  * @returns {string} Formatted date string
  */
function formatDate(date, format = DateFormats.DATETIME, timezone = null) {
  if (!date || !(date instanceof Date)) {
    return '';
  }

  // Use predefined format if it exists
  const formatPattern = DateFormats[format] || format;
  const tz = timezone || Session.getScriptTimeZone();

  try {
    return Utilities.formatDate(date, tz, formatPattern);
  } catch (error) {
    Logger.log(`Error formatting date: ${error.toString()}`);
    return date.toString();
  }
}

/**
  * Parses a date string flexibly
  * @param {string} dateString - The date string to parse
  * @param {string} timezone - Optional timezone
  * @returns {Date|null} Parsed date or null if invalid
  */
function parseDate(dateString, timezone = null) {
  if (!dateString) return null;

  try {
    // Try direct Date parsing first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try common formats
    const commonFormats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})-(\d{2})-(\d{4})/ // DD-MM-YYYY
    ];

    for (const format of commonFormats) {
      const match = dateString.match(format);
      if (match) {
        // Attempt to create date from parts
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    return null;
  } catch (error) {
    Logger.log(`Error parsing date: ${error.toString()}`);
    return null;
  }
}

/**
  * Generates a unique identifier
  * @param {string} prefix - Optional prefix for the ID
  * @param {boolean} includeTimestamp - Include timestamp in ID
  * @returns {string} Unique identifier
  */
function generateId(prefix = '', includeTimestamp = false) {
  const uuid = Utilities.getUuid();

  if (includeTimestamp) {
    const timestamp = new Date().getTime();
    return prefix ? `${prefix}_${timestamp}_${uuid}` : `${timestamp}_${uuid}`;
  }

  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
  * Validates email address format
  * @param {string} email - Email address to validate
  * @returns {boolean} True if valid email format
  */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
  * Validates URL format
  * @param {string} url - URL to validate
  * @returns {boolean} True if valid URL format
  */
function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
  * Truncates a string to specified length with ellipsis
  * @param {string} str - String to truncate
  * @param {number} maxLength - Maximum length
  * @param {string} suffix - Suffix to add (default: '...')
  * @returns {string} Truncated string
  */
function truncateString(str, maxLength, suffix = '...') {
  if (!str || str.length <= maxLength) return str;

  const truncateAt = maxLength - suffix.length;
  return str.substring(0, truncateAt) + suffix;
}

/**
  * Sanitizes a string for use as a filename
  * @param {string} filename - Filename to sanitize
  * @param {string} replacement - Character to replace invalid chars with
  * @returns {string} Sanitized filename
  */
function sanitizeFileName(filename, replacement = '_') {
  if (!filename) return 'untitled';

  // Remove or replace invalid characters
  const sanitized = filename
    .replace(/[<>:"/\\|?*]/g, replacement) // Invalid chars on most systems
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Control characters
    .replace(/^\.+/, '') // Leading dots
    .replace(/\s+/g, ' ') // Multiple spaces
    .trim();

  // Ensure filename is not empty after sanitization
  return sanitized || 'untitled';
}

/**
  * Safe wrapper for Utilities.sleep with validation
  * @param {number} milliseconds - Time to sleep in milliseconds
  * @returns {boolean} True if sleep was successful
  */
function sleep(milliseconds) {
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    Logger.log(`Invalid sleep duration: ${milliseconds}`);
    return false;
  }

  try {
    Utilities.sleep(Math.min(milliseconds, 300000)); // Cap at 5 minutes
    return true;
  } catch (error) {
    Logger.log(`Error during sleep: ${error.toString()}`);
    return false;
  }
}

/**
  * Splits an array into chunks of specified size
  * @param {Array} array - Array to split
  * @param {number} chunkSize - Size of each chunk
  * @returns {Array[]} Array of chunks
  */
function chunk(array, chunkSize) {
  if (!Array.isArray(array) || chunkSize <= 0) return [];

  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
  * Creates a debounced version of a function
  * @param {Function} func - Function to debounce
  * @param {number} wait - Wait time in milliseconds
  * @returns {Function} Debounced function
  */
function debounce(func, wait) {
  let timeout;

  return function debounced(...args) {
    const context = this;

    const later = function() {
      timeout = null;
      func.apply(context, args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
  * Converts bytes to human-readable format
  * @param {number} bytes - Number of bytes
  * @param {number} decimals - Number of decimal places
  * @returns {string} Formatted string (e.g., "1.5 MB")
  */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
  * Deep clones an object (for simple objects without functions)
  * @param {Object} obj - Object to clone
  * @returns {Object} Cloned object
  */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}