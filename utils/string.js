/**
 * String utility functions
 * Provides string manipulation, formatting, and validation utilities
 */

/**
 * Truncates a string to specified length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength, suffix = '...') {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  
  const truncateAt = maxLength - suffix.length;
  return str.substring(0, truncateAt) + suffix;
}

/**
 * Sanitizes a string for use as a filename
 * @param {string} filename - Filename to sanitize
 * @param {string} replacement - Character to replace invalid chars with
 * @returns {string} Sanitized filename
 */
export function sanitizeFileName(filename, replacement = '_') {
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
 * Converts bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export function toCamelCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Converts string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
export function toKebabCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('-') || '';
}

/**
 * Converts string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export function toSnakeCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map(x => x.toLowerCase())
    .join('_') || '';
}

/**
 * Removes all whitespace from a string
 * @param {string} str - String to process
 * @returns {string} String without whitespace
 */
export function removeWhitespace(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s/g, '');
}

/**
 * Counts the number of words in a string
 * @param {string} str - String to count words in
 * @returns {number} Number of words
 */
export function wordCount(str) {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Pads a string to a specified length
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} padChar - Character to pad with
 * @param {boolean} padLeft - Whether to pad left (true) or right (false)
 * @returns {string} Padded string
 */
export function padString(str, length, padChar = ' ', padLeft = true) {
  if (!str || typeof str !== 'string') str = '';
  if (str.length >= length) return str;
  
  const padding = padChar.repeat(length - str.length);
  return padLeft ? padding + str : str + padding;
}
