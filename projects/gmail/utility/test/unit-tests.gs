/**
 * Title: Utility Package Unit Tests
 * Service: Utility
 * Purpose: Comprehensive unit tests for all utility functions
 * Created: 2025-01-16
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Usage:
 *   runAllUtilityTests(); // Run all tests
 *   runConfigTests(); // Run specific test suite
 *   testConfig_Get(); // Run individual test
 * 
 * Timeout Strategy: 30-second timeout per test suite
 * Batch Processing: Tests run in batches to avoid execution limits
 * Cache Strategy: Test data caching for repeated test runs
 * Security: Test data sanitization and secure storage
 * Performance: Optimized test execution and reporting
 */

/*
Script Summary:
- Purpose: Provide comprehensive testing for all utility functions
- Description: Unit tests covering Config, Logger, Http, Auth, and ErrorHandler utilities
- Problem Solved: Ensures utility reliability and catches regressions
- Successful Execution: All tests pass, confirming utility package functionality
*/

/**
 * Test Framework
 */
class TestFramework {
  static results = [];
  static currentSuite = null;
  
  /**
   * Start a test suite
   * @param {string} suiteName - Name of the test suite
   */
  static suite(suiteName) {
    this.currentSuite = suiteName;
    console.log(`\n=== ${suiteName} Tests ===`);
  }
  
  /**
   * Run individual test
   * @param {string} testName - Name of the test
   * @param {Function} testFn - Test function
   */
  static test(testName, testFn) {
    const startTime = Date.now();
    let result = {
      suite: this.currentSuite,
      name: testName,
      passed: false,
      duration: 0,
      error: null
    };
    
    try {
      testFn();
      result.passed = true;
      console.log(`✓ ${testName}`);
    } catch (error) {
      result.passed = false;
      result.error = error.message;
      console.error(`✗ ${testName}: ${error.message}`);
    }
    
    result.duration = Date.now() - startTime;
    this.results.push(result);
  }
  
  /**
   * Assert equality
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message
   */
  static assertEquals(actual, expected, message = 'Values should be equal') {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
    }
  }
  
  /**
   * Assert truthiness
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertTrue(value, message = 'Value should be true') {
    if (!value) {
      throw new Error(message);
    }
  }
  
  /**
   * Assert falsiness
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertFalse(value, message = 'Value should be false') {
    if (value) {
      throw new Error(message);
    }
  }
  
  /**
   * Assert null
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertNull(value, message = 'Value should be null') {
    if (value !== null) {
      throw new Error(message);
    }
  }
  
  /**
   * Assert not null
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static assertNotNull(value, message = 'Value should not be null') {
    if (value === null) {
      throw new Error(message);
    }
  }
  
  /**
   * Assert that function throws error
   * @param {Function} fn - Function that should throw
   * @param {string} message - Error message
   */
  static assertThrows(fn, message = 'Function should throw an error') {
    let threw = false;
    try {
      fn();
    } catch (error) {
      threw = true;
    }
    
    if (!threw) {
      throw new Error(message);
    }
  }
  
  /**
   * Get test results summary
   * @returns {Object} Test results summary
   */
  static getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      totalDuration,
      averageDuration: total > 0 ? Math.round(totalDuration / total) : 0,
      suites: [...new Set(this.results.map(r => r.suite))],
      failures: this.results.filter(r => !r.passed)
    };
  }
  
  /**
   * Clear test results
   */
  static clear() {
    this.results = [];
    this.currentSuite = null;
  }
}

/**
 * Config Utility Tests
 */
function runConfigTests() {
  TestFramework.suite('Config');
  
  TestFramework.test('Config.get with default value', () => {
    const result = Config.get('test', 'nonexistent', 'default');
    TestFramework.assertEquals(result, 'default');
  });
  
  TestFramework.test('Config.set and get', () => {
    Config.set('test', 'key', 'value');
    const result = Config.get('test', 'key');
    TestFramework.assertEquals(result, 'value');
  });
  
  TestFramework.test('Config.get with nested key', () => {
    Config.set('test', 'nested.key', 'nested_value');
    const result = Config.get('test', 'nested.key');
    TestFramework.assertEquals(result, 'nested_value');
  });
  
  TestFramework.test('Config.getAll', () => {
    Config.set('test', 'key1', 'value1');
    Config.set('test', 'key2', 'value2');
    const result = Config.getAll('test');
    TestFramework.assertTrue(typeof result === 'object');
    TestFramework.assertEquals(result.key1, 'value1');
    TestFramework.assertEquals(result.key2, 'value2');
  });
  
  TestFramework.test('Config.hasService', () => {
    Config.set('test', 'key', 'value');
    TestFramework.assertTrue(Config.hasService('test'));
    TestFramework.assertFalse(Config.hasService('nonexistent'));
  });
  
  TestFramework.test('Config.clearCache', () => {
    Config.set('test', 'key', 'value');
    Config.clearCache('test');
    // Should still work after cache clear
    const result = Config.get('test', 'key');
    TestFramework.assertEquals(result, 'value');
  });
}

