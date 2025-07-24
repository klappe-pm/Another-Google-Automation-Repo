/**
 * @fileoverview Integration tests for Gmail Export PDF + Markdown
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-01-20
 * @description End-to-end integration tests for Gmail export functionality
 */

/**
 * Integration test configuration
 */
const INTEGRATION_TEST_CONFIG = {
  // Test scenarios
  SCENARIOS: {
    SIMPLE_EXPORT: {
      name: 'Simple single thread export',
      threads: 1,
      messagesPerThread: 2,
      includePdf: false,
      includeMarkdown: true
    },
    DUAL_FORMAT_EXPORT: {
      name: 'Dual format export (PDF + Markdown)',
      threads: 3,
      messagesPerThread: 5,
      includePdf: true,
      includeMarkdown: true
    },
    LARGE_THREAD_EXPORT: {
      name: 'Large thread with many messages',
      threads: 1,
      messagesPerThread: 25,
      includePdf: false,
      includeMarkdown: true
    },
    BATCH_EXPORT: {
      name: 'Batch export multiple threads',
      threads: 15,
      messagesPerThread: 3,
      includePdf: false,
      includeMarkdown: true
    }
  },
  
  // Email content templates for realistic testing
  EMAIL_TEMPLATES: {
    BUSINESS: {
      subject: 'Q4 Project Status Update',
      from: 'project.manager@company.com',
      content: `
        <h2>Project Status Update</h2>
        <p>Dear Team,</p>
        <p>I wanted to provide you with an update on our <strong>Q4 initiatives</strong>:</p>
        <ul>
          <li>Feature development is <strong>90% complete</strong></li>
          <li>Testing phase will begin <em>next Monday</em></li>
          <li>Go-live date remains <code>2025-02-01</code></li>
        </ul>
        <blockquote>
          <p>"Quality is never an accident; it is always the result of intelligent effort." - John Ruskin</p>
        </blockquote>
        <p>Please review the attached <a href="#">project timeline</a> and let me know if you have any concerns.</p>
        <p>Best regards,<br/>Project Manager</p>
      `
    },
    TECHNICAL: {
      subject: 'API Integration Discussion',
      from: 'developer@company.com',
      content: `
        <h1>API Integration Review</h1>
        <p>Hi team,</p>
        <p>After reviewing the <strong>REST API specifications</strong>, I have the following observations:</p>
        <h3>Authentication</h3>
        <p>The API uses <code>OAuth 2.0</code> with the following flow:</p>
        <pre><code>POST /oauth/token\nContent-Type: application/json\n{\n  "grant_type": "client_credentials",\n  "client_id": "your_client_id",\n  "client_secret": "your_secret"\n}</code></pre>
        <h3>Rate Limiting</h3>
        <ul>
          <li><strong>100 requests/minute</strong> for standard endpoints</li>
          <li><strong>10 requests/minute</strong> for data export endpoints</li>
          <li>Rate limit headers: <code>X-RateLimit-Remaining</code></li>
        </ul>
        <p>Let's schedule a <em>technical review meeting</em> to discuss implementation details.</p>
      `
    },
    CUSTOMER_SUPPORT: {
      subject: 'Re: Billing Inquiry - Account #12345',
      from: 'support@company.com',
      content: `
        <p>Dear Customer,</p>
        <p>Thank you for contacting us regarding your <strong>billing inquiry</strong>.</p>
        <p>After reviewing your account (<code>#12345</code>), I can confirm:</p>
        <ol>
          <li>Your subscription was renewed on <em>January 15, 2025</em></li>
          <li>The charge of <strong>$99.99</strong> is for the annual plan</li>
          <li>Your next billing date is <strong>January 15, 2026</strong></li>
        </ol>
        <blockquote>
          <p><strong>Note:</strong> You can view all billing details in your <a href="#">account dashboard</a>.</p>
        </blockquote>
        <p>If you have any additional questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br/>Customer Support Team</p>
      `
    }
  }
};

/**
 * Integration test utilities
 */
