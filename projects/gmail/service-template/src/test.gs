/**
 * @fileoverview Testing framework and helpers for Google Apps Script
 * @author [Your Name] <[your.email@domain.com]>
 * @version 1.0.0
 * @since [YYYY-MM-DD]
 * @lastmodified [YYYY-MM-DD]
 */

/**
 * Simple testing framework for Google Apps Script
 */
class TestFramework {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: []
    };
  }
  
  /**
   * Add a test case
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  /**
   * Run all tests
   * @returns {Object} Test results
   */
  run() {
    console.log('Starting test run...');
    console.log('='.repeat(50));
    
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      errors: []
    };
    
    for (const test of this.tests) {
      this.results.total++;
      
      try {
        console.log(`Running: ${test.name}`);
        test.testFn();
        this.results.passed++;
        console.log(`✅ PASS: ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          test: test.name,
          error: error.message,
          stack: error.stack
        });
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    this._printSummary();
    return this.results;
  }
  
  /**
   * Print test summary
   * @private
   */
  _printSummary() {
    console.log('='.repeat(50));
    console.log('Test Summary:');
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\nFailures:');
      this.results.errors.forEach(error => {
        console.log(`- ${error.test}: ${error.error}`);
      });
    }
    
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\nSuccess Rate: ${passRate}%`);
  }
}

/**
 * Assertion utilities for testing
 */
class Assert {
  /**
   * Assert that a value is true
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isTrue(value, message = 'Expected value to be true') {
    if (value !== true) {
      throw new Error(`${message}. Got: ${value}`);
    }
  }
  
  /**
   * Assert that a value is false
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isFalse(value, message = 'Expected value to be false') {
    if (value !== false) {
      throw new Error(`${message}. Got: ${value}`);
    }
  }
  
  /**
   * Assert that two values are equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message
   */
  static equals(actual, expected, message = 'Values are not equal') {
    if (actual !== expected) {
      throw new Error(`${message}. Expected: ${expected}, Got: ${actual}`);
    }
  }
  
  /**
   * Assert that two values are not equal
   * @param {*} actual - Actual value
   * @param {*} notExpected - Value that should not match
   * @param {string} message - Error message
   */
  static notEquals(actual, notExpected, message = 'Values should not be equal') {
    if (actual === notExpected) {
      throw new Error(`${message}. Both values are: ${actual}`);
    }
  }
  
  /**
   * Assert that a value is null
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isNull(value, message = 'Expected value to be null') {
    if (value !== null) {
      throw new Error(`${message}. Got: ${value}`);
    }
  }
  
  /**
   * Assert that a value is not null
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isNotNull(value, message = 'Expected value to not be null') {
    if (value === null) {
      throw new Error(`${message}. Got null`);
    }
  }
  
  /**
   * Assert that a value is undefined
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isUndefined(value, message = 'Expected value to be undefined') {
    if (value !== undefined) {
      throw new Error(`${message}. Got: ${value}`);
    }
  }
  
  /**
   * Assert that a value is defined (not undefined)
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  static isDefined(value, message = 'Expected value to be defined') {
    if (value === undefined) {
      throw new Error(`${message}. Got undefined`);
    }
  }
  
  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function to test
   * @param {string} message - Error message
   */
  static throws(fn, message = 'Expected function to throw an error') {
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
   * Assert that a function does not throw an error
   * @param {Function} fn - Function to test
   * @param {string} message - Error message
   */
  static doesNotThrow(fn, message = 'Expected function to not throw an error') {
    try {
      fn();
    } catch (error) {
      throw new Error(`${message}. Threw: ${error.message}`);
    }
  }
  
  /**
   * Assert that an array contains a value
   * @param {Array} array - Array to check
   * @param {*} value - Value to find
   * @param {string} message - Error message
   */
  static contains(array, value, message = 'Array does not contain expected value') {
    if (!Array.isArray(array)) {
      throw new Error('First argument must be an array');
    }
    
    if (!array.includes(value)) {
      throw new Error(`${message}. Array: [${array.join(', ')}], Looking for: ${value}`);
    }
  }
  
  /**
   * Assert that a value matches a regular expression
   * @param {string} value - Value to test
   * @param {RegExp} regex - Regular expression
   * @param {string} message - Error message
   */
  static matches(value, regex, message = 'Value does not match pattern') {
    if (!regex.test(value)) {
      throw new Error(`${message}. Value: '${value}', Pattern: ${regex}`);
    }
  }
}

/**
 * Mock utilities for testing
 */
class MockUtils {
  /**
   * Create a mock function that tracks calls
   * @param {*} returnValue - Value to return when called
   * @returns {Function} Mock function
   */
  static createMock(returnValue = undefined) {
    const mock = function(...args) {
      mock.calls.push(args);
      mock.callCount++;
      return returnValue;
    };
    
    mock.calls = [];
    mock.callCount = 0;
    mock.reset = function() {
      this.calls = [];
      this.callCount = 0;
    };
    
    return mock;
  }
  
