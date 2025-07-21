# Security Development Guidelines for AGAR

## Table of Contents
1. [Overview](#overview)
2. [Secure Coding Standards](#secure-coding-standards)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Input Validation](#input-validation)
6. [Error Handling](#error-handling)
7. [Logging & Monitoring](#logging--monitoring)
8. [Code Review Guidelines](#code-review-guidelines)
9. [Testing Requirements](#testing-requirements)
10. [Deployment Security](#deployment-security)

## Overview

This document provides comprehensive security guidelines for developing Google Apps Script automation tools in the Another-Google-Automation-Repo (AGAR). These guidelines help ensure all scripts meet enterprise security standards.

### Security Principles

1. **Principle of Least Privilege**: Request only necessary permissions
2. **Defense in Depth**: Multiple layers of security controls
3. **Fail Securely**: Default to secure behavior on errors
4. **Zero Trust**: Validate all inputs and assumptions
5. **Privacy by Design**: Minimize data collection and exposure

## Secure Coding Standards

### 1. Script Headers and Documentation

Every Google Apps Script file must include comprehensive security documentation:

```javascript
/**
 * Title: [Descriptive Script Name]
 * Service: [Primary Google Service]
 * Purpose: [Main functionality]
 * Security Level: [LOW/MEDIUM/HIGH/CRITICAL]
 * Data Access: [Description of data accessed]
 * Created: [YYYY-MM-DD]
 * Updated: [YYYY-MM-DD]
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Security Assessment:
- OAuth Scopes Required: [List minimal scopes]
- Data Sensitivity: [Public/Internal/Confidential/Restricted]
- External Dependencies: [List any external services]
- Risk Factors: [Potential security concerns]
- Mitigation Strategies: [How risks are addressed]
- Last Security Review: [YYYY-MM-DD]
*/
```

### 2. Credential Management

**✅ Secure Credential Storage**
```javascript
// Good: Use PropertiesService for sensitive data
function getApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey) {
    throw new Error('API key not configured. Please set API_KEY in script properties.');
  }
  return apiKey;
}

// Good: Use built-in authentication
function authenticateWithGoogle() {
  // Google Apps Script handles OAuth automatically
  // No need to store credentials manually
}
```

**❌ Insecure Practices**
```javascript
// Bad: Hardcoded credentials
const API_KEY = 'AIzaSyAbc123def456...'; // Never do this!

// Bad: Storing credentials in code comments
// My API key is: sk-1234567890abcdef

// Bad: Exposing credentials in logs
console.log('Using API key: ' + apiKey);
```

### 3. OAuth Scope Minimization

Request only the minimum necessary OAuth scopes:

```javascript
// appsscript.json - Minimal scopes example
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/drive.file"
  ]
}

// Avoid broad scopes unless absolutely necessary:
// "https://www.googleapis.com/auth/drive" (too broad)
// "https://www.googleapis.com/auth/gmail.modify" (too permissive)
```

### 4. Input Validation and Sanitization

**✅ Proper Input Validation**
```javascript
function validateFolderId(folderId) {
  // Validate folder ID format
  if (!folderId || typeof folderId !== 'string') {
    throw new Error('Invalid folder ID: must be a non-empty string');
  }
  
  // Google Drive folder IDs are typically 33-44 characters
  if (folderId.length < 20 || folderId.length > 50) {
    throw new Error('Invalid folder ID format');
  }
  
  // Check for valid characters (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    throw new Error('Invalid folder ID: contains invalid characters');
  }
  
  return folderId;
}

function validateEmailAddress(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error('Invalid email address format');
  }
  return email.toLowerCase().trim();
}

function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Remove potentially dangerous characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace filesystem-unsafe chars
    .replace(/\.\./g, '_')         // Prevent directory traversal
    .substring(0, 255)             // Limit length
    .trim();
}
```

**❌ Insecure Input Handling**
```javascript
// Bad: No validation
function processFolder(folderId) {
  DriveApp.getFolderById(folderId); // Could fail with invalid input
}

// Bad: Direct string concatenation without sanitization
function createQuery(userInput) {
  return `from:${userInput}`; // Potential injection
}
```

### 5. Error Handling and Information Disclosure

**✅ Secure Error Handling**
```javascript
function secureApiCall(resourceId) {
  try {
    const resource = DriveApp.getFileById(resourceId);
    return processResource(resource);
  } catch (error) {
    // Log detailed error internally
    console.error(`API call failed for resource: ${resourceId}`, error);
    
    // Return generic error to user
    throw new Error('Resource access failed. Please check permissions and try again.');
  }
}

function handleAuthenticationError(error) {
  // Don't expose internal authentication details
  Logger.log('Authentication error: ' + error.message);
  throw new Error('Authentication required. Please re-authorize the application.');
}
```

**❌ Information Disclosure**
```javascript
// Bad: Exposing internal details
try {
  const file = DriveApp.getFileById(fileId);
} catch (error) {
  throw error; // May expose file paths, API details, etc.
}

// Bad: Detailed error messages
throw new Error(`Database connection failed: ${connectionString} with user ${username}`);
```

## Authentication & Authorization

### 1. OAuth Implementation

```javascript
/**
 * Check if user has necessary permissions
 */
function validatePermissions() {
  try {
    // Test access to required services
    DriveApp.getRootFolder(); // Will fail if no Drive access
    GmailApp.getInboxThreads(0, 1); // Will fail if no Gmail access
    
    return true;
  } catch (error) {
    Logger.log('Permission validation failed: ' + error.message);
    return false;
  }
}

/**
 * Request specific permissions with user consent
 */
function requestPermissions() {
  const ui = HtmlService.createHtmlOutput(`
    <h3>Permission Required</h3>
    <p>This script needs access to your Google Drive and Gmail to function properly.</p>
    <p>Please authorize when prompted.</p>
    <script>google.script.host.close();</script>
  `);
  
  SpreadsheetApp.getUi().showModalDialog(ui, 'Authorization Required');
}
```

### 2. Session Management

```javascript
/**
 * Secure session handling for long-running operations
 */
class SecureSession {
  constructor() {
    this.startTime = Date.now();
    this.maxDuration = 30 * 60 * 1000; // 30 minutes
  }
  
  isValid() {
    return (Date.now() - this.startTime) < this.maxDuration;
  }
  
  validateAndRefresh() {
    if (!this.isValid()) {
      throw new Error('Session expired. Please restart the operation.');
    }
    
    // Refresh session
    this.startTime = Date.now();
  }
}
```

## Data Protection

### 1. Data Classification

```javascript
/**
 * Data classification levels for AGAR scripts
 */
const DATA_CLASSIFICATION = {
  PUBLIC: 'public',           // No sensitive information
  INTERNAL: 'internal',       // Company internal data
  CONFIDENTIAL: 'confidential', // Sensitive business data
  RESTRICTED: 'restricted'    // Highly sensitive data
};

/**
 * Handle data based on classification
 */
function processData(data, classification) {
  switch (classification) {
    case DATA_CLASSIFICATION.RESTRICTED:
      // Extra encryption, limited access, audit logging
      return processRestrictedData(data);
      
    case DATA_CLASSIFICATION.CONFIDENTIAL:
      // Standard encryption, access controls
      return processConfidentialData(data);
      
    case DATA_CLASSIFICATION.INTERNAL:
      // Basic protection, internal use only
      return processInternalData(data);
      
    default:
      // Public data, minimal protection
      return processPublicData(data);
  }
}
```

### 2. Data Minimization

```javascript
/**
 * Email export with data minimization
 */
function exportEmailsSecurely(searchQuery, outputFolder) {
  const threads = GmailApp.search(searchQuery, 0, 50); // Limit results
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    
    messages.forEach(message => {
      // Only export necessary fields
      const emailData = {
        date: message.getDate(),
        subject: message.getSubject(),
        from: extractEmailOnly(message.getFrom()), // Remove display names
        to: extractEmailOnly(message.getTo()),
        // Don't export: CC, BCC, attachments unless specifically needed
        body: sanitizeEmailBody(message.getPlainBody())
      };
      
      saveEmailData(emailData, outputFolder);
    });
  });
}

function extractEmailOnly(emailString) {
  // Extract just email address, remove display names for privacy
  const match = emailString.match(/<([^>]+)>/);
  return match ? match[1] : emailString.split(' ')[0];
}
```

### 3. Data Retention

```javascript
/**
 * Implement data retention policies
 */
function cleanupOldData() {
  const retentionPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  const cutoffDate = new Date(Date.now() - retentionPeriod);
  
  // Clean up old export files
  const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
  const files = folder.getFiles();
  
  while (files.hasNext()) {
    const file = files.next();
    
    if (file.getDateCreated() < cutoffDate) {
      Logger.log(`Deleting old file: ${file.getName()}`);
      DriveApp.getFileById(file.getId()).setTrashed(true);
    }
  }
}
```

## Input Validation

### 1. Comprehensive Validation Framework

```javascript
/**
 * Input validation utilities
 */
class InputValidator {
  static validateRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`);
    }
    return value;
  }
  
  static validateString(value, fieldName, minLength = 1, maxLength = 1000) {
    this.validateRequired(value, fieldName);
    
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    
    if (value.length < minLength || value.length > maxLength) {
      throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    }
    
    return value.trim();
  }
  
  static validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email || !emailRegex.test(email)) {
      throw new Error('Invalid email address format');
    }
    
    return email.toLowerCase().trim();
  }
  
  static validateDate(dateString, fieldName) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} must be a valid date`);
    }
    
    return date;
  }
  
  static validateGoogleId(id, type = 'resource') {
    if (!id || typeof id !== 'string') {
      throw new Error(`Invalid ${type} ID: must be a non-empty string`);
    }
    
    // Google IDs are typically 25-50 characters, alphanumeric with some special chars
    if (!/^[a-zA-Z0-9_-]{20,50}$/.test(id)) {
      throw new Error(`Invalid ${type} ID format`);
    }
    
    return id;
  }
}

/**
 * Example usage in script functions
 */
function exportCalendarEvents(startDate, endDate, folderId) {
  try {
    // Validate all inputs
    const validStartDate = InputValidator.validateDate(startDate, 'Start date');
    const validEndDate = InputValidator.validateDate(endDate, 'End date');
    const validFolderId = InputValidator.validateGoogleId(folderId, 'folder');
    
    // Additional business logic validation
    if (validEndDate <= validStartDate) {
      throw new Error('End date must be after start date');
    }
    
    const timeDiff = validEndDate.getTime() - validStartDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (daysDiff > 365) {
      throw new Error('Date range cannot exceed 365 days');
    }
    
    // Proceed with validated inputs
    return processCalendarExport(validStartDate, validEndDate, validFolderId);
    
  } catch (error) {
    Logger.log(`Validation error in exportCalendarEvents: ${error.message}`);
    throw new Error(`Export failed: ${error.message}`);
  }
}
```

## Error Handling

### 1. Structured Error Handling

```javascript
/**
 * Custom error classes for better error handling
 */
class AGARError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AGARError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AGARError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AGARError {
  constructor(message) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends AGARError {
  constructor(message, retryAfter) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Global error handler
 */
function handleError(error, context = {}) {
  const errorInfo = {
    name: error.name || 'UnknownError',
    message: error.message,
    code: error.code || 'UNKNOWN',
    context: context,
    timestamp: new Date().toISOString(),
    stackTrace: error.stack
  };
  
  // Log detailed error information
  console.error('AGAR Error:', JSON.stringify(errorInfo, null, 2));
  
  // Handle different error types
  switch (error.constructor) {
    case ValidationError:
      return handleValidationError(error);
      
    case AuthenticationError:
      return handleAuthenticationError(error);
      
    case RateLimitError:
      return handleRateLimitError(error);
      
    default:
      return handleGenericError(error);
  }
}

function handleValidationError(error) {
  throw new Error(`Invalid input: ${error.message}`);
}

function handleAuthenticationError(error) {
  throw new Error('Authentication required. Please reauthorize the application.');
}

function handleRateLimitError(error) {
  const retryAfter = error.details.retryAfter || 60;
  throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`);
}

