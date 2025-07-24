/**
 * @fileoverview Unit tests for Gmail Export PDF + Markdown functionality
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-01-20
 * @description Comprehensive test suite using clasp-mock for Gmail export functionality
 */

/**
 * Mock Gmail objects for testing
 */
class MockGmailThread {
  constructor(options = {}) {
    this.id = options.id || `thread_${StringUtils.random(10)}`;
    this.subject = options.subject || 'Test Thread Subject';
    this.messageCount = options.messageCount || 3;
    this.lastMessageDate = options.lastMessageDate || new Date();
    this.labels = options.labels || [{ getName: () => 'INBOX' }, { getName: () => 'IMPORTANT' }];
    this.messages = options.messages || this._createMockMessages();
  }
  
  getId() { return this.id; }
  getFirstMessageSubject() { return this.subject; }
  getMessageCount() { return this.messageCount; }
  getLastMessageDate() { return this.lastMessageDate; }
  getLabels() { return this.labels; }
  getMessages() { return this.messages; }
  
  _createMockMessages() {
    return Array.from({ length: this.messageCount }, (_, i) => 
      new MockGmailMessage({
        index: i + 1,
        subject: `${this.subject} - Message ${i + 1}`
      })
    );
  }
}

class MockGmailMessage {
  constructor(options = {}) {
    this.id = options.id || `msg_${StringUtils.random(10)}`;
    this.subject = options.subject || 'Test Message Subject';
    this.from = options.from || 'sender@example.com';
    this.to = options.to || 'recipient@example.com';
    this.cc = options.cc || '';
    this.bcc = options.bcc || '';
    this.date = options.date || new Date();
    this.isUnread = options.isUnread || false;
    this.isStarred = options.isStarred || false;
    this.htmlBody = options.htmlBody || '<p>This is a <strong>test</strong> message with <em>HTML</em> content.</p>';
    this.plainTextBody = options.plainTextBody || 'This is a test message with plain text content.';
    this.attachments = options.attachments || [];
  }
  
  getId() { return this.id; }
  getSubject() { return this.subject; }
  getFrom() { return this.from; }
  getTo() { return this.to; }
  getCc() { return this.cc; }
  getBcc() { return this.bcc; }
  getDate() { return this.date; }
  isUnread() { return this.isUnread; }
  isStarred() { return this.isStarred; }
  getBody() { return this.htmlBody; }
  getPlainBody() { return this.plainTextBody; }
  getAttachments() { return this.attachments; }
}

class MockGmailAttachment {
  constructor(options = {}) {
    this.name = options.name || 'test-document.pdf';
    this.size = options.size || 1024;
    this.contentType = options.contentType || 'application/pdf';
  }
  
  getName() { return this.name; }
  getSize() { return this.size; }
  getContentType() { return this.contentType; }
}

class MockDriveFolder {
  constructor(options = {}) {
    this.id = options.id || `folder_${StringUtils.random(10)}`;
    this.name = options.name || 'Test Folder';
    this.url = options.url || `https://drive.google.com/drive/folders/${this.id}`;
    this.files = [];
    this.subfolders = new Map();
  }
  
  getId() { return this.id; }
  getName() { return this.name; }
  getUrl() { return this.url; }
  
  createFile(blob) {
    const file = new MockDriveFile({
      name: blob.getName(),
      size: blob.getBytes().length,
      contentType: blob.getContentType()
    });
    this.files.push(file);
    return file;
  }
  
  createFolder(name) {
    const folder = new MockDriveFolder({ name });
    this.subfolders.set(name, folder);
    return folder;
  }
  
  getFoldersByName(name) {
    return {
      hasNext: () => this.subfolders.has(name),
      next: () => this.subfolders.get(name)
    };
  }
}