class IntegrationTestUtils {
  /**
   * Create realistic test email content
   * @param {string} template Template name
   * @param {Object} customizations Custom values
   * @returns {Object} Email content object
   */
  static createRealisticEmail(template, customizations = {}) {
    const baseTemplate = INTEGRATION_TEST_CONFIG.EMAIL_TEMPLATES[template];
    if (!baseTemplate) {
      throw new Error(`Unknown email template: ${template}`);
    }
    
    return {
      subject: customizations.subject || baseTemplate.subject,
      from: customizations.from || baseTemplate.from,
      to: customizations.to || 'recipient@company.com',
      cc: customizations.cc || '',
      bcc: customizations.bcc || '',
      date: customizations.date || new Date(),
      htmlBody: customizations.content || baseTemplate.content,
      plainTextBody: this.htmlToPlainText(customizations.content || baseTemplate.content),
      attachments: customizations.attachments || [],
      isUnread: customizations.isUnread || false,
      isStarred: customizations.isStarred || false
    };
  }
  
  /**
   * Convert HTML to plain text (simple implementation)
   * @param {string} html HTML content
   * @returns {string} Plain text
   */
  static htmlToPlainText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Create a realistic Gmail thread with mixed content types
   * @param {Object} scenario Test scenario configuration
   * @returns {MockGmailThread} Mock Gmail thread
   */
  static createRealisticThread(scenario) {
    const templates = Object.keys(INTEGRATION_TEST_CONFIG.EMAIL_TEMPLATES);
    const messages = [];
    
    for (let i = 0; i < scenario.messagesPerThread; i++) {
      const templateName = templates[i % templates.length];
      const emailContent = this.createRealisticEmail(templateName, {
        subject: i === 0 ? scenario.name : `Re: ${scenario.name}`,
        from: `user${i}@company.com`,
        to: 'team@company.com',
        date: new Date(Date.now() - (scenario.messagesPerThread - i) * 3600000), // 1 hour apart
        attachments: i % 3 === 0 ? [new MockGmailAttachment({
          name: `document_${i}.pdf`,
          size: 1024 * (i + 1),
          contentType: 'application/pdf'
        })] : []
      });
      
      messages.push(new MockGmailMessage({
        id: `realistic_msg_${i}`,
        ...emailContent
      }));
    }
    
    return new MockGmailThread({
      id: `realistic_thread_${StringUtils.random(8)}`,
      subject: scenario.name,
      messageCount: scenario.messagesPerThread,
      messages,
      labels: [
        { getName: () => 'INBOX' },
        { getName: () => 'IMPORTANT' },
        { getName: () => 'CATEGORY_WORK' }
      ]
    });
  }
  
  /**
   * Validate export results comprehensively
   * @param {Object} result Export result
   * @param {Object} expectedCounts Expected file counts
   * @returns {Object} Validation result
   */
  static validateExportResult(result, expectedCounts) {
    const validation = {
      success: true,
      errors: [],
      warnings: []
    };
    
    // Check basic success
    if (!result.success) {
      validation.errors.push(`Export failed: ${result.error}`);
      validation.success = false;
    }
    
    // Check file counts
    if (expectedCounts.total && result.filesGenerated !== expectedCounts.total) {
      validation.errors.push(`Expected ${expectedCounts.total} files, got ${result.filesGenerated}`);
      validation.success = false;
    }
    
    if (expectedCounts.markdown) {
      const markdownFiles = result.files?.filter(f => f.type === 'markdown').length || 0;
      if (markdownFiles !== expectedCounts.markdown) {
        validation.errors.push(`Expected ${expectedCounts.markdown} Markdown files, got ${markdownFiles}`);
        validation.success = false;
      }
    }
    
    if (expectedCounts.pdf) {
      const pdfFiles = result.files?.filter(f => f.type === 'pdf').length || 0;
      if (pdfFiles !== expectedCounts.pdf) {
        validation.errors.push(`Expected ${expectedCounts.pdf} PDF files, got ${pdfFiles}`);
        validation.success = false;
      }
    }
    
    // Check processing counts
    if (result.processed !== result.successful + result.failed) {
      validation.warnings.push('Processing counts don\'t add up');
    }
    
    // Check for reasonable processing time
    if (result.duration && result.duration.includes('s')) {
      const seconds = parseInt(result.duration);
      if (seconds > 60) {
        validation.warnings.push(`Processing took ${seconds} seconds - consider optimization`);
      }
    }
    
    return validation;
  }
  