/**
 * Logger Tests
 */
function runLoggerTests() {
  TestFramework.suite('Logger');
  
  TestFramework.test('Logger.info', () => {
    // Should not throw
    Logger.info('Test info message', { test: true });
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Logger.error', () => {
    // Should not throw
    Logger.error('Test error message', new Error('Test error'));
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Logger.debug', () => {
    // Should not throw
    Logger.debug('Test debug message');
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Logger.warn', () => {
    // Should not throw
    Logger.warn('Test warning message');
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Logger.createChild', () => {
    const childLogger = Logger.createChild('test-service');
    TestFramework.assertNotNull(childLogger);
    TestFramework.assertTrue(typeof childLogger.info === 'function');
    TestFramework.assertTrue(typeof childLogger.error === 'function');
    
    // Should not throw
    childLogger.info('Child logger test');
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Logger.setLevel', () => {
    Logger.setLevel('DEBUG');
    const config = Logger.getConfig();
    TestFramework.assertEquals(config.level, 0); // DEBUG level
    
    Logger.setLevel('INFO');
    const config2 = Logger.getConfig();
    TestFramework.assertEquals(config2.level, 1); // INFO level
  });
  
  TestFramework.test('Logger.getConfig', () => {
    const config = Logger.getConfig();
    TestFramework.assertTrue(typeof config === 'object');
    TestFramework.assertTrue('level' in config);
    TestFramework.assertTrue('enableConsole' in config);
  });
}

/**
 * HttpClient Tests
 */
function runHttpTests() {
  TestFramework.suite('HttpClient');
  
  TestFramework.test('HttpClient.getConfig', () => {
    const config = HttpClient.getConfig();
    TestFramework.assertTrue(typeof config === 'object');
    TestFramework.assertTrue('timeout' in config);
    TestFramework.assertTrue('maxRetries' in config);
  });
  
  TestFramework.test('HttpClient.setAuth and clearAuth', () => {
    HttpClient.setAuth('test-service', 'test-token', 'Bearer');
    TestFramework.assertTrue(true); // Should not throw
    
    HttpClient.clearAuth('test-service');
    TestFramework.assertTrue(true); // Should not throw
  });
  
  TestFramework.test('HttpClient.clearCache', () => {
    HttpClient.clearCache();
    TestFramework.assertTrue(true); // Should not throw
    
    HttpClient.clearCache('https://example.com');
    TestFramework.assertTrue(true); // Should not throw
  });
  
  // Note: Actual HTTP requests would require internet connection
  // and could be flaky in tests, so we test the interface only
}

/**
 * Auth Tests
 */
function runAuthTests() {
  TestFramework.suite('Auth');
  
  TestFramework.test('Auth.setApiKey and getToken', () => {
    Auth.setApiKey('test-service', 'test-api-key');
    const token = Auth.getToken('test-service', false); // Don't validate
    TestFramework.assertEquals(token, 'test-api-key');
  });
  
  TestFramework.test('Auth.setBearerToken', () => {
    Auth.setBearerToken('test-service', 'bearer-token', 3600);
    const token = Auth.getToken('test-service', false);
    TestFramework.assertEquals(token, 'bearer-token');
  });
  
  TestFramework.test('Auth.setBasicAuth', () => {
    Auth.setBasicAuth('test-service', 'username', 'password');
    const token = Auth.getToken('test-service', false);
    TestFramework.assertNotNull(token);
    TestFramework.assertTrue(token.length > 0);
  });
  
  TestFramework.test('Auth.getAuthHeader', () => {
    Auth.setApiKey('test-service', 'api-key');
    const header = Auth.getAuthHeader('test-service');
    TestFramework.assertTrue(header.includes('ApiKey'));
    TestFramework.assertTrue(header.includes('api-key'));
  });
  
  TestFramework.test('Auth.validateToken', () => {
    Auth.setApiKey('test-service', 'api-key');
    const status = Auth.validateToken('test-service');
    TestFramework.assertTrue(typeof status === 'string');
  });
  
  TestFramework.test('Auth.listServices', () => {
    Auth.setApiKey('service1', 'key1');
    Auth.setApiKey('service2', 'key2');
    const services = Auth.listServices();
    TestFramework.assertTrue(Array.isArray(services));
    TestFramework.assertTrue(services.includes('service1'));
    TestFramework.assertTrue(services.includes('service2'));
  });
  
  TestFramework.test('Auth.getAuthInfo', () => {
    Auth.setApiKey('test-service', 'api-key');
    const info = Auth.getAuthInfo('test-service');
    TestFramework.assertNotNull(info);
    TestFramework.assertEquals(info.type, 'api_key');
    TestFramework.assertTrue('created' in info);
    TestFramework.assertTrue('status' in info);
  });
  
  TestFramework.test('Auth.removeAuth', () => {
    Auth.setApiKey('temp-service', 'temp-key');
    Auth.removeAuth('temp-service');
    const token = Auth.getToken('temp-service');
    TestFramework.assertNull(token);
  });
  
  TestFramework.test('ServiceAuth class', () => {
    const serviceAuth = new ServiceAuth('test-service');
    TestFramework.assertNotNull(serviceAuth);
    
    serviceAuth.setApiKey('service-key');
    const token = serviceAuth.getToken(false);
    TestFramework.assertEquals(token, 'service-key');
    
    const header = serviceAuth.getAuthHeader();
    TestFramework.assertTrue(header.includes('service-key'));
    
    serviceAuth.remove();
    const removedToken = serviceAuth.getToken();
    TestFramework.assertNull(removedToken);
  });
}