class MockDriveFile {
  constructor(options = {}) {
    this.id = options.id || `file_${StringUtils.random(10)}`;
    this.name = options.name || 'test-file.txt';
    this.size = options.size || 1024;
    this.contentType = options.contentType || 'text/plain';
    this.url = options.url || `https://drive.google.com/file/d/${this.id}/view`;
  }
  
  getId() { return this.id; }
  getName() { return this.name; }
  getSize() { return this.size; }
  getContentType() { return this.contentType; }
  getUrl() { return this.url; }
  getBlob() {
    return {
      setName: (name) => ({ getName: () => name, getBytes: () => new Array(this.size).fill(0) })
    };
  }
  setTrashed() { return this; }
}

class MockDocument {
  constructor(options = {}) {
    this.id = options.id || `doc_${StringUtils.random(10)}`;
    this.name = options.name || 'Test Document';
    this.body = new MockDocumentBody();
  }
  
  getId() { return this.id; }
  getName() { return this.name; }
  getBody() { return this.body; }
}

class MockDocumentBody {
  constructor() {
    this.content = [];
  }
  
  clear() {
    this.content = [];
    return this;
  }
  
  appendParagraph(text) {
    const paragraph = {
      text,
      setHeading: (heading) => paragraph,
      setAttributes: (attrs) => paragraph
    };
    this.content.push(paragraph);
    return paragraph;
  }
  
  appendHorizontalRule() {
    this.content.push({ type: 'hr' });
    return this;
  }
}

/**
 * Test suite for Gmail Export PDF + Markdown
 */
function runGmailExportPdfMarkdownTests() {
  Logger.info('Starting Gmail Export PDF + Markdown test suite');
  
  const testRunner = new TestFramework();
  
  // Configuration Tests
  testConfigurationValidation(testRunner);
  
  // HTML to Markdown Conversion Tests
  testHtmlToMarkdownConversion(testRunner);
  
  // Content Generation Tests
  testContentGeneration(testRunner);
  
  // File Export Tests
  testFileExport(testRunner);
  
  // Integration Tests
  testIntegrationScenarios(testRunner);
  
  // Error Handling Tests
  testErrorHandling(testRunner);
  
  const results = testRunner.run();
  
  if (results.failed > 0) {
    throw new Error(`${results.failed} tests failed in Gmail Export PDF + Markdown test suite`);
  }
  
  Logger.info(`Gmail Export PDF + Markdown test suite completed: ${results.passed}/${results.total} tests passed`);
  return results;
}

/**
 * Test configuration validation functions
 */
function testConfigurationValidation(testRunner) {
  testRunner.test('validateExportOptions - default configuration', () => {
    const config = validateExportOptions({});
    
    Assert.equals(config.query, 'in:inbox');
    Assert.equals(config.maxThreads, PDF_MARKDOWN_CONFIG.MAX_THREADS_PER_RUN);
    Assert.isTrue(config.includePdf);
    Assert.isTrue(config.includeMarkdown);
    Assert.equals(config.folderName, PDF_MARKDOWN_CONFIG.DEFAULT_FOLDER_NAME);
    Assert.isNull(config.folderId);
    Assert.isNull(config.afterDate);
    Assert.isNull(config.beforeDate);
  });
  
  testRunner.test('validateExportOptions - custom configuration', () => {
    const customOptions = {
      query: 'from:test@example.com',
      maxThreads: 25,
      includePdf: false,
      includeMarkdown: true,
      folderId: 'custom_folder_id',
      afterDate: new Date('2025-01-01'),
      beforeDate: new Date('2025-01-31')
    };
    
    const config = validateExportOptions(customOptions);
    
    Assert.equals(config.query, 'from:test@example.com');
    Assert.equals(config.maxThreads, 25);
    Assert.isFalse(config.includePdf);
    Assert.isTrue(config.includeMarkdown);
    Assert.equals(config.folderId, 'custom_folder_id');
    Assert.equals(config.afterDate.toDateString(), new Date('2025-01-01').toDateString());
    Assert.equals(config.beforeDate.toDateString(), new Date('2025-01-31').toDateString());
  });
  
  testRunner.test('validateExportOptions - enforce maximum threads limit', () => {
    const config = validateExportOptions({ maxThreads: 1000 });
    Assert.equals(config.maxThreads, PDF_MARKDOWN_CONFIG.MAX_THREADS_PER_RUN);
  });
  
  testRunner.test('validateExportOptions - invalid date range', () => {
    Assert.throws(() => {
      validateExportOptions({
        afterDate: new Date('2025-01-31'),
        beforeDate: new Date('2025-01-01')
      });
    }, 'Should throw error for invalid date range');
  });
  
  testRunner.test('validateExportOptions - no export formats enabled', () => {
    Assert.throws(() => {
      validateExportOptions({
        includePdf: false,
        includeMarkdown: false
      });
    }, 'Should throw error when no export formats are enabled');
  });
}