  /**
   * Create mock Drive environment for testing
   * @returns {Object} Mock Drive environment
   */
  static createMockDriveEnvironment() {
    const rootFolder = new MockDriveFolder({ name: 'Gmail Exports Test' });
    
    // Create date subfolder
    const dateStr = DateUtils.format(new Date(), 'short').replace(/\//g, '-');
    const dateFolder = rootFolder.createFolder(dateStr);
    
    return {
      rootFolder,
      dateFolder,
      createdFiles: [],
      
      // Track file creation
      trackFileCreation: function(file) {
        this.createdFiles.push(file);
      },
      
      // Get files by type
      getFilesByType: function(type) {
        return this.createdFiles.filter(f => f.type === type);
      },
      
      // Get total file count
      getTotalFileCount: function() {
        return this.createdFiles.length;
      }
    };
  }
}

/**
 * Run integration tests for Gmail Export functionality
 */
function runGmailExportIntegrationTests() {
  Logger.info('Starting Gmail Export Integration Tests');
  Logger.info('='.repeat(50));
  
  const testRunner = new TestFramework();
  
  // Test individual scenarios
  testSimpleExportScenario(testRunner);
  testDualFormatExportScenario(testRunner);
  testLargeThreadScenario(testRunner);
  testBatchExportScenario(testRunner);
  
  // Test error recovery scenarios
  testErrorRecoveryScenarios(testRunner);
  
  // Test edge cases
  testEdgeCaseScenarios(testRunner);
  
  // Test real-world workflows
  testRealWorldWorkflows(testRunner);
  
  const results = testRunner.run();
  
  Logger.info('='.repeat(50));
  Logger.info('INTEGRATION TEST SUMMARY');
  Logger.info('='.repeat(50));
  
  if (results.failed > 0) {
    Logger.error(`Integration tests failed: ${results.failed}/${results.total}`);
    results.errors.forEach(error => {
      Logger.error(`- ${error.test}: ${error.error}`);
    });
    return false;
  } else {
    Logger.info(`✅ All integration tests passed: ${results.passed}/${results.total}`);
    return true;
  }
}

/**
 * Test simple export scenario
 */
function testSimpleExportScenario(testRunner) {
  testRunner.test('Integration - Simple single thread export', () => {
    const scenario = INTEGRATION_TEST_CONFIG.SCENARIOS.SIMPLE_EXPORT;
    const mockThread = IntegrationTestUtils.createRealisticThread(scenario);
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: scenario.includePdf,
      includeMarkdown: scenario.includeMarkdown
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const result = processThread(mockThread, config, context);
    
    Assert.isTrue(result.success, `Simple export failed: ${result.error}`);
    Assert.equals(result.files.length, 1, 'Should generate exactly 1 file');
    Assert.equals(result.files[0].type, 'markdown', 'Should generate Markdown file');
    
    // Verify file naming
    Assert.contains(result.files[0].name, '.md', 'Markdown file should have .md extension');
    Assert.matches(result.files[0].name, /^[a-zA-Z0-9_-]+\.md$/, 'Filename should be safe');
    
    Logger.info(`✅ Simple export generated: ${result.files[0].name}`);
  });
}

/**
 * Test dual format export scenario
 */
function testDualFormatExportScenario(testRunner) {
  testRunner.test('Integration - Dual format export (PDF + Markdown)', () => {
    const scenario = INTEGRATION_TEST_CONFIG.SCENARIOS.DUAL_FORMAT_EXPORT;
    const threads = [];
    
    // Create multiple threads for batch processing
    for (let i = 0; i < scenario.threads; i++) {
      const thread = IntegrationTestUtils.createRealisticThread({
        ...scenario,
        name: `Dual Format Thread ${i + 1}`
      });
      threads.push(thread);
    }
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: scenario.includePdf,
      includeMarkdown: scenario.includeMarkdown
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder,
      startTime: new Date(),
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      generatedFiles: []
    };
    
    // Mock DocumentApp and DriveApp for PDF generation
    const originalDocumentApp = global.DocumentApp;
    const originalDriveApp = global.DriveApp;
    
    global.DocumentApp = {
      create: (name) => new MockDocument({ name }),
      ParagraphHeading: {
        TITLE: 'TITLE',
        HEADING1: 'HEADING1',
        HEADING2: 'HEADING2'
      },
      Attribute: {
        FONT_SIZE: 'FONT_SIZE',
        ITALIC: 'ITALIC'
      }
    };
    
    global.DriveApp = {
      getFileById: (id) => new MockDriveFile({ id })
    };
    
    try {
      const result = processThreadsBatch(threads, config, context);
      
      Assert.equals(result.processed, scenario.threads, `Should process ${scenario.threads} threads`);
      Assert.equals(result.successful, scenario.threads, 'All threads should succeed');
      Assert.equals(result.failed, 0, 'No threads should fail');
      
      // Each thread should generate 2 files (PDF + Markdown)
      const expectedFiles = scenario.threads * 2;
      Assert.equals(result.files.length, expectedFiles, `Should generate ${expectedFiles} files`);
      
      // Verify file types
      const markdownFiles = result.files.filter(f => f.type === 'markdown');
      const pdfFiles = result.files.filter(f => f.type === 'pdf');
      
      Assert.equals(markdownFiles.length, scenario.threads, `Should have ${scenario.threads} Markdown files`);
      Assert.equals(pdfFiles.length, scenario.threads, `Should have ${scenario.threads} PDF files`);
      
      Logger.info(`✅ Dual format export generated ${result.files.length} files`);
      
    } finally {
      global.DocumentApp = originalDocumentApp;
      global.DriveApp = originalDriveApp;
    }
  });
}

