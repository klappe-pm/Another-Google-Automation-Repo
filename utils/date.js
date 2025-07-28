/**
 * Date utility functions
 * Provides date formatting, parsing, and manipulation utilities
 */

/**
 * Common date format patterns
 */
export const DateFormats = {
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
 * @param {string} timezone - Optional timezone (defaults to system timezone)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = DateFormats.DATETIME, timezone = null) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  
  // Use predefined format if it exists
  const formatPattern = DateFormats[format] || format;
  
  try {
    // For Node.js environment, use toLocaleString as fallback
    if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
      const tz = timezone || Session.getScriptTimeZone();
      return Utilities.formatDate(date, tz, formatPattern);
    }
    
    // Fallback for non-GAS environments
    return date.toISOString().replace('T', ' ').replace('Z', '');
  } catch (error) {
    console.log(`Error formatting date: ${error.toString()}`);
    return date.toString();
  }
}

/**
 * Parses a date string flexibly
 * @param {string} dateString - The date string to parse
 * @param {string} timezone - Optional timezone
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateString, timezone = null) {
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
    console.log(`Error parsing date: ${error.toString()}`);
    return null;
  }
}

/**
 * Checks if a date is valid
 * @param {Date} date - Date to validate
 * @returns {boolean} True if date is valid
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Gets the current date formatted for filenames
 * @returns {string} Current date in filename-safe format
 */
export function getCurrentDateForFilename() {
  return formatDate(new Date(), DateFormats.FILENAME);
}

/**
 * Calculates the difference between two dates in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
export function daysBetween(date1, date2) {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    return 0;
  }
  
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}