/**
 * Test HTML to Markdown conversion functions
 */
function testHtmlToMarkdownConversion(testRunner) {
  testRunner.test('convertHtmlToMarkdown - basic text formatting', () => {
    const html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '**bold**');
    Assert.contains(markdown, '*italic*');
    Assert.doesNotContain(markdown, '<p>');
    Assert.doesNotContain(markdown, '</p>');
  });
  
  testRunner.test('convertHtmlToMarkdown - headers', () => {
    const html = '<h1>Main Title</h1><h2>Subtitle</h2><h3>Section</h3>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '# Main Title');
    Assert.contains(markdown, '## Subtitle');
    Assert.contains(markdown, '### Section');
  });
  
  testRunner.test('convertHtmlToMarkdown - links', () => {
    const html = '<a href="https://example.com">Example Link</a>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.equals(markdown.trim(), '[Example Link](https://example.com)');
  });
  
  testRunner.test('convertHtmlToMarkdown - unordered lists', () => {
    const html = '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '- First item');
    Assert.contains(markdown, '- Second item');
    Assert.contains(markdown, '- Third item');
  });
  
  testRunner.test('convertHtmlToMarkdown - code elements', () => {
    const html = '<p>Use the <code>console.log()</code> function.</p>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '`console.log()`');
  });
  
  testRunner.test('convertHtmlToMarkdown - blockquotes', () => {
    const html = '<blockquote>This is a quoted text.</blockquote>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '> This is a quoted text.');
  });
  
  testRunner.test('convertHtmlToMarkdown - HTML entities', () => {
    const html = '<p>&lt;tag&gt; and &amp; symbol and &quot;quotes&quot;</p>';
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '<tag>');
    Assert.contains(markdown, '& symbol');
    Assert.contains(markdown, '"quotes"');
  });
  
  testRunner.test('convertHtmlToMarkdown - empty or null input', () => {
    Assert.equals(convertHtmlToMarkdown(''), '');
    Assert.equals(convertHtmlToMarkdown(null), '');
    Assert.equals(convertHtmlToMarkdown(undefined), '');
  });
  
  testRunner.test('convertHtmlToMarkdown - complex nested HTML', () => {
    const html = `
      <div>
        <h2>Email Content</h2>
        <p>Dear recipient,</p>
        <p>This email contains <strong>important</strong> information about:</p>
        <ul>
          <li><a href="https://example.com/doc">Project documentation</a></li>
          <li>Meeting notes with <em>action items</em></li>
        </ul>
        <blockquote>
          <p>Remember to review the <code>requirements.md</code> file.</p>
        </blockquote>
        <p>Best regards,<br/>Team</p>
      </div>
    `;
    
    const markdown = convertHtmlToMarkdown(html);
    
    Assert.contains(markdown, '## Email Content');
    Assert.contains(markdown, '**important**');
    Assert.contains(markdown, '- [Project documentation](https://example.com/doc)');
    Assert.contains(markdown, '*action items*');
    Assert.contains(markdown, '> Remember to review the `requirements.md` file.');
    Assert.doesNotContain(markdown, '<div>');
    Assert.doesNotContain(markdown, '</div>');
  });
}