/**
 * Test large thread scenario
 */
function testLargeThreadScenario(testRunner) {
  testRunner.test('Integration - Large thread with many messages', () => {
    const scenario = INTEGRATION_TEST_CONFIG.SCENARIOS.LARGE_THREAD_EXPORT;
    const mockThread = IntegrationTestUtils.createRealisticThread(scenario);
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    // Verify thread has expected number of messages
    Assert.equals(mockThread.getMessages().length, scenario.messagesPerThread, 
      `Thread should have ${scenario.messagesPerThread} messages`);
    
    const config = {
      includePdf: scenario.includePdf,
      includeMarkdown: scenario.includeMarkdown
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const startTime = new Date().getTime();
    const result = processThread(mockThread, config, context);
    const processingTime = new Date().getTime() - startTime;
    
    Assert.isTrue(result.success, `Large thread export failed: ${result.error}`);
    Assert.equals(result.files.length, 1, 'Should generate 1 Markdown file');
    
    // Verify the generated content includes all messages
    const content = generateThreadContent(mockThread, mockThread.getMessages());
    Assert.equals(content.messages.length, scenario.messagesPerThread, 
      'Content should include all messages');
    
    // Check that each message has been converted to Markdown
    content.messages.forEach((message, index) => {
      Assert.isDefined(message.markdownBody, `Message ${index + 1} should have Markdown body`);
      Assert.isTrue(message.markdownBody.length > 0, `Message ${index + 1} Markdown should not be empty`);
    });
    
    Logger.info(`✅ Large thread (${scenario.messagesPerThread} messages) processed in ${processingTime}ms`);
  });
}

/**
 * Test batch export scenario
 */
function testBatchExportScenario(testRunner) {
  testRunner.test('Integration - Batch export multiple threads', () => {
    const scenario = INTEGRATION_TEST_CONFIG.SCENARIOS.BATCH_EXPORT;
    const threads = [];
    
    // Create threads with different content types
    const templates = Object.keys(INTEGRATION_TEST_CONFIG.EMAIL_TEMPLATES);
    
    for (let i = 0; i < scenario.threads; i++) {
      const templateName = templates[i % templates.length];
      const thread = IntegrationTestUtils.createRealisticThread({
        ...scenario,
        name: `Batch ${templateName} Thread ${i + 1}`
      });
      threads.push(thread);
    }
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: scenario.includePdf,
      includeMarkdown: scenario.includeMarkdown
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder,
      startTime: new Date(),
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      generatedFiles: []
    };
    
    const startTime = new Date().getTime();
    const result = processThreadsBatch(threads, config, context);
    const totalTime = new Date().getTime() - startTime;
    
    Assert.equals(result.processed, scenario.threads, `Should process all ${scenario.threads} threads`);
    Assert.equals(result.successful, scenario.threads, 'All threads should succeed');
    Assert.equals(result.failed, 0, 'No threads should fail');
    Assert.equals(result.files.length, scenario.threads, `Should generate ${scenario.threads} files`);
    
    // Verify all files are Markdown
    result.files.forEach((file, index) => {
      Assert.equals(file.type, 'markdown', `File ${index + 1} should be Markdown`);
      Assert.contains(file.name, '.md', `File ${index + 1} should have .md extension`);
    });
    
    // Performance check - should process reasonably quickly
    const avgTimePerThread = totalTime / scenario.threads;
    Assert.isTrue(avgTimePerThread < 1000, 
      `Average processing time per thread (${avgTimePerThread}ms) should be under 1 second`);
    
    Logger.info(`✅ Batch export processed ${scenario.threads} threads in ${totalTime}ms (avg: ${avgTimePerThread.toFixed(1)}ms/thread)`);
  });
}