  /**
   * Create a mock object with specified methods
   * @param {Object} methods - Methods to mock with their return values
   * @returns {Object} Mock object
   */
  static createMockObject(methods = {}) {
    const mock = {};
    
    for (const [methodName, returnValue] of Object.entries(methods)) {
      mock[methodName] = this.createMock(returnValue);
    }
    
    return mock;
  }
}

/**
 * Test data generators
 */
class TestData {
  /**
   * Generate random email address
   * @returns {string} Random email
   */
  static randomEmail() {
    const name = StringUtils.random(8, 'abcdefghijklmnopqrstuvwxyz');
    const domain = StringUtils.random(5, 'abcdefghijklmnopqrstuvwxyz');
    return `${name}@${domain}.com`;
  }
  
  /**
   * Generate random date within a range
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Date} Random date
   */
  static randomDate(start = new Date(2020, 0, 1), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  
  /**
   * Generate test user object
   * @returns {Object} Test user
   */
  static testUser() {
    return {
      id: StringUtils.random(10),
      name: `Test User ${Math.floor(Math.random() * 1000)}`,
      email: this.randomEmail(),
      created: this.randomDate(),
      active: Math.random() > 0.5
    };
  }
}

// Global test runner instance
const testRunner = new TestFramework();

/**
 * Main test runner function - call this to run all tests
 */
function runTests() {
  // Add your test cases here
  runUtilityTests();
  runConfigTests();
  
  // Run all tests
  return testRunner.run();
}

/**
 * Test utility functions
 */
function runUtilityTests() {
  testRunner.test('StringUtils.isEmpty - empty string', () => {
    Assert.isTrue(StringUtils.isEmpty(''));
    Assert.isTrue(StringUtils.isEmpty('   '));
    Assert.isTrue(StringUtils.isEmpty(null));
    Assert.isFalse(StringUtils.isEmpty('hello'));
  });
  
  testRunner.test('StringUtils.truncate', () => {
    Assert.equals(StringUtils.truncate('hello world', 5), 'he...');
    Assert.equals(StringUtils.truncate('hi', 10), 'hi');
  });
  
  testRunner.test('ArrayUtils.chunk', () => {
    const result = ArrayUtils.chunk([1, 2, 3, 4, 5], 2);
    Assert.equals(result.length, 3);
    Assert.equals(result[0].length, 2);
    Assert.equals(result[2].length, 1);
  });
  
  testRunner.test('ValidationUtils.isValidEmail', () => {
    Assert.isTrue(ValidationUtils.isValidEmail('test@example.com'));
    Assert.isFalse(ValidationUtils.isValidEmail('invalid-email'));
    Assert.isFalse(ValidationUtils.isValidEmail('test@'));
  });
}

/**
 * Test configuration functions
 */
function runConfigTests() {
  testRunner.test('getConfig - existing key', () => {
    const serviceName = getConfig('SERVICE_NAME');
    Assert.isDefined(serviceName);
  });
  
  testRunner.test('getConfig - non-existing key with default', () => {
    const result = getConfig('NON_EXISTING_KEY', 'default');
    Assert.equals(result, 'default');
  });
  
  testRunner.test('isDevelopment', () => {
    Assert.isDefined(isDevelopment());
    Assert.equals(typeof isDevelopment(), 'boolean');
  });
}

/**
 * Manual test runner for specific test suites
 * @param {string} suiteName - Name of the test suite to run
 */
function runTestSuite(suiteName) {
  const newRunner = new TestFramework();
  
  switch (suiteName) {
    case 'utilities':
      runUtilityTests.call({ testRunner: newRunner });
      break;
    case 'config':
      runConfigTests.call({ testRunner: newRunner });
      break;
    default:
      console.log(`Unknown test suite: ${suiteName}`);
      return;
  }
  
  return newRunner.run();
}