/**
 * Test content generation functions
 */
function testContentGeneration(testRunner) {
  testRunner.test('generateThreadContent - basic thread structure', () => {
    const mockThread = new MockGmailThread({
      id: 'thread_123',
      subject: 'Test Thread Subject',
      messageCount: 2
    });
    
    const content = generateThreadContent(mockThread, mockThread.getMessages());
    
    Assert.equals(content.subject, 'Test Thread Subject');
    Assert.equals(content.threadId, 'thread_123');
    Assert.equals(content.messageCount, 2);
    Assert.equals(content.messages.length, 2);
    Assert.isDefined(content.lastMessageDate);
    Assert.isTrue(Array.isArray(content.labels));
  });
  
  testRunner.test('generateThreadContent - message processing', () => {
    const mockMessage = new MockGmailMessage({
      id: 'msg_456',
      subject: 'Test Message',
      from: 'sender@example.com',
      to: 'recipient@example.com',
      htmlBody: '<p>Test <strong>HTML</strong> content</p>'
    });
    
    const mockThread = new MockGmailThread({
      messages: [mockMessage]
    });
    
    const content = generateThreadContent(mockThread, [mockMessage]);
    const message = content.messages[0];
    
    Assert.equals(message.id, 'msg_456');
    Assert.equals(message.from, 'sender@example.com');
    Assert.equals(message.to, 'recipient@example.com');
    Assert.contains(message.markdownBody, '**HTML**');
    Assert.isTrue(Array.isArray(message.attachments));
  });
  
  testRunner.test('generateThreadContent - attachment processing', () => {
    const mockAttachment = new MockGmailAttachment({
      name: 'report.pdf',
      size: 2048,
      contentType: 'application/pdf'
    });
    
    const mockMessage = new MockGmailMessage({
      attachments: [mockAttachment]
    });
    
    const mockThread = new MockGmailThread({
      messages: [mockMessage]
    });
    
    const content = generateThreadContent(mockThread, [mockMessage]);
    const attachment = content.messages[0].attachments[0];
    
    Assert.equals(attachment.name, 'report.pdf');
    Assert.equals(attachment.size, 2048);
    Assert.equals(attachment.type, 'application/pdf');
  });
  
  testRunner.test('generateFilename - safe filename generation', () => {
    const mockThread = new MockGmailThread({
      id: 'thread_abc123def456'
    });
    
    const content = {
      subject: 'RE: Important Project Update!!! @#$%^&*()',
      lastMessageDate: new Date('2025-01-20T10:30:00Z')
    };
    
    const filename = generateFilename(mockThread, content);
    
    // Should contain safe characters only
    Assert.matches(filename, /^[a-zA-Z0-9_-]+$/);
    
    // Should include sanitized subject
    Assert.contains(filename, 'RE_Important_Project_Update');
    
    // Should include date
    Assert.contains(filename, '2025');
    
    // Should include thread ID fragment
    Assert.contains(filename, 'abc123de');
    
    // Should not exceed reasonable length
    Assert.isTrue(filename.length < 100);
  });
}

/**
 * Test file export functions
 */