/**
 * Test error recovery scenarios
 */
function testErrorRecoveryScenarios(testRunner) {
  testRunner.test('Integration - Thread with no messages error recovery', () => {
    const emptyThread = new MockGmailThread({
      id: 'empty_thread',
      subject: 'Empty Thread',
      messageCount: 0,
      messages: [] // No messages
    });
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const result = processThread(emptyThread, config, context);
    
    Assert.isFalse(result.success, 'Empty thread should fail gracefully');
    Assert.equals(result.error, 'Thread contains no messages', 'Should provide meaningful error message');
    Assert.equals(result.files.length, 0, 'Should not generate any files');
    
    Logger.info('✅ Empty thread handled gracefully');
  });
  
  testRunner.test('Integration - Mixed success/failure batch processing', () => {
    const threads = [
      IntegrationTestUtils.createRealisticThread({
        name: 'Good Thread 1',
        messagesPerThread: 2
      }),
      new MockGmailThread({ // Empty thread that will fail
        id: 'bad_thread',
        subject: 'Bad Thread',
        messageCount: 0,
        messages: []
      }),
      IntegrationTestUtils.createRealisticThread({
        name: 'Good Thread 2',
        messagesPerThread: 3
      })
    ];
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder,
      errors: []
    };
    
    const result = processThreadsBatch(threads, config, context);
    
    Assert.equals(result.processed, 3, 'Should process all 3 threads');
    Assert.equals(result.successful, 2, 'Should have 2 successful threads');
    Assert.equals(result.failed, 1, 'Should have 1 failed thread');
    Assert.equals(result.files.length, 2, 'Should generate 2 files from successful threads');
    
    // Check that errors were captured
    Assert.equals(context.errors.length, 1, 'Should capture 1 error');
    Assert.contains(context.errors[0].error, 'no messages', 'Error should be descriptive');
    
    Logger.info('✅ Mixed success/failure batch processed correctly');
  });
}

/**
 * Test edge case scenarios
 */
