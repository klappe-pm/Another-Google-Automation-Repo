# Testing Strategy for Google Apps Script Refactoring

## Overview

This document outlines a comprehensive testing strategy to ensure the refactored Google Apps Scripts work correctly and maintain backwards compatibility.

## Testing Levels

### 1. Unit Testing
Test individual functions in isolation using mocked dependencies.

### 2. Integration Testing
Test interactions between different services and components.

### 3. End-to-End Testing
Test complete workflows from start to finish.

### 4. Regression Testing
Ensure existing functionality continues to work after refactoring.

## Testing Framework

### Test Runner Implementation
```javascript
// TestFramework.js
class TestFramework {
  constructor() {
    this.suites = new Map();
    this.results = [];
    this.config = {
      verbose: true,
      stopOnFailure: false,
      timeout: 30000
    };
  }
  
  describe(suiteName, suiteFunction) {
    const suite = new TestSuite(suiteName);
    this.suites.set(suiteName, suite);
    
    // Execute suite definition
    const context = {
      it: (testName, testFn) => suite.addTest(testName, testFn),
      beforeEach: (fn) => suite.beforeEach = fn,
      afterEach: (fn) => suite.afterEach = fn,
      beforeAll: (fn) => suite.beforeAll = fn,
      afterAll: (fn) => suite.afterAll = fn
    };
    
    suiteFunction.call(context, context);
  }
  
  async run(suiteFilter = null) {
    const suitesToRun = suiteFilter 
      ? [this.suites.get(suiteFilter)]
      : Array.from(this.suites.values());
    
    for (const suite of suitesToRun) {
      await this.runSuite(suite);
    }
    
    this.printResults();
    return this.results;
  }
  
  async runSuite(suite) {
    console.log(`\n📦 ${suite.name}`);
    
    if (suite.beforeAll) {
      await suite.beforeAll();
    }
    
    for (const test of suite.tests) {
      await this.runTest(suite, test);
      
      if (this.config.stopOnFailure && test.status === 'FAIL') {
        break;
      }
    }
    
    if (suite.afterAll) {
      await suite.afterAll();
    }
  }
  
  async runTest(suite, test) {
    const result = {
      suite: suite.name,
      test: test.name,
      status: 'PASS',
      duration: 0,
      error: null
    };
    
    const startTime = Date.now();
    
    try {
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      await Promise.race([
        test.fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), this.config.timeout)
        )
      ]);
      
      console.log(`  ✅ ${test.name}`);
      
    } catch (error) {
      result.status = 'FAIL';
      result.error = error;
      console.log(`  ❌ ${test.name}`);
      console.error(`     ${error.message}`);
      
    } finally {
      if (suite.afterEach) {
        await suite.afterEach();
      }
      
      result.duration = Date.now() - startTime;
      this.results.push(result);
    }
  }
  
  printResults() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`Test Results: ${passed} passed, ${failed} failed, ${total} total`);
    console.log('='.repeat(50));
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`\n❌ ${r.suite} > ${r.test}`);
          console.log(`   Error: ${r.error.message}`);
          if (this.config.verbose && r.error.stack) {
            console.log(`   Stack: ${r.error.stack}`);
          }
        });
    }
  }
}

// Assertion Library
class Assert {
  static equals(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, but got ${actual}`
      );
    }
  }
  
  static deepEquals(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        message || `Objects are not equal:\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`
      );
    }
  }
  
  static truthy(value, message = '') {
    if (!value) {
      throw new Error(message || `Expected truthy value, got ${value}`);
    }
  }
  
  static throws(fn, expectedError = null, message = '') {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (error) {
      if (expectedError && error.message !== expectedError) {
        throw new Error(
          `Expected error "${expectedError}", got "${error.message}"`
        );
      }
    }
  }
  
  static async rejects(fn, expectedError = null, message = '') {
    try {
      await fn();
      throw new Error(message || 'Expected function to reject');
    } catch (error) {
      if (expectedError && error.message !== expectedError) {
        throw new Error(
          `Expected error "${expectedError}", got "${error.message}"`
        );
      }
    }
  }
}
```

## Test Categories

### 1. Service Layer Tests

```javascript
// GmailServiceTests.js
describe('GmailService', function() {
  let service;
  let mockGmail;
  
  beforeEach(function() {
    mockGmail = new MockGmailApp();
    service = new GmailService({ batchSize: 10 });
    service.gmail = mockGmail;
  });
  
  it('should search messages with query', async function() {
    // Arrange
    mockGmail.addThread({
      id: 'thread1',
      messages: [{ subject: 'Test Email', from: 'test@example.com' }],
      labels: ['important']
    });
    
    // Act
    const results = await service.searchMessages('label:important');
    
    // Assert
    Assert.equals(results.length, 1);
    Assert.equals(results[0].messages[0].subject, 'Test Email');
  });
  
  it('should handle batch processing', async function() {
    // Arrange
    for (let i = 0; i < 25; i++) {
      mockGmail.addThread({
        id: `thread${i}`,
        messages: [{ subject: `Email ${i}` }]
      });
    }
    
    let processedBatches = 0;
    
    // Act
    await service.processInBatches('is:all', async (batch) => {
      processedBatches++;
      Assert.truthy(batch.length <= 10); // Batch size limit
    });
    
    // Assert
    Assert.equals(processedBatches, 3); // 25 items / 10 batch size
  });
  
  it('should retry on failure', async function() {
    // Arrange
    let attempts = 0;
    service.gmail.search = () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Service unavailable');
      }
      return [];
    };
    
    // Act & Assert
    const results = await service.searchMessages('test');
    Assert.equals(attempts, 3);
  });
});
```

### 2. Workflow Tests

```javascript
// EmailExportWorkflowTests.js
describe('EmailExportWorkflow', function() {
  let workflow;
  let services;
  
  beforeEach(function() {
    services = {
      gmail: new MockGmailService(),
      drive: new MockDriveService(),
      sheets: new MockSheetsService()
    };
    
    workflow = new EmailExportWorkflow(services, {
      formats: ['pdf', 'sheets'],
      batchSize: 5
    });
  });
  
  it('should export emails to multiple formats', async function() {
    // Arrange
    services.gmail.addTestEmails(10);
    
    // Act
    const result = await workflow.execute({
      query: 'label:test',
      destination: 'folder123'
    });
    
    // Assert
    Assert.equals(result.processed, 10);
    Assert.truthy(result.exports.pdf);
    Assert.truthy(result.exports.sheets);
    Assert.equals(result.exports.pdf.files.length, 10);
  });
  
  it('should handle partial failures gracefully', async function() {
    // Arrange
    services.gmail.addTestEmails(5);
    services.drive.failOn(3); // Fail on 3rd file
    
    // Act
    const result = await workflow.execute({
      query: 'label:test',
      destination: 'folder123'
    });
    
    // Assert
    Assert.equals(result.processed, 5);
    Assert.equals(result.succeeded, 4);
    Assert.equals(result.failed, 1);
    Assert.truthy(result.errors.length > 0);
  });
});
```

### 3. Integration Tests

```javascript
// IntegrationTests.js
describe('Integration Tests', function() {
  const TEST_PREFIX = 'TEST_' + Date.now();
  let createdResources = [];
  
  afterAll(async function() {
    // Cleanup all test resources
    for (const resource of createdResources) {
      try {
        await resource.cleanup();
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    }
  });
  
  it('should process real Gmail messages', async function() {
    // Create test label
    const label = GmailApp.createLabel(TEST_PREFIX + '_integration');
    createdResources.push({
      cleanup: () => label.deleteLabel()
    });
    
    // Send test email
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      TEST_PREFIX + ' Test Subject',
      'Test body',
      { labels: [label] }
    );
    
    // Wait for email to arrive
    await Utilities.sleep(2000);
    
    // Run workflow
    const workflow = new EmailExportWorkflow(
      ServiceFactory.createAll(),
      { formats: ['sheets'] }
    );
    
    const result = await workflow.execute({
      query: `label:${label.getName()}`,
      destination: TEST_PREFIX + '_export'
    });
    
    // Verify
    Assert.truthy(result.processed >= 1);
    Assert.truthy(result.exports.sheets);
    
    // Verify sheet was created
    const files = DriveApp.searchFiles(
      `title contains "${TEST_PREFIX}" and mimeType = "application/vnd.google-apps.spreadsheet"`
    );
    Assert.truthy(files.hasNext());
    
    // Add to cleanup
    while (files.hasNext()) {
      const file = files.next();
      createdResources.push({
        cleanup: () => file.setTrashed(true)
      });
    }
  });
});
```

### 4. Regression Tests

```javascript
// RegressionTests.js
describe('Regression Tests', function() {
  it('should maintain compatibility with legacy function signatures', function() {
    // Old function signature
    const legacyResult = exportGmailToPDF('label:important', 50);
    
    // New function signature
    const newResult = new EmailExportWorkflow().execute({
      query: 'label:important',
      limit: 50,
      format: 'pdf'
    });
    
    // Results should be equivalent
    Assert.equals(legacyResult.count, newResult.processed);
    Assert.equals(legacyResult.folder, newResult.exports.pdf.folder);
  });
  
  it('should handle old configuration format', function() {
    // Old config
    const oldConfig = {
      searchQuery: 'is:unread',
      maxResults: 100,
      exportFolder: 'My Exports'
    };
    
    // Config adapter should convert
    const newConfig = ConfigAdapter.fromLegacy(oldConfig);
    
    Assert.equals(newConfig.query, oldConfig.searchQuery);
    Assert.equals(newConfig.limit, oldConfig.maxResults);
    Assert.equals(newConfig.destination, oldConfig.exportFolder);
  });
});
```

## Mock Implementations

```javascript
// Mocks.js
class MockGmailApp {
  constructor() {
    this.threads = [];
    this.labels = new Map();
    this.sentEmails = [];
  }
  