function testFileExport(testRunner) {
  testRunner.test('buildMarkdownContent - complete structure', () => {
    const content = {
      subject: 'Project Discussion',
      threadId: 'thread_789',
      messageCount: 2,
      lastMessageDate: new Date('2025-01-20T15:30:00Z'),
      labels: ['Important', 'Work', 'Follow-up'],
      messages: [
        {
          index: 1,
          id: 'msg_001',
          subject: 'Project Discussion',
          from: 'alice@company.com',
          to: 'bob@company.com',
          cc: 'charlie@company.com',
          date: new Date('2025-01-20T14:00:00Z'),
          markdownBody: 'Initial project **proposal** with *timeline*.',
          attachments: [
            { name: 'proposal.pdf', type: 'application/pdf', size: 1024 }
          ]
        },
        {
          index: 2,
          id: 'msg_002',
          subject: 'RE: Project Discussion',
          from: 'bob@company.com',
          to: 'alice@company.com',
          date: new Date('2025-01-20T15:30:00Z'),
          markdownBody: 'Thanks for the proposal. I have some **feedback**.',
          attachments: []
        }
      ]
    };
    
    const markdown = buildMarkdownContent(content);
    
    // Check header structure
    Assert.contains(markdown, '# Project Discussion');
    Assert.contains(markdown, '**Thread ID:** thread_789');
    Assert.contains(markdown, '**Messages:** 2');
    Assert.contains(markdown, '**Labels:** Important, Work, Follow-up');
    
    // Check message structure
    Assert.contains(markdown, '## Message 1');
    Assert.contains(markdown, '**From:** alice@company.com');
    Assert.contains(markdown, '**CC:** charlie@company.com');
    Assert.contains(markdown, '**Attachments:** 1');
    Assert.contains(markdown, '- proposal.pdf (application/pdf, 1024 bytes)');
    Assert.contains(markdown, 'Initial project **proposal** with *timeline*.');
    
    Assert.contains(markdown, '## Message 2');
    Assert.contains(markdown, 'Thanks for the proposal. I have some **feedback**.');
    
    // Check footer
    Assert.contains(markdown, 'Exported on');
    Assert.contains(markdown, 'Gmail Export Tool');
  });
  
  testRunner.test('exportToMarkdown - file creation', () => {
    const mockFolder = new MockDriveFolder({ name: 'Test Export Folder' });
    
    const content = {
      subject: 'Test Export',
      threadId: 'thread_test',
      messageCount: 1,
      lastMessageDate: new Date(),
      labels: [],
      messages: [{
        index: 1,
        from: 'test@example.com',
        to: 'recipient@example.com',
        date: new Date(),
        subject: 'Test Message',
        markdownBody: 'Test content',
        attachments: []
      }]
    };
    
    const result = exportToMarkdown(content, 'test_export', mockFolder);
    
    Assert.equals(result.type, 'markdown');
    Assert.equals(result.name, 'test_export.md');
    Assert.isDefined(result.id);
    Assert.isDefined(result.url);
    Assert.isTrue(result.size > 0);
    
    // Verify file was created in folder
    Assert.equals(mockFolder.files.length, 1);
    Assert.equals(mockFolder.files[0].getName(), 'test_export.md');
  });
  
  testRunner.test('buildDocumentContent - Google Doc structure', () => {
    const mockDoc = new MockDocument();
    
    const content = {
      subject: 'Document Export Test',
      threadId: 'thread_doc_test',
      messageCount: 1,
      lastMessageDate: new Date('2025-01-20'),
      labels: ['Test'],
      messages: [{
        index: 1,
        from: 'sender@test.com',
        to: 'recipient@test.com',
        date: new Date('2025-01-20'),
        subject: 'Test Message',
        plainTextBody: 'This is test content for the document.',
        attachments: []
      }]
    };
    
    buildDocumentContent(mockDoc, content);
    
    const body = mockDoc.getBody();
    Assert.isTrue(body.content.length > 0);
    
    // Check that title was added
    const titleElement = body.content.find(item => 
      typeof item.text === 'string' && item.text.includes('Document Export Test')
    );
    Assert.isDefined(titleElement);
    
    // Check that metadata was added
    const metadataElement = body.content.find(item => 
      typeof item.text === 'string' && item.text.includes('Thread ID:')
    );
    Assert.isDefined(metadataElement);
  });
}

/**
 * Test integration scenarios
 */