function testEdgeCaseScenarios(testRunner) {
  testRunner.test('Integration - Thread with special characters in subject', () => {
    const specialThread = new MockGmailThread({
      id: 'special_chars_thread',
      subject: 'Test: Special!@#$%^&*()Characters[]{};"\',.<>?/|\\`~',
      messageCount: 1,
      messages: [new MockGmailMessage({
        subject: 'Test: Special!@#$%^&*()Characters[]{};"\',.<>?/|\\`~',
        htmlBody: '<p>Content with special characters: !@#$%^&*()</p>'
      })]
    });
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const result = processThread(specialThread, config, context);
    
    Assert.isTrue(result.success, 'Thread with special characters should process successfully');
    Assert.equals(result.files.length, 1, 'Should generate 1 file');
    
    // Verify filename is safe
    const filename = result.files[0].name;
    Assert.matches(filename, /^[a-zA-Z0-9_-]+\.md$/, 'Filename should contain only safe characters');
    
    Logger.info(`✅ Special characters handled: generated ${filename}`);
  });
  
  testRunner.test('Integration - Thread with very long subject line', () => {
    const longSubject = 'This is an extremely long email subject line that goes on and on and should be truncated to a reasonable length for filename generation purposes because some file systems have limits on filename length and we need to ensure compatibility across different platforms and systems'.repeat(2);
    
    const longSubjectThread = new MockGmailThread({
      id: 'long_subject_thread',
      subject: longSubject,
      messageCount: 1,
      messages: [new MockGmailMessage({
        subject: longSubject,
        htmlBody: '<p>Test content</p>'
      })]
    });
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const result = processThread(longSubjectThread, config, context);
    
    Assert.isTrue(result.success, 'Thread with long subject should process successfully');
    Assert.equals(result.files.length, 1, 'Should generate 1 file');
    
    // Verify filename is reasonable length
    const filename = result.files[0].name;
    Assert.isTrue(filename.length < 100, `Filename should be under 100 chars, got ${filename.length}`);
    Assert.matches(filename, /^[a-zA-Z0-9_-]+\.md$/, 'Filename should contain only safe characters');
    
    Logger.info(`✅ Long subject handled: filename length ${filename.length}`);
  });
  
  testRunner.test('Integration - Thread with HTML entities and unicode', () => {
    const unicodeContent = `
      <h2>International Content Test</h2>
      <p>English: Hello &amp; welcome to our café!</p>
      <p>Spanish: ¡Hola &amp; bienvenido a nuestro café!</p>
      <p>French: Bonjour &amp; bienvenue dans notre café!</p>
      <p>German: Hallo &amp; willkommen in unserem Café!</p>
      <p>Japanese: こんにちは &amp; 私たちのカフェへようこそ！</p>
      <p>Emoji: 👋 🌍 ☕ 🎉</p>
      <p>HTML Entities: &lt;tag&gt; &quot;quotes&quot; &#39;apostrophe&#39; &nbsp;</p>
    `;
    
    const unicodeThread = new MockGmailThread({
      id: 'unicode_thread',
      subject: 'Café International 🌍',
      messageCount: 1,
      messages: [new MockGmailMessage({
        subject: 'Café International 🌍',
        htmlBody: unicodeContent
      })]
    });
    
    const mockEnv = IntegrationTestUtils.createMockDriveEnvironment();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockEnv.dateFolder
    };
    
    const result = processThread(unicodeThread, config, context);
    
    Assert.isTrue(result.success, 'Thread with unicode content should process successfully');
    Assert.equals(result.files.length, 1, 'Should generate 1 file');
    
    // Generate the actual content to verify unicode handling
    const content = generateThreadContent(unicodeThread, unicodeThread.getMessages());
    const markdown = content.messages[0].markdownBody;
    
    Assert.contains(markdown, 'café', 'Should preserve unicode characters');
    Assert.contains(markdown, '<tag>', 'Should decode HTML entities');
    Assert.contains(markdown, '"quotes"', 'Should decode quote entities');
    
    Logger.info('✅ Unicode and HTML entities handled correctly');
  });
}

/**
 * Test real-world workflows
 */