  search(query, start = 0, max = 100) {
    let results = this.threads;
    
    // Simple query parsing
    if (query.includes('label:')) {
      const label = query.match(/label:(\S+)/)[1];
      results = results.filter(t => t.labels.includes(label));
    }
    
    return results.slice(start, start + max);
  }
  
  getUserLabelByName(name) {
    return this.labels.get(name) || null;
  }
  
  createLabel(name) {
    const label = new MockLabel(name);
    this.labels.set(name, label);
    return label;
  }
  
  sendEmail(to, subject, body, options = {}) {
    this.sentEmails.push({ to, subject, body, options });
  }
  
  addThread(threadData) {
    this.threads.push(new MockThread(threadData));
  }
}

class MockThread {
  constructor(data) {
    this.id = data.id;
    this.messages = data.messages || [];
    this.labels = data.labels || [];
  }
  
  getMessages() {
    return this.messages.map(m => new MockMessage(m));
  }
  
  getLabels() {
    return this.labels.map(l => new MockLabel(l));
  }
}

class MockMessage {
  constructor(data) {
    Object.assign(this, data);
  }
  
  getFrom() { return this.from || 'test@example.com'; }
  getSubject() { return this.subject || 'Test Subject'; }
  getDate() { return this.date || new Date(); }
  getBody() { return this.body || 'Test body'; }
  getPlainBody() { return this.plainBody || this.body || 'Test body'; }
  getTo() { return this.to || 'recipient@example.com'; }
}
```

## Test Data Management

```javascript
// TestDataFactory.js
class TestDataFactory {
  static createEmails(count, template = {}) {
    const emails = [];
    
    for (let i = 0; i < count; i++) {
      emails.push({
        id: `msg_${i}`,
        subject: template.subject || `Test Email ${i}`,
        from: template.from || `sender${i}@example.com`,
        to: template.to || 'recipient@example.com',
        date: new Date(Date.now() - i * 3600000), // 1 hour apart
        body: template.body || `This is test email number ${i}`,
        labels: template.labels || ['test'],
        ...template
      });
    }
    
    return emails;
  }
  