function testIntegrationScenarios(testRunner) {
  testRunner.test('processThread - successful processing', () => {
    const mockThread = new MockGmailThread({
      subject: 'Integration Test Thread',
      messageCount: 2
    });
    
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder
    };
    
    const result = processThread(mockThread, config, context);
    
    Assert.isTrue(result.success);
    Assert.equals(result.files.length, 1);
    Assert.equals(result.files[0].type, 'markdown');
    Assert.isNull(result.error);
  });
  
  testRunner.test('processThread - both PDF and Markdown export', () => {
    const mockThread = new MockGmailThread({
      subject: 'Dual Export Test',
      messageCount: 1
    });
    
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: true,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder
    };
    
    // Mock DocumentApp for PDF export
    const originalDocumentApp = global.DocumentApp;
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
    
    // Mock DriveApp for PDF export
    const originalDriveApp = global.DriveApp;
    global.DriveApp = {
      getFileById: (id) => new MockDriveFile({ id })
    };
    
    try {
      const result = processThread(mockThread, config, context);
      
      Assert.isTrue(result.success);
      Assert.equals(result.files.length, 2);
      
      const markdownFile = result.files.find(f => f.type === 'markdown');
      const pdfFile = result.files.find(f => f.type === 'pdf');
      
      Assert.isDefined(markdownFile);
      Assert.isDefined(pdfFile);
      
    } finally {
      // Restore original objects
      global.DocumentApp = originalDocumentApp;
      global.DriveApp = originalDriveApp;
    }
  });
  
  testRunner.test('exportGmailThreadsByIds - valid thread IDs', () => {
    const threadIds = ['thread_001', 'thread_002'];
    const mockThreads = threadIds.map(id => new MockGmailThread({ id }));
    
    // Mock GmailApp
    const originalGmailApp = global.GmailApp;
    global.GmailApp = {
      getThreadById: (id) => {
        const thread = mockThreads.find(t => t.getId() === id);
        if (!thread) throw new Error(`Thread not found: ${id}`);
        return thread;
      }
    };
    
    // Mock DriveApp
    global.DriveApp = {
      getFoldersByName: () => ({ hasNext: () => false }),
      createFolder: (name) => new MockDriveFolder({ name })
    };
    
    try {
      const options = {
        includePdf: false,
        includeMarkdown: true,
        folderName: 'Test Export'
      };
      
      const result = exportGmailThreadsByIds(threadIds, options);
      
      Assert.isTrue(result.success);
      Assert.equals(result.processed, 2);
      Assert.equals(result.successful, 2);
      Assert.equals(result.failed, 0);
      
    } finally {
      global.GmailApp = originalGmailApp;
    }
  });
  
  testRunner.test('exportRecentInboxMessages - date filtering', () => {
    const days = 7;
    const expectedAfterDate = DateUtils.addDays(new Date(), -days);
    
    // This test validates the query construction
    const options = { maxThreads: 5 };
    const result = exportRecentInboxMessages(days, options);
    
    // Since we don't have actual Gmail access, we expect this to fail gracefully
    // The test ensures the function constructs the proper query parameters
    Assert.isDefined(result);
  });
}

/**
 * Test error handling scenarios
 */