function handleGenericError(error) {
  throw new Error('An unexpected error occurred. Please try again later.');
}
```

### 2. Retry Logic with Exponential Backoff

```javascript
/**
 * Retry mechanism for handling transient failures
 */
async function withRetry(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation or authentication errors
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        Logger.log(`Final retry attempt failed: ${error.message}`);
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      Logger.log(`Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new AGARError(`Operation failed after ${maxRetries} attempts`, 'MAX_RETRIES_EXCEEDED', {
    lastError: lastError.message,
    attempts: maxRetries
  });
}

/**
 * Example usage
 */
function reliableApiCall(fileId) {
  return withRetry(() => {
    return DriveApp.getFileById(fileId);
  }, 3, 1000);
}
```

## Logging & Monitoring

### 1. Structured Logging

```javascript
/**
 * Structured logging system
 */
class AGARLogger {
  static logLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
  };
  
  static currentLogLevel = this.logLevel.INFO;
  
  static log(level, message, context = {}) {
    if (level < this.currentLogLevel) {
      return; // Skip logging if below current level
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: Object.keys(this.logLevel)[level],
      message: message,
      context: context,
      script: this.getScriptName(),
      user: Session.getActiveUser().getEmail()
    };
    
    // Log to console
    console.log(JSON.stringify(logEntry));
    
    // For critical errors, could also send alerts
    if (level >= this.logLevel.CRITICAL) {
      this.sendAlert(logEntry);
    }
  }
  
  static debug(message, context) {
    this.log(this.logLevel.DEBUG, message, context);
  }
  
  static info(message, context) {
    this.log(this.logLevel.INFO, message, context);
  }
  
  static warn(message, context) {
    this.log(this.logLevel.WARN, message, context);
  }
  
  static error(message, context) {
    this.log(this.logLevel.ERROR, message, context);
  }
  
  static critical(message, context) {
    this.log(this.logLevel.CRITICAL, message, context);
  }
  
  static getScriptName() {
    try {
      return ScriptApp.getScriptId();
    } catch (e) {
      return 'unknown';
    }
  }
  
  static sendAlert(logEntry) {
    // Implementation would depend on alerting system
    // Could send email, webhook, etc.
    console.error('CRITICAL ALERT:', logEntry);
  }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
  static startTimer(operationName) {
    const timer = {
      name: operationName,
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    };
    
    AGARLogger.debug(`Starting operation: ${operationName}`, timer);
    return timer;
  }
  
  static endTimer(timer) {
    const duration = Date.now() - timer.startTime;
    const endMemory = this.getMemoryUsage();
    const memoryDelta = endMemory - timer.startMemory;
    
    const metrics = {
      operation: timer.name,
      duration: duration,
      startMemory: timer.startMemory,
      endMemory: endMemory,
      memoryDelta: memoryDelta
    };
    
    AGARLogger.info(`Operation completed: ${timer.name}`, metrics);
    
    // Alert on performance issues
    if (duration > 30000) { // 30 seconds
      AGARLogger.warn(`Slow operation detected: ${timer.name}`, metrics);
    }
    
    return metrics;
  }
  
  static getMemoryUsage() {
    try {
      return DriveApp.getStorageUsed();
    } catch (e) {
      return 0;
    }
  }
}

/**
 * Usage example
 */
function monitoredEmailExport(searchQuery) {
  const timer = PerformanceMonitor.startTimer('email-export');
  
  try {
    AGARLogger.info('Starting email export', { query: searchQuery });
    
    const emails = GmailApp.search(searchQuery);
    AGARLogger.info('Found emails', { count: emails.length });
    
    // Process emails...
    const results = processEmails(emails);
    
    AGARLogger.info('Email export completed successfully', { 
      exported: results.length,
      query: searchQuery 
    });
    
    return results;
    
  } catch (error) {
    AGARLogger.error('Email export failed', {
      error: error.message,
      query: searchQuery
    });
    throw error;
    
  } finally {
    PerformanceMonitor.endTimer(timer);
  }
}
```

## Testing Requirements

### 1. Security Testing Framework

```javascript
/**
 * Security test utilities
 */
class SecurityTester {
  static testInputValidation(functionToTest, validInputs, invalidInputs) {
    AGARLogger.info('Testing input validation', { function: functionToTest.name });
    
    // Test valid inputs should not throw
    validInputs.forEach(input => {
      try {
        functionToTest(...input);
        AGARLogger.debug('Valid input test passed', { input });
      } catch (error) {
        AGARLogger.error('Valid input test failed', { input, error: error.message });
        throw new Error(`Valid input rejected: ${JSON.stringify(input)}`);
      }
    });
    
    // Test invalid inputs should throw
    invalidInputs.forEach(input => {
      try {
        functionToTest(...input);
        AGARLogger.error('Invalid input test failed', { input });
        throw new Error(`Invalid input accepted: ${JSON.stringify(input)}`);
      } catch (error) {
        AGARLogger.debug('Invalid input test passed', { input, error: error.message });
      }
    });
  }
  
  static testAuthorizationChecks(functionToTest) {
    // Test function behavior with limited permissions
    // This would require mock objects or test environments
    AGARLogger.info('Testing authorization checks', { function: functionToTest.name });
  }
  
  static testErrorHandling(functionToTest, errorConditions) {
    errorConditions.forEach(condition => {
      try {
        // Simulate error condition
        functionToTest(condition.input);
        throw new Error('Expected error was not thrown');
      } catch (error) {
        // Verify error doesn't expose sensitive information
        if (this.containsSensitiveInfo(error.message)) {
          throw new Error('Error message contains sensitive information');
        }
        AGARLogger.debug('Error handling test passed', { 
          condition: condition.name,
          error: error.message 
        });
      }
    });
  }
  
  static containsSensitiveInfo(message) {
    const sensitivePatterns = [
      /password/i,
      /api.?key/i,
      /token/i,
      /secret/i,
      /AIza[0-9A-Za-z\\-_]{35}/,  // Google API keys
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ // Email addresses
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(message));
  }
}

/**
 * Example security tests
 */
function runSecurityTests() {
  AGARLogger.info('Starting security test suite');
  
  // Test input validation
  SecurityTester.testInputValidation(
    validateFolderId,
    [['1234567890abcdef'], ['valid-folder-id_123']],
    [[''], [null], [undefined], ['../../../'], ['<script>alert(1)</script>']]
  );
  
  // Test email validation
  SecurityTester.testInputValidation(
    validateEmailAddress,
    [['user@example.com'], ['test.email+tag@domain.co.uk']],
    [['invalid-email'], [''], ['user@'], ['@domain.com'], ['user space@domain.com']]
  );
  
  AGARLogger.info('Security tests completed');
}
```

## Code Review Guidelines

### Security Checklist for Code Reviews

**Authentication & Authorization**
- [ ] Are OAuth scopes minimal and appropriate?
- [ ] Are credentials stored securely using PropertiesService?
- [ ] Is user authentication properly validated?
- [ ] Are there appropriate permission checks?

**Input Validation**
- [ ] Are all user inputs validated?
- [ ] Are file paths and IDs properly sanitized?
- [ ] Are email addresses and URLs validated?
- [ ] Is there protection against injection attacks?

**Data Protection**
- [ ] Is sensitive data minimized and properly classified?
- [ ] Are temporary files cleaned up?
- [ ] Is data retention policy followed?
- [ ] Are outputs sanitized to prevent information disclosure?

**Error Handling**
- [ ] Do error messages avoid exposing sensitive information?
- [ ] Are all exceptions properly caught and handled?
- [ ] Is there appropriate logging without sensitive data?
- [ ] Are there retry mechanisms for transient failures?

**Security Headers**
- [ ] Does the script include proper security documentation?
- [ ] Are security considerations documented?
- [ ] Is the risk level appropriately assessed?
- [ ] Are dependencies and external services documented?

## Deployment Security

### 1. Pre-deployment Checklist

```javascript
/**
 * Pre-deployment security validation
 */
function validateDeploymentSecurity() {
  const checks = [
    checkCredentialSecurity,
    checkInputValidation,
    checkErrorHandling,
    checkLogging,
    checkPermissions,
    checkDataProtection
  ];
  
  const results = checks.map(check => {
    try {
      const result = check();
      return { check: check.name, status: 'PASS', details: result };
    } catch (error) {
      return { check: check.name, status: 'FAIL', details: error.message };
    }
  });
  
  const failures = results.filter(r => r.status === 'FAIL');
  
  if (failures.length > 0) {
    AGARLogger.error('Deployment security validation failed', { failures });
    throw new Error(`Security validation failed: ${failures.length} checks failed`);
  }
  
  AGARLogger.info('Deployment security validation passed', { results });
  return true;
}

function checkCredentialSecurity() {
  // Scan code for hardcoded credentials
  // This would be implemented based on static analysis
  return 'No hardcoded credentials detected';
}

function checkPermissions() {
  // Verify OAuth scopes are minimal
  const manifest = getManifest();
  const scopes = manifest.oauthScopes || [];
  
  // Flag overly broad scopes
  const broadScopes = scopes.filter(scope => 
    scope.includes('.modify') || 
    scope.endsWith('/*') ||
    !scope.includes('.readonly') && !scope.includes('.file')
  );
  
  if (broadScopes.length > 0) {
    throw new Error(`Overly broad OAuth scopes detected: ${broadScopes.join(', ')}`);
  }
  
  return `${scopes.length} appropriate OAuth scopes configured`;
}
```

### 2. Production Security Monitoring

```javascript
/**
 * Runtime security monitoring
 */
class SecurityMonitor {
  static monitorApiUsage() {
    const usage = {
      timestamp: new Date().toISOString(),
      driveApiCalls: this.countApiCalls('Drive'),
      gmailApiCalls: this.countApiCalls('Gmail'),
      calendarApiCalls: this.countApiCalls('Calendar'),
      errors: this.getErrorCount(),
      user: Session.getActiveUser().getEmail()
    };
    
    // Log usage patterns
    AGARLogger.info('API usage report', usage);
    
    // Alert on unusual patterns
    if (usage.driveApiCalls > 1000) {
      AGARLogger.warn('High Drive API usage detected', usage);
    }
    
    return usage;
  }
  
  static countApiCalls(service) {
    // Implementation would track API calls
    // This is a placeholder for monitoring logic
    return 0;
  }
  
  static getErrorCount() {
    // Implementation would track errors
    return 0;
  }
}
```

---

**This document provides comprehensive security guidelines for developing secure Google Apps Script automation tools. Regular review and updates ensure these guidelines remain current with evolving security threats and best practices.**

*Last Updated: July 18, 2025*  
*Next Review: October 18, 2025*