function testRealWorldWorkflows(testRunner) {
  testRunner.test('Integration - Complete export workflow simulation', () => {
    // Simulate a complete export workflow as a user would experience
    const exportOptions = {
      query: 'in:inbox is:important',
      maxThreads: 5,
      includePdf: false,
      includeMarkdown: true,
      folderName: 'Integration Test Export'
    };
    
    // Mock the Gmail search results
    const mockThreads = [];
    for (let i = 0; i < 5; i++) {
      mockThreads.push(IntegrationTestUtils.createRealisticThread({
        name: `Important Thread ${i + 1}`,
        messagesPerThread: 3
      }));
    }
    
    // Mock GmailApp and DriveApp
    const originalGmailApp = global.GmailApp;
    const originalDriveApp = global.DriveApp;
    
    const mockFolder = new MockDriveFolder({ name: exportOptions.folderName });
    
    global.GmailApp = {
      search: (query, start, max) => {
        Logger.info(`Mock Gmail search: ${query} (${start}-${max})`);
        return mockThreads;
      }
    };
    
    global.DriveApp = {
      getFoldersByName: (name) => ({
        hasNext: () => false // Force creation of new folder
      }),
      createFolder: (name) => {
        Logger.info(`Mock Drive folder created: ${name}`);
        return mockFolder;
      }
    };
    
    try {
      // This would normally call the main export function
      // For integration test, we'll simulate the key steps
      const config = validateExportOptions(exportOptions);
      const context = initializeExportContext(config);
      context.targetFolder = mockFolder;
      
      const results = processThreadsBatch(mockThreads, config, context);
      const summary = generateExportSummary(results, context);
      
      // Validate the complete workflow result
      const validation = IntegrationTestUtils.validateExportResult(summary, {
        total: 5,
        markdown: 5,
        pdf: 0
      });
      
      Assert.isTrue(validation.success, `Workflow validation failed: ${validation.errors.join(', ')}`);
      Assert.isTrue(summary.success, 'Export summary should indicate success');
      Assert.equals(summary.processed, 5, 'Should process all 5 threads');
      Assert.equals(summary.successful, 5, 'All threads should succeed');
      Assert.equals(summary.filesGenerated, 5, 'Should generate 5 files');
      
      Logger.info(`✅ Complete workflow simulation successful: ${summary.filesGenerated} files generated`);
      
    } finally {
      global.GmailApp = originalGmailApp;
      global.DriveApp = originalDriveApp;
    }
  });
  
  testRunner.test('Integration - Export by thread IDs workflow', () => {
    const threadIds = ['thread_001', 'thread_002', 'thread_003'];
    const mockThreads = threadIds.map(id => 
      IntegrationTestUtils.createRealisticThread({
        name: `Thread ${id}`,
        messagesPerThread: 2
      })
    );
    
    // Mock GmailApp for thread ID lookup
    const originalGmailApp = global.GmailApp;
    global.GmailApp = {
      getThreadById: (id) => {
        const thread = mockThreads.find(t => t.getId() === id);
        if (!thread) throw new Error(`Thread not found: ${id}`);
        return thread;
      }
    };
    
    // Mock DriveApp
    const originalDriveApp = global.DriveApp;
    global.DriveApp = {
      getFoldersByName: () => ({ hasNext: () => false }),
      createFolder: (name) => new MockDriveFolder({ name })
    };
    
    try {
      const options = {
        includePdf: false,
        includeMarkdown: true,
        folderName: 'Thread ID Export Test'
      };
      
      const result = exportGmailThreadsByIds(threadIds, options);
      
      Assert.isTrue(result.success, `Thread ID export failed: ${result.error}`);
      Assert.equals(result.processed, 3, 'Should process all 3 threads');
      Assert.equals(result.successful, 3, 'All threads should succeed');
      Assert.equals(result.filesGenerated, 3, 'Should generate 3 files');
      
      Logger.info('✅ Export by thread IDs workflow successful');
      
    } finally {
      global.GmailApp = originalGmailApp;
      global.DriveApp = originalDriveApp;
    }
  });
  
  testRunner.test('Integration - Batch queries workflow', () => {
    const queries = [
      'from:important@company.com',
      'subject:"project update"',
      'has:attachment after:2025/01/01'
    ];
    
    // Mock different thread sets for each query
    const queryResults = {
      'from:important@company.com': [IntegrationTestUtils.createRealisticThread({ name: 'Important Email', messagesPerThread: 2 })],
      'subject:"project update"': [IntegrationTestUtils.createRealisticThread({ name: 'Project Update', messagesPerThread: 3 })],
      'has:attachment after:2025/01/01': [IntegrationTestUtils.createRealisticThread({ name: 'With Attachment', messagesPerThread: 1 })]
    };
    
    // Mock GmailApp and DriveApp
    const originalGmailApp = global.GmailApp;
    const originalDriveApp = global.DriveApp;
    
    global.GmailApp = {
      search: (query) => queryResults[query] || []
    };
    
    global.DriveApp = {
      getFoldersByName: () => ({ hasNext: () => false }),
      createFolder: (name) => new MockDriveFolder({ name })
    };
    
    try {
      const options = {
        includePdf: false,
        includeMarkdown: true,
        folderName: 'Batch Queries Test'
      };
      
      const results = batchExportGmailQueries(queries, options);
      
      Assert.equals(results.length, 3, 'Should have results for all 3 queries');
      
      results.forEach((result, index) => {
        Assert.equals(result.query, queries[index], `Result ${index} should match query`);
        Assert.isTrue(result.success, `Query ${index} should succeed: ${result.error}`);
        Assert.equals(result.processed, 1, `Query ${index} should process 1 thread`);
      });
      
      Logger.info('✅ Batch queries workflow successful');
      
    } finally {
      global.GmailApp = originalGmailApp;
      global.DriveApp = originalDriveApp;
    }
  });
}