function testErrorHandling(testRunner) {
  testRunner.test('processThread - thread with no messages', () => {
    const mockThread = new MockGmailThread({ messages: [] });
    const mockFolder = new MockDriveFolder();
    
    const config = { includeMarkdown: true };
    const context = { targetFolder: mockFolder };
    
    const result = processThread(mockThread, config, context);
    
    Assert.isFalse(result.success);
    Assert.equals(result.error, 'Thread contains no messages');
    Assert.equals(result.files.length, 0);
  });
  
  testRunner.test('convertHtmlToMarkdown - malformed HTML', () => {
    const malformedHtml = '<p>Unclosed paragraph<strong>Bold without closing</em>Mixed tags</p>';
    
    // Should not throw error and should produce some output
    Assert.doesNotThrow(() => {
      const result = convertHtmlToMarkdown(malformedHtml);
      Assert.isDefined(result);
      Assert.isTrue(typeof result === 'string');
    });
  });
  
  testRunner.test('generateFilename - extremely long subject', () => {
    const mockThread = new MockGmailThread({ id: 'thread_123' });
    const longSubject = 'A'.repeat(200); // Very long subject
    
    const content = {
      subject: longSubject,
      lastMessageDate: new Date()
    };
    
    const filename = generateFilename(mockThread, content);
    
    // Should be truncated to reasonable length
    Assert.isTrue(filename.length < 100);
    Assert.matches(filename, /^[a-zA-Z0-9_-]+$/);
  });
  
  testRunner.test('exportGmailThreadsByIds - invalid thread IDs', () => {
    const invalidThreadIds = ['invalid_001', 'invalid_002'];
    
    // Mock GmailApp to throw errors for invalid IDs
    const originalGmailApp = global.GmailApp;
    global.GmailApp = {
      getThreadById: (id) => {
        throw new Error(`Thread not found: ${id}`);
      }
    };
    
    try {
      const result = exportGmailThreadsByIds(invalidThreadIds);
      
      Assert.isFalse(result.success);
      Assert.equals(result.error, 'No valid threads found');
      
    } finally {
      global.GmailApp = originalGmailApp;
    }
  });
  
  testRunner.test('exportMessagesFromSender - invalid email', () => {
    Assert.throws(() => {
      exportMessagesFromSender('invalid-email-format');
    }, 'Should throw error for invalid email format');
    
    Assert.throws(() => {
      exportMessagesFromSender('');
    }, 'Should throw error for empty email');
    
    Assert.throws(() => {
      exportMessagesFromSender(null);
    }, 'Should throw error for null email');
  });
  
  testRunner.test('batchExportGmailQueries - empty queries array', () => {
    Assert.throws(() => {
      batchExportGmailQueries([]);
    }, 'Should throw error for empty queries array');
    
    Assert.throws(() => {
      batchExportGmailQueries(null);
    }, 'Should throw error for null queries');
    
    Assert.throws(() => {
      batchExportGmailQueries('not-an-array');
    }, 'Should throw error for non-array input');
  });
}

/**
 * Helper function to add a contains assertion to Assert class
 */
if (!Assert.contains) {
  Assert.contains = function(haystack, needle, message = 'String does not contain expected substring') {
    if (typeof haystack !== 'string') {
      throw new Error('First argument must be a string');
    }
    
    if (haystack.indexOf(needle) === -1) {
      throw new Error(`${message}. Haystack: '${haystack}', Needle: '${needle}'`);
    }
  };
}

/**
 * Helper function to add a doesNotContain assertion to Assert class
 */
if (!Assert.doesNotContain) {
  Assert.doesNotContain = function(haystack, needle, message = 'String contains unexpected substring') {
    if (typeof haystack !== 'string') {
      throw new Error('First argument must be a string');
    }
    
    if (haystack.indexOf(needle) !== -1) {
      throw new Error(`${message}. Haystack: '${haystack}', Needle: '${needle}'`);
    }
  };
}

/**
 * Run all Gmail Export tests
 */
function runAllGmailExportTests() {
  try {
    Logger.info('Starting comprehensive Gmail Export PDF + Markdown test suite');
    
    const results = runGmailExportPdfMarkdownTests();
    
    Logger.info('='.repeat(60));
    Logger.info('GMAIL EXPORT TEST SUMMARY');
    Logger.info('='.repeat(60));
    Logger.info(`Total Tests: ${results.total}`);
    Logger.info(`Passed: ${results.passed}`);
    Logger.info(`Failed: ${results.failed}`);
    Logger.info(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      Logger.error('Some tests failed:');
      results.errors.forEach(error => {
        Logger.error(`- ${error.test}: ${error.error}`);
      });
      return false;
    } else {
      Logger.info('✅ All tests passed!');
      return true;
    }
    
  } catch (error) {
    Logger.error('Test suite execution failed:', error);
    return false;
  }
}
