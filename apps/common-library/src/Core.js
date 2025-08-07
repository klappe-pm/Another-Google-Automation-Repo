/**
 * Common Library - Core Entry Point
 * 
 * Purpose: Main entry point for the Common Library
 * Service: Shared Library
 * Created: 2025-08-06
 * Author: Kevin Lappe
 * 
 * This is the main entry point that exports all library functions
 * for use by other Google Apps Script projects.
 * 
 * Usage in other projects:
 * 1. Add this library to your project dependencies
 * 2. Access functions via CommonLib.functionName()
 * 
 * Example:
 *   const formattedDate = CommonLib.formatDate(new Date());
 *   const result = CommonLib.processBatches(items, processor);
 */

/**
 * Library version information
 */
const LIBRARY_VERSION = '1.0.0';
const LIBRARY_NAME = 'Workspace Common Library';
const LIBRARY_UPDATED = '2025-08-06';

/**
 * Main library object that exposes all public functions
 * This object is what becomes available to consuming projects
 */
function getLibrary() {
  return {
    // Version Information
    version: LIBRARY_VERSION,
    name: LIBRARY_NAME,
    updated: LIBRARY_UPDATED,
    
    // ===== Utility Functions (Utils.js) =====
    formatDate: formatDate,
    parseDate: parseDate,
    validateEmail: validateEmail,
    validateUrl: validateUrl,
    sanitizeFileName: sanitizeFileName,
    truncateString: truncateString,
    generateId: generateId,
    deepClone: deepClone,
    chunkArray: chunkArray,
    sleep: sleep,
    getFileExtension: getFileExtension,
    isEmpty: isEmpty,
    toTitleCase: toTitleCase,
    uniqueArray: uniqueArray,
    formatFileSize: formatFileSize,
    
    // ===== Error Handling (ErrorHandler.js) =====
    handleError: handleError,
    withErrorHandling: withErrorHandling,
    withRetry: withRetry,
    classifyError: classifyError,
    determineSeverity: determineSeverity,
    getRecentErrors: getRecentErrors,
    clearStoredErrors: clearStoredErrors,
    getUserFriendlyMessage: getUserFriendlyMessage,
    isRetryableError: isRetryableError,
    ErrorSeverity: ErrorSeverity,
    ErrorType: ErrorType,
    
    // ===== Logging (Logger.js) =====
    log: log,
    logDebug: logDebug,
    logInfo: logInfo,
    logWarn: logWarn,
    logError: logError,
    logPerformance: logPerformance,
    logFunctionEntry: logFunctionEntry,
    logFunctionExit: logFunctionExit,
    configureLogging: configureLogging,
    setLogLevel: setLogLevel,
    getRecentLogs: getRecentLogs,
    clearLogs: clearLogs,
    createLogger: createLogger,
    LogLevel: LogLevel,
    
    // ===== Data Processing (DataProcessor.js) =====
    processBatches: processBatches,
    processWithRateLimit: processWithRateLimit,
    processInParallel: processInParallel,
    isTimeoutApproaching: isTimeoutApproaching,
    getCheckpoint: getCheckpoint,
    clearCheckpoint: clearCheckpoint,
    resumeFromCheckpoint: resumeFromCheckpoint,
    calculateOptimalBatchSize: calculateOptimalBatchSize,
    withPerformanceMonitoring: withPerformanceMonitoring,
    
    // ===== Helper Functions =====
    getLibraryInfo: getLibraryInfo,
    testConnection: testConnection,
    runSelfTest: runSelfTest
  };
}

/**
 * Get library information
 * @return {Object} Library metadata
 */
function getLibraryInfo() {
  return {
    name: LIBRARY_NAME,
    version: LIBRARY_VERSION,
    updated: LIBRARY_UPDATED,
    modules: [
      'Utils - Utility functions',
      'ErrorHandler - Error management',
      'Logger - Structured logging',
      'DataProcessor - Batch processing'
    ],
    author: 'Kevin Lappe',
    repository: 'Workspace Automation',
    documentation: '/refactor-august-2025/'
  };
}

/**
 * Test library connection
 * @return {string} Success message
 */
function testConnection() {
  return `✅ Successfully connected to ${LIBRARY_NAME} v${LIBRARY_VERSION}`;
}

/**
 * Run self-test to verify all modules are working
 * @return {Object} Test results
 */
function runSelfTest() {
  const results = {
    success: true,
    tests: [],
    errors: []
  };
  
  // Test Utils
  try {
    const date = formatDate(new Date());
    const email = validateEmail('test@example.com');
    const filename = sanitizeFileName('test/file:name.txt');
    results.tests.push('✅ Utils module working');
  } catch (e) {
    results.success = false;
    results.errors.push('Utils: ' + e.toString());
    results.tests.push('❌ Utils module failed');
  }
  
  // Test ErrorHandler
  try {
    const testError = new Error('Test error');
    const errorInfo = handleError(testError, { test: true });
    results.tests.push('✅ ErrorHandler module working');
  } catch (e) {
    results.success = false;
    results.errors.push('ErrorHandler: ' + e.toString());
    results.tests.push('❌ ErrorHandler module failed');
  }
  
  // Test Logger
  try {
    logInfo('Self-test log entry', { test: true });
    results.tests.push('✅ Logger module working');
  } catch (e) {
    results.success = false;
    results.errors.push('Logger: ' + e.toString());
    results.tests.push('❌ Logger module failed');
  }
  
  // Test DataProcessor
  try {
    const testItems = [1, 2, 3, 4, 5];
    const result = processBatches(testItems, (batch) => batch, { batchSize: 2 });
    results.tests.push('✅ DataProcessor module working');
  } catch (e) {
    results.success = false;
    results.errors.push('DataProcessor: ' + e.toString());
    results.tests.push('❌ DataProcessor module failed');
  }
  
  results.summary = results.success 
    ? '✅ All modules passed self-test' 
    : '❌ Some modules failed self-test';
  
  return results;
}

/**
 * Global library object
 * This is what consuming projects will access
 */
var CommonLib = getLibrary();

/**
 * For testing within the library project itself
 */
function testLibrary() {
  console.log('Testing Common Library...');
  console.log('Library Info:', getLibraryInfo());
  console.log('Connection Test:', testConnection());
  console.log('Self Test:', runSelfTest());
  
  // Test specific functions
  console.log('Date Format Test:', CommonLib.formatDate(new Date()));
  console.log('Email Validation Test:', CommonLib.validateEmail('test@example.com'));
  
  // Test batch processing
  const items = Array.from({length: 10}, (_, i) => i + 1);
  const result = CommonLib.processBatches(
    items,
    (batch) => batch.map(x => x * 2),
    { batchSize: 3 }
  );
  console.log('Batch Processing Test:', result);
  
  return 'Library test complete - check logs for details';
}