/**
 * Run comprehensive integration test suite
 */
function runAllIntegrationTests() {
  try {
    Logger.info('Gmail Export Integration Test Suite Starting...');
    
    const testResults = runGmailExportIntegrationTests();
    
    Logger.info('\n' + '='.repeat(60));
    Logger.info('INTEGRATION TEST SUITE SUMMARY');
    Logger.info('='.repeat(60));
    
    if (testResults) {
      Logger.info('✅ All integration tests passed successfully!');
      Logger.info('\nTest Coverage:');
      Logger.info('- Simple export scenarios');
      Logger.info('- Dual format (PDF + Markdown) exports');
      Logger.info('- Large thread processing');
      Logger.info('- Batch processing');
      Logger.info('- Error recovery mechanisms');
      Logger.info('- Edge case handling');
      Logger.info('- Complete workflow simulations');
      
      return true;
    } else {
      Logger.error('❌ Some integration tests failed');
      Logger.error('Please review the test results above for details.');
      
      return false;
    }
    
  } catch (error) {
    Logger.error('Integration test suite execution failed:', error);
    return false;
  }
}

/**
 * Demo function that shows how to use the export functionality
 */
function demoGmailExportUsage() {
  Logger.info('Gmail Export PDF + Markdown Demo');
  Logger.info('='.repeat(40));
  
  // Demo 1: Simple export
  Logger.info('\n1. Simple Markdown export from inbox:');
  Logger.info('   gmailExportPdfMarkdown({');
  Logger.info('     query: "in:inbox",');
  Logger.info('     maxThreads: 10,');
  Logger.info('     includePdf: false,');
  Logger.info('     includeMarkdown: true');
  Logger.info('   })');
  
  // Demo 2: Dual format export
  Logger.info('\n2. Dual format export with custom folder:');
  Logger.info('   gmailExportPdfMarkdown({');
  Logger.info('     query: "from:important@company.com",');
  Logger.info('     maxThreads: 5,');
  Logger.info('     includePdf: true,');
  Logger.info('     includeMarkdown: true,');
  Logger.info('     folderName: "Important Emails Export"');
  Logger.info('   })');
  
  // Demo 3: Date range export
  Logger.info('\n3. Export with date range:');
  Logger.info('   gmailExportPdfMarkdown({');
  Logger.info('     query: "has:attachment",');
  Logger.info('     afterDate: new Date("2025-01-01"),');
  Logger.info('     beforeDate: new Date("2025-01-31"),');
  Logger.info('     includePdf: false,');
  Logger.info('     includeMarkdown: true');
  Logger.info('   })');
  
  // Demo 4: Utility functions
  Logger.info('\n4. Utility functions:');
  Logger.info('   exportRecentInboxMessages(7) // Last 7 days');
  Logger.info('   exportMessagesFromSender("sender@example.com")');
  Logger.info('   exportGmailThreadsByIds(["thread_id_1", "thread_id_2"])');
  
  Logger.info('\nFor detailed documentation, see the function comments in the source code.');
}