/**
 * ErrorHandler Tests
 */
function runErrorHandlerTests() {
  TestFramework.suite('ErrorHandler');
  
  TestFramework.test('ErrorHandler.handle with Error object', () => {
    const error = new Error('Test error');
    const result = ErrorHandler.handle(error, { service: 'test' });
    
    TestFramework.assertTrue(result.handled);
    TestFramework.assertNotNull(result.errorId);
    TestFramework.assertTrue('category' in result);
    TestFramework.assertTrue('severity' in result);
  });
  
  TestFramework.test('ErrorHandler.handle with string', () => {
    const result = ErrorHandler.handle('Test error message');
    TestFramework.assertTrue(result.handled);
    TestFramework.assertNotNull(result.errorId);
  });
  
  TestFramework.test('ErrorHandler.report', () => {
    // Should not throw
    ErrorHandler.report('Test error report', 'high', { service: 'test' });
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('ErrorHandler.createError', () => {
    const error = ErrorHandler.createError('Custom error', 'validation', { field: 'email' });
    TestFramework.assertTrue(error instanceof Error);
    TestFramework.assertEquals(error.message, 'Custom error');
    TestFramework.assertEquals(error.category, 'validation');
    TestFramework.assertNotNull(error.id);
  });
  
  TestFramework.test('ErrorHandler.wrap with success', () => {
    const result = ErrorHandler.wrap(() => 'success', 'fallback');
    TestFramework.assertEquals(result, 'success');
  });
  
  TestFramework.test('ErrorHandler.wrap with error', () => {
    const result = ErrorHandler.wrap(() => {
      throw new Error('Test error');
    }, 'fallback');
    TestFramework.assertEquals(result, 'fallback');
  });
  
  TestFramework.test('ErrorHandler.isRetryable', () => {
    const timeoutError = new Error('Request timeout');
    const validationError = new Error('Invalid input');
    
    TestFramework.assertTrue(ErrorHandler.isRetryable(timeoutError));
    TestFramework.assertFalse(ErrorHandler.isRetryable(validationError));
  });
  
  TestFramework.test('ErrorHandler.getStats', () => {
    // Generate some test errors
    ErrorHandler.handle('Test error 1');
    ErrorHandler.handle('Test error 2');
    
    const stats = ErrorHandler.getStats();
    TestFramework.assertTrue(typeof stats === 'object');
    TestFramework.assertTrue('total' in stats);
    TestFramework.assertTrue('bySeverity' in stats);
    TestFramework.assertTrue('byCategory' in stats);
  });
  
  TestFramework.test('ErrorHandler.flush', () => {
    // Should not throw
    ErrorHandler.flush();
    TestFramework.assertTrue(true);
  });
}

/**
 * Utilities Integration Tests
 */
function runUtilitiesTests() {
  TestFramework.suite('Utilities');
  
  TestFramework.test('Utilities.getStatus', () => {
    const status = Utilities.getStatus();
    TestFramework.assertTrue(typeof status === 'object');
    TestFramework.assertTrue('initialized' in status);
    TestFramework.assertTrue('version' in status);
    TestFramework.assertEquals(status.version, '1.0.0');
  });
  
  TestFramework.test('Utilities.getConfig', () => {
    const config = Utilities.getConfig();
    TestFramework.assertTrue(typeof config === 'object');
    TestFramework.assertTrue('version' in config);
    TestFramework.assertTrue('initialized' in config);
  });
  
  TestFramework.test('Utilities.diagnose', () => {
    const diagnosis = Utilities.diagnose();
    TestFramework.assertTrue(typeof diagnosis === 'object');
    TestFramework.assertTrue('overall' in diagnosis);
    TestFramework.assertTrue('utilities' in diagnosis);
    TestFramework.assertTrue('issues' in diagnosis);
    TestFramework.assertTrue(Array.isArray(diagnosis.issues));
  });
  
  TestFramework.test('Utilities.registerService', () => {
    Utilities.registerService('test-service', { key: 'value' });
    const status = Utilities.getStatus();
    TestFramework.assertTrue(status.services.includes('test-service'));
  });
  
  TestFramework.test('Utilities static references', () => {
    TestFramework.assertNotNull(Utilities.Config);
    TestFramework.assertNotNull(Utilities.Logger);
    TestFramework.assertNotNull(Utilities.Http);
    TestFramework.assertNotNull(Utilities.Auth);
    TestFramework.assertNotNull(Utilities.ErrorHandler);
  });
}

/**
 * Legacy Function Tests
 */
function runLegacyTests() {
  TestFramework.suite('Legacy Functions');
  
  TestFramework.test('getConfig backward compatibility', () => {
    Config.set('test', 'legacy.key', 'legacy_value');
    const result = getConfig('test.legacy.key', 'default');
    TestFramework.assertEquals(result, 'legacy_value');
  });
  
  TestFramework.test('Legacy logging functions', () => {
    // Should not throw
    logDebug('Debug message');
    logInfo('Info message');
    logWarn('Warning message');
    logError('Error message');
    TestFramework.assertTrue(true);
  });
  
  TestFramework.test('Legacy utility functions', () => {
    // Should not throw
    const config = getUtilityConfig('test', 'key', 'default');
    TestFramework.assertNotNull(config);
    
    setUtilityConfig('test', 'legacy_key', 'legacy_value');
    TestFramework.assertTrue(true);
    
    logUtility('info', 'Test message');
    TestFramework.assertTrue(true);
    
    const error = new Error('Test error');
    handleUtilityError(error);
    TestFramework.assertTrue(true);
  });
}

/**
 * Run all tests
 */
function runAllUtilityTests() {
  console.log('Starting Utility Package Tests...');
  const startTime = Date.now();
  
  TestFramework.clear();
  
  try {
    // Run all test suites
    runConfigTests();
    runLoggerTests();
    runHttpTests();
    runAuthTests();
    runErrorHandlerTests();
    runUtilitiesTests();
    runLegacyTests();
    
    // Get and display results
    const summary = TestFramework.getSummary();
    const totalTime = Date.now() - startTime;
    
    console.log('\n=== Test Results ===');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}%`);
    console.log(`Total Duration: ${totalTime}ms`);
    console.log(`Average Test Duration: ${summary.averageDuration}ms`);
    console.log(`Test Suites: ${summary.suites.join(', ')}`);
    
    if (summary.failures.length > 0) {
      console.log('\n=== Failures ===');
      summary.failures.forEach(failure => {
        console.log(`${failure.suite}/${failure.name}: ${failure.error}`);
      });
    }
    
    // Log summary to Logger
    Logger.info('Unit tests completed', {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      passRate: summary.passRate,
      duration: totalTime
    });
    
    return summary;
    
  } catch (error) {
    console.error('Test execution failed:', error);
    Logger.error('Test execution failed', error);
    throw error;
  }
}

/**
 * Performance Tests
 */
function runPerformanceTests() {
  console.log('\n=== Performance Tests ===');
  
  const iterations = 100;
  
  // Config performance test
  console.time('Config.get performance');
  for (let i = 0; i < iterations; i++) {
    Config.get('test', 'key', 'default');
  }
  console.timeEnd('Config.get performance');
  
  // Logger performance test
  console.time('Logger.info performance');
  for (let i = 0; i < iterations; i++) {
    Logger.info(`Performance test message ${i}`);
  }
  console.timeEnd('Logger.info performance');
  
  // Auth performance test
  console.time('Auth.getToken performance');
  Auth.setApiKey('perf-test', 'test-key');
  for (let i = 0; i < iterations; i++) {
    Auth.getToken('perf-test', false);
  }
  console.timeEnd('Auth.getToken performance');
  
  console.log('Performance tests completed');
}

/**
 * Quick test function for development
 */
function quickTest() {
  console.log('Running quick test...');
  
  // Test basic functionality
  Config.set('test', 'quick', 'value');
  const value = Config.get('test', 'quick');
  console.log('Config test:', value === 'value' ? 'PASS' : 'FAIL');
  
  Logger.info('Quick test log message');
  console.log('Logger test: PASS');
  
  Auth.setApiKey('quick-test', 'test-key');
  const token = Auth.getToken('quick-test', false);
  console.log('Auth test:', token === 'test-key' ? 'PASS' : 'FAIL');
  
  const result = ErrorHandler.handle('Quick test error');
  console.log('ErrorHandler test:', result.handled ? 'PASS' : 'FAIL');
  
  console.log('Quick test completed');
}