  static createFolderStructure() {
    return {
      'Test Exports': {
        'PDFs': {},
        'Sheets': {},
        'Archives': {
          '2024': {},
          '2025': {}
        }
      }
    };
  }
  
  static createSpreadsheetData(rows, cols) {
    const data = [];
    
    // Headers
    const headers = [];
    for (let c = 0; c < cols; c++) {
      headers.push(`Column ${String.fromCharCode(65 + c)}`);
    }
    data.push(headers);
    
    // Data rows
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(`R${r}C${c}`);
      }
      data.push(row);
    }
    
    return data;
  }
}
```

## Performance Testing

```javascript
// PerformanceTests.js
describe('Performance Tests', function() {
  it('should process 1000 emails in under 5 minutes', async function() {
    const service = new GmailService();
    const mockGmail = new MockGmailApp();
    
    // Create test data
    const emails = TestDataFactory.createEmails(1000);
    emails.forEach(e => mockGmail.addThread({ messages: [e] }));
    service.gmail = mockGmail;
    
    const startTime = Date.now();
    let processed = 0;
    
    await service.processInBatches('is:all', async (batch) => {
      processed += batch.length;
    }, { batchSize: 50 });
    
    const duration = Date.now() - startTime;
    
    Assert.equals(processed, 1000);
    Assert.truthy(duration < 300000, `Took ${duration}ms, should be under 300000ms`);
    
    console.log(`Performance: Processed 1000 emails in ${duration}ms`);
  });
  
  it('should handle concurrent operations efficiently', async function() {
    const operations = [];
    
    // Launch 10 concurrent operations
    for (let i = 0; i < 10; i++) {
      operations.push(
        processEmailBatch(`batch${i}`, 100)
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(operations);
    const duration = Date.now() - startTime;
    
    // Should complete faster than sequential
    const expectedSequential = 10 * 1000; // 10 operations * 1s each
    Assert.truthy(duration < expectedSequential / 2);
    
    console.log(`Concurrent operations completed in ${duration}ms`);
  });
});
```

## Continuous Testing

```javascript
// ContinuousTestRunner.js
function runDailyTests() {
  const runner = new TestFramework();
  
  // Register all test suites
  require('./tests/unit/**/*.js');
  require('./tests/integration/**/*.js');
  
  // Run tests
  const results = runner.run();
  
  // Send report
  const report = TestReporter.generate(results);
  
  if (report.failed > 0) {
    MailApp.sendEmail({
      to: Config.get('TEST_REPORT_EMAIL'),
      subject: `❌ Daily Tests Failed: ${report.failed} failures`,
      htmlBody: report.html
    });
  } else {
    console.log('✅ All daily tests passed');
  }
  
  // Store results
  TestHistory.save(results);
}

// Schedule daily test runs
function setupTestSchedule() {
  ScriptApp.newTrigger('runDailyTests')
    .timeBased()
    .everyDays(1)
    .atHour(2) // Run at 2 AM
    .create();
}
```

## Test Coverage Report

```javascript
// CoverageReporter.js
class CoverageReporter {
  static analyze(sourceFiles, testFiles) {
    const coverage = {
      files: {},
      summary: {
        total: 0,
        covered: 0,
        percentage: 0
      }
    };
    
    // Analyze each source file
    sourceFiles.forEach(file => {
      const functions = this.extractFunctions(file);
      const tested = this.findTestedFunctions(functions, testFiles);
      
      coverage.files[file.name] = {
        total: functions.length,
        tested: tested.length,
        untested: functions.filter(f => !tested.includes(f)),
        percentage: (tested.length / functions.length) * 100
      };
      
      coverage.summary.total += functions.length;
      coverage.summary.covered += tested.length;
    });
    
    coverage.summary.percentage = 
      (coverage.summary.covered / coverage.summary.total) * 100;
    
    return coverage;
  }
  
  static generateReport(coverage) {
    let report = 'Test Coverage Report\n';
    report += '===================\n\n';
    
    report += `Overall Coverage: ${coverage.summary.percentage.toFixed(2)}%\n`;
    report += `Functions Tested: ${coverage.summary.covered}/${coverage.summary.total}\n\n`;
    
    // File details
    Object.entries(coverage.files).forEach(([file, data]) => {
      report += `\n${file}: ${data.percentage.toFixed(2)}% (${data.tested}/${data.total})\n`;
      
      if (data.untested.length > 0) {
        report += '  Untested functions:\n';
        data.untested.forEach(fn => {
          report += `    - ${fn}\n`;
        });
      }
    });
    
    return report;
  }
}
```

## Testing Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Independence**: Each test should be able to run independently
3. **Test Data**: Use factories to create consistent test data
4. **Cleanup**: Always clean up test resources
5. **Assertions**: Use clear, specific assertions
6. **Mocking**: Mock external dependencies for unit tests
7. **Performance**: Set performance benchmarks and test against them
8. **Coverage**: Aim for >80% code coverage

## Conclusion

This comprehensive testing strategy ensures:
- Confidence in refactored code
- Early detection of regressions
- Performance benchmarks are met
- Integration points work correctly
- Backwards compatibility is maintained

Regular execution of these tests through continuous testing ensures the codebase remains stable and reliable throughout the refactoring process.