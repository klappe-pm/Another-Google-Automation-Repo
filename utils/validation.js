/**
 * Validation utility functions
 * Provides validation helpers for common data formats
 */

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates phone number (basic format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Basic phone validation - allows various international formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Validates credit card number using Luhn algorithm
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} True if valid card number
 */
export function validateCreditCard(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Check if all characters are digits
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  // Check length (most cards are 13-19 digits)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let alternate = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates IP address (IPv4)
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IPv4 address
 */
export function validateIPv4(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Validates IPv6 address
 * @param {string} ip - IPv6 address to validate
 * @returns {boolean} True if valid IPv6 address
 */
export function validateIPv6(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6CompressedRegex = /^(([0-9a-fA-F]{1,4}:)*)?::?(([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4})?$/;
  
  return ipv6Regex.test(ip) || ipv6CompressedRegex.test(ip);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with score and requirements
 */
export function validatePassword(password, options = {}) {
  const defaults = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 1
  };
  
  const opts = { ...defaults, ...options };
  const result = {
    isValid: true,
    score: 0,
    failedRequirements: [],
    strength: 'weak'
  };
  
  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.failedRequirements.push('Password is required');
    return result;
  }
  
  // Length check
  if (password.length < opts.minLength) {
    result.isValid = false;
    result.failedRequirements.push(`Minimum ${opts.minLength} characters required`);
  } else {
    result.score += 1;
  }
  
  // Uppercase check
  if (opts.requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.failedRequirements.push('At least one uppercase letter required');
  } else if (/[A-Z]/.test(password)) {
    result.score += 1;
  }
  
  // Lowercase check
  if (opts.requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.failedRequirements.push('At least one lowercase letter required');
  } else if (/[a-z]/.test(password)) {
    result.score += 1;
  }
  
  // Numbers check
  if (opts.requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.failedRequirements.push('At least one number required');
  } else if (/\d/.test(password)) {
    result.score += 1;
  }
  
  // Special characters check
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
  const specialCharCount = (password.match(specialChars) || []).length;
  
  if (opts.requireSpecialChars && specialCharCount < opts.minSpecialChars) {
    result.isValid = false;
    result.failedRequirements.push(`At least ${opts.minSpecialChars} special character(s) required`);
  } else if (specialCharCount >= opts.minSpecialChars) {
    result.score += 1;
  }
  
  // Determine strength
  if (result.score >= 4) {
    result.strength = 'strong';
  } else if (result.score >= 2) {
    result.strength = 'medium';
  }
  
  return result;
}

/**
 * Validates if a string is a valid JSON
 * @param {string} jsonString - JSON string to validate
 * @returns {boolean} True if valid JSON
 */
export function validateJSON(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') return false;
  
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates if a value is a valid number
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid number
 */
export function validateNumber(value, options = {}) {
  const { min, max, integer = false } = options;
  
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return false;
  
  if (integer && !Number.isInteger(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
}

/**
 * Validates if a string matches a specific pattern
 * @param {string} value - Value to validate
 * @param {RegExp|string} pattern - Pattern to match against
 * @returns {boolean} True if value matches pattern
 */
export function validatePattern(value, pattern) {
  if (!value || typeof value !== 'string') return false;
  
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
}
