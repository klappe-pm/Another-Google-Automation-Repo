/**
 * Common Library - Test Suite
 * 
 * Purpose: Comprehensive testing for all library modules
 * Service: Shared Library Testing
 * Created: 2025-08-06
 * 
 * Run tests with: runAllTests()
 * Run specific module tests with: testUtils(), testErrorHandler(), etc.
 */

/**
 * Main test runner - executes all test suites
 * @return {Object} Test results summary
 */
function runAllTests() {
  console.log('🧪 Starting Common Library Test Suite...\n');
  
  const startTime = new Date().getTime();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    duration: 0,
    modules: {}
  };
  
  // Test each module
  const modules = [
    { name: 'Utils', test: testUtils },
    { name: 'ErrorHandler', test: testErrorHandler },
    { name: 'Logger', test: testLogger },
    { name: 'DataProcessor', test: testDataProcessor }
  ];
  
  modules.forEach(module => {
    console.log(`\nTesting ${module.name} module...`);
    const moduleResult = module.test();
    results.modules[module.name] = moduleResult;
    results.total += moduleResult.total;
    results.passed += moduleResult.passed;
    results.failed += moduleResult.failed;
    if (moduleResult.errors.length > 0) {
      results.errors.push(...moduleResult.errors);
    }
  });
  
  results.duration = new Date().getTime() - startTime;
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️ Duration: ${results.duration}ms`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  return results;
}

/**
 * Test Utils module
 * @return {Object} Test results
 */
function testUtils() {
  const results = createTestResults('Utils');
  
  // Test formatDate
  runTest(results, 'formatDate - default format', () => {
    const date = new Date('2025-08-06T10:30:00Z');
    const formatted = formatDate(date, 'date');
    assert(formatted === '2025-08-06', `Expected 2025-08-06, got ${formatted}`);
  });
  
  runTest(results, 'formatDate - filename format', () => {
    const date = new Date('2025-08-06T10:30:00Z');
    const formatted = formatDate(date, 'filename');
    assert(formatted.includes('2025-08-06'), `Filename should contain date: ${formatted}`);
  });
  
  runTest(results, 'formatDate - invalid date', () => {
    try {
      formatDate(new Date('invalid'));
      assert(false, 'Should throw error for invalid date');
    } catch (e) {
      assert(e.message.includes('Invalid date'), 'Should mention invalid date');
    }
  });
  
  // Test validateEmail
  runTest(results, 'validateEmail - valid emails', () => {
    assert(validateEmail('test@example.com') === true, 'Simple email');
    assert(validateEmail('user.name@domain.co.uk') === true, 'Complex email');
    assert(validateEmail('user+tag@example.com') === true, 'Email with plus');
  });
  
  runTest(results, 'validateEmail - invalid emails', () => {
    assert(validateEmail('notanemail') === false, 'No @ symbol');
    assert(validateEmail('@example.com') === false, 'No username');
    assert(validateEmail('user@') === false, 'No domain');
    assert(validateEmail('') === false, 'Empty string');
    assert(validateEmail(null) === false, 'Null value');
  });
  
  // Test sanitizeFileName
  runTest(results, 'sanitizeFileName - removes invalid characters', () => {
    const input = 'file:name/with\\invalid*chars?.txt';
    const output = sanitizeFileName(input);
    assert(!output.includes(':'), 'Should remove colon');
    assert(!output.includes('/'), 'Should remove forward slash');
    assert(!output.includes('\\'), 'Should remove backslash');
    assert(!output.includes('*'), 'Should remove asterisk');
    assert(!output.includes('?'), 'Should remove question mark');
  });
  
  runTest(results, 'sanitizeFileName - handles edge cases', () => {
    assert(sanitizeFileName('') === 'untitled', 'Empty string returns untitled');
    assert(sanitizeFileName(null) === 'untitled', 'Null returns untitled');
    assert(sanitizeFileName('...test...').indexOf('.') !== 0, 'Removes leading dots');
  });
  
  // Test generateId
  runTest(results, 'generateId - uniqueness', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert(id1 !== id2, 'IDs should be unique');
    assert(id1.length > 10, 'ID should have sufficient length');
  });
  
  runTest(results, 'generateId - with prefix', () => {
    const id = generateId('TEST');
    assert(id.startsWith('TEST_'), `Should start with prefix: ${id}`);
  });
  
  // Test chunkArray
  runTest(results, 'chunkArray - basic chunking', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunks = chunkArray(array, 3);
    assert(chunks.length === 4, `Expected 4 chunks, got ${chunks.length}`);
    assert(chunks[0].length === 3, 'First chunk should have 3 items');
    assert(chunks[3].length === 1, 'Last chunk should have 1 item');
  });
  
  // Test deepClone
  runTest(results, 'deepClone - nested objects', () => {
    const original = {
      a: 1,
      b: { c: 2, d: [3, 4] },
      e: new Date('2025-08-06')
    };
    const cloned = deepClone(original);
    
    assert(cloned.a === original.a, 'Primitive values match');
    assert(cloned.b.c === original.b.c, 'Nested values match');
    assert(cloned.b !== original.b, 'Nested objects are different references');
    assert(cloned.e.getTime() === original.e.getTime(), 'Dates are cloned correctly');
  });
  
  // Test isEmpty
  runTest(results, 'isEmpty - various types', () => {
    assert(isEmpty(null) === true, 'null is empty');
    assert(isEmpty(undefined) === true, 'undefined is empty');
    assert(isEmpty('') === true, 'empty string is empty');
    assert(isEmpty('  ') === true, 'whitespace string is empty');
    assert(isEmpty([]) === true, 'empty array is empty');
    assert(isEmpty({}) === true, 'empty object is empty');
    assert(isEmpty('text') === false, 'string with text is not empty');
    assert(isEmpty([1]) === false, 'array with items is not empty');
    assert(isEmpty({a: 1}) === false, 'object with properties is not empty');
  });
  
  return results;
}

/**
 * Test ErrorHandler module
 * @return {Object} Test results
 */
function testErrorHandler() {
  const results = createTestResults('ErrorHandler');
  
  // Test handleError
  runTest(results, 'handleError - basic error handling', () => {
    const error = new Error('Test error');
    const errorInfo = handleError(error, { service: 'test' });
    
    assert(errorInfo.message === 'Test error', 'Error message preserved');
    assert(errorInfo.context.service === 'test', 'Context preserved');
    assert(errorInfo.id, 'Error ID generated');
    assert(errorInfo.timestamp, 'Timestamp added');
  });
  
  // Test error classification
  runTest(results, 'classifyError - error types', () => {
    assert(classifyError(new Error('Invalid input')) === ErrorType.VALIDATION, 'Validation error');
    assert(classifyError(new Error('Unauthorized')) === ErrorType.AUTHENTICATION, 'Auth error');
    assert(classifyError(new Error('Permission denied')) === ErrorType.AUTHORIZATION, 'Permission error');
    assert(classifyError(new Error('Network error')) === ErrorType.NETWORK, 'Network error');
    assert(classifyError(new Error('Timeout exceeded')) === ErrorType.TIMEOUT, 'Timeout error');
  });
  
  // Test withErrorHandling
  runTest(results, 'withErrorHandling - wraps function', () => {
    let called = false;
    const wrapped = withErrorHandling(
      function testFunc(x) {
        called = true;
        if (x === 'error') throw new Error('Test error');
        return x * 2;
      },
      { service: 'test' }
    );
    
    // Test successful execution
    const result = wrapped(5);
    assert(called === true, 'Function was called');
    assert(result === 10, 'Return value preserved');
    
    // Test error handling
    try {
      wrapped('error');
      assert(false, 'Should throw error');
    } catch (e) {
      assert(e.message.includes('Test error'), 'Error message preserved');
      assert(e.errorInfo, 'Error info attached');
    }
  });
  
  // Test withRetry
  runTest(results, 'withRetry - retry logic', () => {
    let attempts = 0;
    const funcWithRetry = () => {
      return withRetry(
        () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Network error');
          }
          return 'success';
        },
        3,  // max retries
        10  // initial delay (short for testing)
      );
    };
    
    const result = funcWithRetry();
    assert(result === 'success', 'Eventually succeeds');
    assert(attempts === 3, `Should try 3 times, tried ${attempts}`);
  });
  
  // Test getUserFriendlyMessage
  runTest(results, 'getUserFriendlyMessage - user messages', () => {
    const validationError = new Error('Invalid email');
    const networkError = new Error('Network connection failed');
    
    const msg1 = getUserFriendlyMessage(validationError);
    assert(msg1.includes('check your input'), 'Validation message');
    
    const msg2 = getUserFriendlyMessage(networkError);
    assert(msg2.includes('Network'), 'Network message');
  });
  
  return results;
}

/**
 * Test Logger module
 * @return {Object} Test results
 */
function testLogger() {
  const results = createTestResults('Logger');
  
  // Test log levels
  runTest(results, 'log levels - filtering', () => {
    // Set log level to WARN
    setLogLevel('WARN');
    
    // These should not throw errors
    logDebug('Debug message');  // Should be filtered
    logInfo('Info message');    // Should be filtered
    logWarn('Warning message');  // Should log
    logError('Error message');   // Should log
    
    assert(true, 'Logging at different levels works');
  });
  
  // Test log entry creation
  runTest(results, 'createLogEntry - structure', () => {
    const entry = createLogEntry('INFO', 'Test message', { custom: 'value' });
    
    assert(entry.level === 'INFO', 'Level set correctly');
    assert(entry.message === 'Test message', 'Message preserved');
    assert(entry.timestamp, 'Timestamp added');
    assert(entry.context.custom === 'value', 'Custom context preserved');
  });
  
  // Test createLogger
  runTest(results, 'createLogger - with context', () => {
    const logger = createLogger({ service: 'test-service', module: 'test-module' });
    
    // Logger should have all methods
    assert(typeof logger.debug === 'function', 'Has debug method');
    assert(typeof logger.info === 'function', 'Has info method');
    assert(typeof logger.warn === 'function', 'Has warn method');
    assert(typeof logger.error === 'function', 'Has error method');
    assert(typeof logger.performance === 'function', 'Has performance method');
  });
  
  // Test performance logging
  runTest(results, 'logPerformance - timing', () => {
    const startTime = new Date().getTime() - 1000;  // 1 second ago
    const entry = logPerformance('Test operation', startTime, { test: true });
    
    // Entry should have duration
    assert(entry.context.duration >= 1000, 'Duration calculated');
    assert(entry.context.operation === 'Test operation', 'Operation name preserved');
  });
  
  // Reset log level
  setLogLevel('INFO');
  
  return results;
}

/**
 * Test DataProcessor module
 * @return {Object} Test results
 */
function testDataProcessor() {
  const results = createTestResults('DataProcessor');
  
  // Test processBatches
  runTest(results, 'processBatches - basic processing', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = processBatches(
      items,
      (batch) => batch.map(x => x * 2),
      { batchSize: 3 }
    );
    
    assert(result.complete === true, 'Processing completed');
    assert(result.results.length === 10, 'All items processed');
    assert(result.results[0] === 2, 'First item doubled');
    assert(result.results[9] === 20, 'Last item doubled');
    assert(result.processedCount === 10, 'Count is correct');
  });
  
  // Test timeout detection
  runTest(results, 'isTimeoutApproaching - timeout detection', () => {
    const startTime = new Date().getTime();
    
    // Should not be approaching immediately
    assert(isTimeoutApproaching(startTime, 60000, 5000) === false, 'Not approaching at start');
    
    // Simulate time passing (adjust start time)
    const nearTimeout = startTime - 55001;  // 55 seconds ago
    assert(isTimeoutApproaching(nearTimeout, 60000, 5000) === true, 'Approaching after 55s with 5s buffer');
  });
  
  // Test batch processing with errors
  runTest(results, 'processBatches - error handling', () => {
    const items = [1, 2, 3, 4, 5];
    const result = processBatches(
      items,
      (batch, batchNum) => {
        if (batchNum === 2) {
          throw new Error('Batch 2 failed');
        }
        return batch;
      },
      { batchSize: 2, stopOnError: false }
    );
    
    assert(result.complete === true, 'Processing completed despite error');
    assert(result.errors.length === 1, 'One error recorded');
    assert(result.errors[0].batch === 2, 'Error in correct batch');
  });
  
  // Test checkpoint creation
  runTest(results, 'checkpoint - creation and storage', () => {
    const checkpoint = createCheckpoint(50, ['result1', 'result2'], []);
    
    assert(checkpoint.lastIndex === 50, 'Last index saved');
    assert(checkpoint.resultCount === 2, 'Result count saved');
    assert(checkpoint.errorCount === 0, 'Error count saved');
    assert(checkpoint.id, 'Checkpoint ID generated');
    assert(checkpoint.timestamp, 'Timestamp added');
  });
  
  // Test optimal batch size calculation
  runTest(results, 'calculateOptimalBatchSize - calculation', () => {
    // 1000 items, 100ms per item, 5 minutes max
    const batchSize = calculateOptimalBatchSize(1000, 100, 5);
    
    // Should process in safe time (80% of 5 minutes = 240 seconds = 2400 items at 100ms each)
    assert(batchSize > 0, 'Positive batch size');
    assert(batchSize <= 1000, 'Not larger than total items');
    assert(batchSize % 10 === 0, 'Rounded to nearest 10');
  });
  
  // Test rate limiting
  runTest(results, 'processWithRateLimit - rate control', () => {
    const items = [1, 2, 3];
    const startTime = new Date().getTime();
    
    const result = processWithRateLimit(
      items,
      (item) => item * 2,
      { rateLimit: 10 }  // 10 per second = 100ms between items
    );
    
    const duration = new Date().getTime() - startTime;
    
    assert(result.complete === true, 'Processing completed');
    assert(result.results.length === 3, 'All items processed');
    assert(duration >= 200, `Should take at least 200ms, took ${duration}ms`);
  });
  
  return results;
}

// ===== Helper Functions =====

/**
 * Create test results object
 * @param {string} moduleName - Name of module being tested
 * @return {Object} Test results object
 */
function createTestResults(moduleName) {
  return {
    module: moduleName,
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
}

/**
 * Run a single test
 * @param {Object} results - Results object to update
 * @param {string} testName - Name of test
 * @param {Function} testFunc - Test function to run
 */
function runTest(results, testName, testFunc) {
  results.total++;
  
  try {
    testFunc();
    results.passed++;
    console.log(`  ✅ ${testName}`);
  } catch (error) {
    results.failed++;
    results.errors.push(`${testName}: ${error.message || error}`);
    console.log(`  ❌ ${testName}: ${error.message || error}`);
  }
}

/**
 * Assert helper function
 * @param {boolean} condition - Condition to assert
 * @param {string} message - Error message if assertion fails
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}