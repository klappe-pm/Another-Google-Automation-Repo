/**
 * @fileoverview Performance tests for Gmail Export PDF + Markdown functionality
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-01-20
 * @description Performance and load testing for Gmail export operations
 */

/**
 * Performance test configuration
 */
const PERFORMANCE_TEST_CONFIG = {
  // Test data sizes
  SMALL_DATASET: {
    threads: 5,
    messagesPerThread: 3,
    contentSize: 500 // characters
  },
  MEDIUM_DATASET: {
    threads: 25,
    messagesPerThread: 10,
    contentSize: 2000
  },
  LARGE_DATASET: {
    threads: 50,
    messagesPerThread: 20,
    contentSize: 5000
  },
  
  // Performance thresholds (milliseconds)
  THRESHOLDS: {
    HTML_TO_MARKDOWN_PER_KB: 50, // ms per KB of content
    THREAD_PROCESSING: 2000, // ms per thread
    FILE_CREATION: 1000, // ms per file
    BATCH_PROCESSING: 60000 // ms for full batch
  },
  
  // Memory usage limits
  MEMORY_LIMITS: {
    MAX_CONTENT_SIZE: 1024 * 1024, // 1MB per content item
    MAX_BATCH_SIZE: 10 * 1024 * 1024 // 10MB total batch
  }
};

/**
 * Performance testing utilities
 */
class PerformanceTestUtils {
  /**
   * Measure execution time of a function
   * @param {Function} fn Function to measure
   * @param {string} label Description for logging
   * @returns {Object} Result with timing information
   */
  static measureTime(fn, label = 'operation') {
    const startTime = new Date().getTime();
    let result;
    let error = null;
    
    try {
      result = fn();
    } catch (e) {
      error = e;
    }
    
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    Logger.debug(`Performance: ${label} took ${duration}ms`);
    
    return {
      result,
      error,
      duration,
      label
    };
  }
  
  /**
   * Generate test data for performance tests
   * @param {Object} config Test data configuration
   * @returns {Object[]} Array of mock Gmail threads
   */
  static generateTestData(config) {
    const threads = [];
    
    for (let i = 0; i < config.threads; i++) {
      const messages = [];
      
      for (let j = 0; j < config.messagesPerThread; j++) {
        const htmlContent = this.generateHtmlContent(config.contentSize);
        
        messages.push(new MockGmailMessage({
          id: `msg_${i}_${j}`,
          subject: `Performance Test Message ${j + 1}`,
          from: `sender${i}@example.com`,
          to: `recipient${j}@example.com`,
          htmlBody: htmlContent,
          plainTextBody: this.stripHtml(htmlContent),
          attachments: j % 3 === 0 ? [new MockGmailAttachment()] : [] // Every 3rd message has attachment
        }));
      }
      
      threads.push(new MockGmailThread({
        id: `thread_perf_${i}`,
        subject: `Performance Test Thread ${i + 1}`,
        messageCount: config.messagesPerThread,
        messages
      }));
    }
    
    return threads;
  }
  
  /**
   * Generate HTML content of specified size
   * @param {number} targetSize Target size in characters
   * @returns {string} Generated HTML content
   */
  static generateHtmlContent(targetSize) {
    const templates = [
      '<p>This is a <strong>performance test</strong> paragraph with <em>various</em> HTML elements.</p>',
      '<h2>Section Header</h2><p>Content under the header with <a href="https://example.com">links</a>.</p>',
      '<ul><li>List item with <code>code elements</code></li><li>Another item</li></ul>',
      '<blockquote><p>Quoted text for <strong>testing purposes</strong>.</p></blockquote>',
      '<div><span>Nested elements</span> with <em>formatting</em> and text content.</div>'
    ];
    
    let content = '';
    let templateIndex = 0;
    
    while (content.length < targetSize) {
      content += templates[templateIndex % templates.length] + '\n';
      templateIndex++;
    }
    
    return content.substring(0, targetSize);
  }
  
  /**
   * Strip HTML tags from content
   * @param {string} html HTML content
   * @returns {string} Plain text content
   */
  static stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
  
  /**
   * Calculate memory usage estimate for content
   * @param {Object} content Thread content object
   * @returns {number} Estimated memory usage in bytes
   */
  static estimateMemoryUsage(content) {
    const jsonString = JSON.stringify(content);
    return jsonString.length * 2; // Rough estimate: 2 bytes per character
  }
  
  /**
   * Validate performance against thresholds
   * @param {number} duration Measured duration in ms
   * @param {number} threshold Expected threshold in ms
   * @param {string} operation Operation name
   * @returns {boolean} Whether performance meets threshold
   */
  static validatePerformance(duration, threshold, operation) {
    const withinThreshold = duration <= threshold;
    const status = withinThreshold ? '✅ PASS' : '❌ FAIL';
    
    Logger.info(`Performance ${status}: ${operation} - ${duration}ms (threshold: ${threshold}ms)`);
    
    return withinThreshold;
  }
}

/**
 * Run performance tests for Gmail Export functionality
 */
function runGmailExportPerformanceTests() {
  Logger.info('Starting Gmail Export Performance Tests');
  Logger.info('='.repeat(50));
  
  const testRunner = new TestFramework();
  
  // HTML to Markdown conversion performance
  testHtmlToMarkdownPerformance(testRunner);
  
  // Thread processing performance
  testThreadProcessingPerformance(testRunner);
  
  // File export performance
  testFileExportPerformance(testRunner);
  
  // Batch processing performance
  testBatchProcessingPerformance(testRunner);
  
  // Memory usage tests
  testMemoryUsage(testRunner);
  
  // Scalability tests
  testScalability(testRunner);
  
  const results = testRunner.run();
  
  Logger.info('='.repeat(50));
  Logger.info('PERFORMANCE TEST SUMMARY');
  Logger.info('='.repeat(50));
  
  if (results.failed > 0) {
    Logger.error(`Performance tests failed: ${results.failed}/${results.total}`);
    results.errors.forEach(error => {
      Logger.error(`- ${error.test}: ${error.error}`);
    });
    return false;
  } else {
    Logger.info(`✅ All performance tests passed: ${results.passed}/${results.total}`);
    return true;
  }
}

/**
 * Test HTML to Markdown conversion performance
 */
function testHtmlToMarkdownPerformance(testRunner) {
  testRunner.test('HTML to Markdown - Small content performance', () => {
    const htmlContent = PerformanceTestUtils.generateHtmlContent(1000); // 1KB
    
    const measurement = PerformanceTestUtils.measureTime(
      () => convertHtmlToMarkdown(htmlContent),
      'HTML to Markdown (1KB)'
    );
    
    Assert.isNull(measurement.error);
    Assert.isDefined(measurement.result);
    
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.HTML_TO_MARKDOWN_PER_KB;
    Assert.isTrue(
      PerformanceTestUtils.validatePerformance(measurement.duration, threshold, 'HTML to Markdown (1KB)'),
      `HTML to Markdown conversion too slow: ${measurement.duration}ms > ${threshold}ms`
    );
  });
  
  testRunner.test('HTML to Markdown - Large content performance', () => {
    const htmlContent = PerformanceTestUtils.generateHtmlContent(10000); // 10KB
    
    const measurement = PerformanceTestUtils.measureTime(
      () => convertHtmlToMarkdown(htmlContent),
      'HTML to Markdown (10KB)'
    );
    
    Assert.isNull(measurement.error);
    Assert.isDefined(measurement.result);
    
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.HTML_TO_MARKDOWN_PER_KB * 10;
    Assert.isTrue(
      PerformanceTestUtils.validatePerformance(measurement.duration, threshold, 'HTML to Markdown (10KB)'),
      `HTML to Markdown conversion too slow for large content: ${measurement.duration}ms > ${threshold}ms`
    );
  });
  
  testRunner.test('HTML to Markdown - Complex HTML performance', () => {
    const complexHtml = `
      <div class="email-content">
        <h1>Complex Email Structure</h1>
        <div class="header">
          <p>Date: <span class="date">2025-01-20</span></p>
          <p>From: <a href="mailto:sender@example.com">sender@example.com</a></p>
        </div>
        <div class="body">
          <h2>Main Content</h2>
          <p>This email contains <strong>bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p>
          <ul class="features">
            <li>Feature 1 with <code>inline code</code></li>
            <li>Feature 2 with <a href="https://example.com">external link</a></li>
            <li>Feature 3 with nested <strong><em>formatting</em></strong></li>
          </ul>
          <blockquote class="quote">
            <p>This is a <strong>quoted section</strong> with formatting.</p>
            <p>Multiple paragraphs in the quote.</p>
          </blockquote>
          <table class="data">
            <tr><th>Column 1</th><th>Column 2</th></tr>
            <tr><td>Data 1</td><td>Data 2</td></tr>
          </table>
        </div>
        <div class="footer">
          <p><small>Footer content with <a href="#">links</a></small></p>
        </div>
      </div>
    `.repeat(5); // Repeat to make it larger
    
    const measurement = PerformanceTestUtils.measureTime(
      () => convertHtmlToMarkdown(complexHtml),
      'Complex HTML to Markdown'
    );
    
    Assert.isNull(measurement.error);
    Assert.isDefined(measurement.result);
    
    // Allow more time for complex HTML
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.HTML_TO_MARKDOWN_PER_KB * 2;
    Assert.isTrue(
      measurement.duration <= threshold,
      `Complex HTML conversion too slow: ${measurement.duration}ms > ${threshold}ms`
    );
  });
}

/**
 * Test thread processing performance
 */
function testThreadProcessingPerformance(testRunner) {
  testRunner.test('Thread processing - Small dataset', () => {
    const threads = PerformanceTestUtils.generateTestData(PERFORMANCE_TEST_CONFIG.SMALL_DATASET);
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder
    };
    
    const measurement = PerformanceTestUtils.measureTime(
      () => {
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        
        threads.forEach(thread => {
          const result = processThread(thread, config, context);
          results.processed++;
          if (result.success) {
            results.successful++;
            results.files.push(...result.files);
          } else {
            results.failed++;
          }
        });
        
        return results;
      },
      `Small dataset processing (${threads.length} threads)`
    );
    
    Assert.isNull(measurement.error);
    Assert.equals(measurement.result.processed, threads.length);
    Assert.equals(measurement.result.successful, threads.length);
    
    const avgTimePerThread = measurement.duration / threads.length;
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.THREAD_PROCESSING;
    
    Assert.isTrue(
      PerformanceTestUtils.validatePerformance(avgTimePerThread, threshold, 'Average thread processing'),
      `Thread processing too slow: ${avgTimePerThread}ms per thread > ${threshold}ms`
    );
  });
  
  testRunner.test('Thread processing - Medium dataset', () => {
    const threads = PerformanceTestUtils.generateTestData(PERFORMANCE_TEST_CONFIG.MEDIUM_DATASET);
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder
    };
    
    const measurement = PerformanceTestUtils.measureTime(
      () => {
        // Process in smaller batches to simulate real-world usage
        const batchSize = 10;
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        
        for (let i = 0; i < threads.length; i += batchSize) {
          const batch = threads.slice(i, i + batchSize);
          
          batch.forEach(thread => {
            const result = processThread(thread, config, context);
            results.processed++;
            if (result.success) {
              results.successful++;
              results.files.push(...result.files);
            } else {
              results.failed++;
            }
          });
        }
        
        return results;
      },
      `Medium dataset processing (${threads.length} threads)`
    );
    
    Assert.isNull(measurement.error);
    Assert.equals(measurement.result.processed, threads.length);
    
    const avgTimePerThread = measurement.duration / threads.length;
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.THREAD_PROCESSING;
    
    Assert.isTrue(
      avgTimePerThread <= threshold,
      `Medium dataset thread processing too slow: ${avgTimePerThread}ms per thread > ${threshold}ms`
    );
  });
}

/**
 * Test file export performance
 */
function testFileExportPerformance(testRunner) {
  testRunner.test('Markdown export performance', () => {
    const content = {
      subject: 'Performance Test Export',
      threadId: 'perf_thread_123',
      messageCount: 10,
      lastMessageDate: new Date(),
      labels: ['Performance', 'Test'],
      messages: []
    };
    
    // Generate multiple messages with varying content sizes
    for (let i = 0; i < 10; i++) {
      content.messages.push({
        index: i + 1,
        id: `perf_msg_${i}`,
        subject: `Performance Message ${i + 1}`,
        from: `sender${i}@example.com`,
        to: 'recipient@example.com',
        date: new Date(),
        markdownBody: PerformanceTestUtils.generateHtmlContent(1000 + (i * 500)),
        attachments: i % 2 === 0 ? [{ name: `file${i}.pdf`, type: 'application/pdf', size: 2048 }] : []
      });
    }
    
    const mockFolder = new MockDriveFolder();
    
    const measurement = PerformanceTestUtils.measureTime(
      () => exportToMarkdown(content, 'performance_test', mockFolder),
      'Markdown export'
    );
    
    Assert.isNull(measurement.error);
    Assert.isDefined(measurement.result);
    Assert.equals(measurement.result.type, 'markdown');
    
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.FILE_CREATION;
    Assert.isTrue(
      PerformanceTestUtils.validatePerformance(measurement.duration, threshold, 'Markdown export'),
      `Markdown export too slow: ${measurement.duration}ms > ${threshold}ms`
    );
  });
  
  testRunner.test('Batch file creation performance', () => {
    const mockFolder = new MockDriveFolder();
    const fileCount = 20;
    const files = [];
    
    const measurement = PerformanceTestUtils.measureTime(
      () => {
        for (let i = 0; i < fileCount; i++) {
          const content = {
            subject: `Batch Test ${i}`,
            threadId: `batch_thread_${i}`,
            messageCount: 1,
            lastMessageDate: new Date(),
            labels: [],
            messages: [{
              index: 1,
              id: `batch_msg_${i}`,
              subject: `Batch Message ${i}`,
              from: 'sender@example.com',
              to: 'recipient@example.com',
              date: new Date(),
              markdownBody: `Batch test content ${i}`,
              attachments: []
            }]
          };
          
          const file = exportToMarkdown(content, `batch_test_${i}`, mockFolder);
          files.push(file);
        }
        
        return files;
      },
      `Batch file creation (${fileCount} files)`
    );
    
    Assert.isNull(measurement.error);
    Assert.equals(measurement.result.length, fileCount);
    
    const avgTimePerFile = measurement.duration / fileCount;
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.FILE_CREATION;
    
    Assert.isTrue(
      avgTimePerFile <= threshold,
      `Batch file creation too slow: ${avgTimePerFile}ms per file > ${threshold}ms`
    );
  });
}

/**
 * Test batch processing performance
 */
function testBatchProcessingPerformance(testRunner) {
  testRunner.test('Full batch processing performance', () => {
    const threads = PerformanceTestUtils.generateTestData(PERFORMANCE_TEST_CONFIG.MEDIUM_DATASET);
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder,
      startTime: new Date(),
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      generatedFiles: []
    };
    
    const measurement = PerformanceTestUtils.measureTime(
      () => processThreadsBatch(threads, config, context),
      `Full batch processing (${threads.length} threads)`
    );
    
    Assert.isNull(measurement.error);
    Assert.equals(measurement.result.processed, threads.length);
    
    const threshold = PERFORMANCE_TEST_CONFIG.THRESHOLDS.BATCH_PROCESSING;
    Assert.isTrue(
      PerformanceTestUtils.validatePerformance(measurement.duration, threshold, 'Full batch processing'),
      `Batch processing too slow: ${measurement.duration}ms > ${threshold}ms`
    );
  });
  
  testRunner.test('Large dataset processing simulation', () => {
    // Create a smaller sample but simulate large dataset processing
    const sampleThreads = PerformanceTestUtils.generateTestData({
      threads: 10,
      messagesPerThread: 5,
      contentSize: 2000
    });
    
    const mockFolder = new MockDriveFolder();
    
    const config = {
      includePdf: false,
      includeMarkdown: true
    };
    
    const context = {
      targetFolder: mockFolder
    };
    
    const measurement = PerformanceTestUtils.measureTime(
      () => {
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        
        // Simulate processing with delays (as would occur in real Gmail API usage)
        sampleThreads.forEach((thread, index) => {
          const result = processThread(thread, config, context);
          
          results.processed++;
          if (result.success) {
            results.successful++;
            results.files.push(...result.files);
          } else {
            results.failed++;
          }
          
          // Simulate processing delay
          if (index < sampleThreads.length - 1) {
            Utilities.sleep(PDF_MARKDOWN_CONFIG.PROCESSING_DELAY);
          }
        });
        
        return results;
      },
      'Large dataset simulation'
    );
    
    Assert.isNull(measurement.error);
    Assert.equals(measurement.result.processed, sampleThreads.length);
    
    // Calculate performance per thread including delays
    const avgTimePerThread = measurement.duration / sampleThreads.length;
    const maxAcceptableTime = PERFORMANCE_TEST_CONFIG.THRESHOLDS.THREAD_PROCESSING + PDF_MARKDOWN_CONFIG.PROCESSING_DELAY;
    
    Assert.isTrue(
      avgTimePerThread <= maxAcceptableTime,
      `Large dataset simulation too slow: ${avgTimePerThread}ms per thread > ${maxAcceptableTime}ms`
    );
  });
}

/**
 * Test memory usage patterns
 */
function testMemoryUsage(testRunner) {
  testRunner.test('Memory usage - Single thread content', () => {
    const thread = PerformanceTestUtils.generateTestData({
      threads: 1,
      messagesPerThread: 10,
      contentSize: 5000
    })[0];
    
    const content = generateThreadContent(thread, thread.getMessages());
    const memoryUsage = PerformanceTestUtils.estimateMemoryUsage(content);
    
    Logger.info(`Single thread memory usage: ${Math.round(memoryUsage / 1024)}KB`);
    
    Assert.isTrue(
      memoryUsage <= PERFORMANCE_TEST_CONFIG.MEMORY_LIMITS.MAX_CONTENT_SIZE,
      `Single thread content too large: ${memoryUsage} bytes > ${PERFORMANCE_TEST_CONFIG.MEMORY_LIMITS.MAX_CONTENT_SIZE} bytes`
    );
  });
  
  testRunner.test('Memory usage - Batch content', () => {
    const threads = PerformanceTestUtils.generateTestData({
      threads: 10,
      messagesPerThread: 5,
      contentSize: 2000
    });
    
    let totalMemoryUsage = 0;
    
    threads.forEach(thread => {
      const content = generateThreadContent(thread, thread.getMessages());
      totalMemoryUsage += PerformanceTestUtils.estimateMemoryUsage(content);
    });
    
    Logger.info(`Batch memory usage: ${Math.round(totalMemoryUsage / 1024 / 1024)}MB`);
    
    Assert.isTrue(
      totalMemoryUsage <= PERFORMANCE_TEST_CONFIG.MEMORY_LIMITS.MAX_BATCH_SIZE,
      `Batch content too large: ${totalMemoryUsage} bytes > ${PERFORMANCE_TEST_CONFIG.MEMORY_LIMITS.MAX_BATCH_SIZE} bytes`
    );
  });
  
  testRunner.test('Memory efficiency - Content reuse', () => {
    const thread = PerformanceTestUtils.generateTestData({
      threads: 1,
      messagesPerThread: 5,
      contentSize: 1000
    })[0];
    
    // Measure memory usage when processing the same thread multiple times
    const measurements = [];
    
    for (let i = 0; i < 3; i++) {
      const measurement = PerformanceTestUtils.measureTime(
        () => {
          const content = generateThreadContent(thread, thread.getMessages());
          return PerformanceTestUtils.estimateMemoryUsage(content);
        },
        `Memory measurement ${i + 1}`
      );
      
      measurements.push(measurement.result);
    }
    
    // All measurements should be similar (no memory leaks)
    const avgMemory = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxDeviation = Math.max(...measurements.map(m => Math.abs(m - avgMemory)));
    const maxAllowedDeviation = avgMemory * 0.1; // 10% deviation allowed
    
    Assert.isTrue(
      maxDeviation <= maxAllowedDeviation,
      `Memory usage inconsistent across runs: max deviation ${maxDeviation} > ${maxAllowedDeviation}`
    );
  });
}

/**
 * Test scalability characteristics
 */
function testScalability(testRunner) {
  testRunner.test('Scalability - Linear time complexity', () => {
    const smallDataset = PerformanceTestUtils.generateTestData({
      threads: 5,
      messagesPerThread: 2,
      contentSize: 1000
    });
    
    const largeDataset = PerformanceTestUtils.generateTestData({
      threads: 20, // 4x larger
      messagesPerThread: 2,
      contentSize: 1000
    });
    
    const mockFolder = new MockDriveFolder();
    const config = { includePdf: false, includeMarkdown: true };
    const context = { targetFolder: mockFolder };
    
    // Measure small dataset
    const smallMeasurement = PerformanceTestUtils.measureTime(
      () => {
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        smallDataset.forEach(thread => {
          const result = processThread(thread, config, context);
          results.processed++;
          if (result.success) results.successful++;
        });
        return results;
      },
      'Small dataset scalability test'
    );
    
    // Measure large dataset
    const largeMeasurement = PerformanceTestUtils.measureTime(
      () => {
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        largeDataset.forEach(thread => {
          const result = processThread(thread, config, context);
          results.processed++;
          if (result.success) results.successful++;
        });
        return results;
      },
      'Large dataset scalability test'
    );
    
    // Calculate scaling factor
    const sizeRatio = largeDataset.length / smallDataset.length;
    const timeRatio = largeMeasurement.duration / smallMeasurement.duration;
    
    Logger.info(`Scalability: ${sizeRatio}x data took ${timeRatio.toFixed(2)}x time`);
    
    // Time should scale roughly linearly (allow some overhead)
    const maxAcceptableRatio = sizeRatio * 1.5; // 50% overhead allowed
    
    Assert.isTrue(
      timeRatio <= maxAcceptableRatio,
      `Poor scalability: ${timeRatio.toFixed(2)}x time for ${sizeRatio}x data (max acceptable: ${maxAcceptableRatio.toFixed(2)}x)`
    );
  });
  
  testRunner.test('Scalability - Message count impact', () => {
    const fewMessages = PerformanceTestUtils.generateTestData({
      threads: 5,
      messagesPerThread: 2,
      contentSize: 1000
    });
    
    const manyMessages = PerformanceTestUtils.generateTestData({
      threads: 5,
      messagesPerThread: 10, // 5x more messages per thread
      contentSize: 1000
    });
    
    const mockFolder = new MockDriveFolder();
    const config = { includePdf: false, includeMarkdown: true };
    const context = { targetFolder: mockFolder };
    
    // Test few messages per thread
    const fewMeasurement = PerformanceTestUtils.measureTime(
      () => {
        return fewMessages.map(thread => 
          processThread(thread, config, context)
        );
      },
      'Few messages per thread'
    );
    
    // Test many messages per thread
    const manyMeasurement = PerformanceTestUtils.measureTime(
      () => {
        return manyMessages.map(thread => 
          processThread(thread, config, context)
        );
      },
      'Many messages per thread'
    );
    
    const messageRatio = 10 / 2; // 5x more messages
    const timeRatio = manyMeasurement.duration / fewMeasurement.duration;
    
    Logger.info(`Message scalability: ${messageRatio}x messages took ${timeRatio.toFixed(2)}x time`);
    
    // Should scale reasonably with message count
    const maxAcceptableRatio = messageRatio * 1.3; // 30% overhead allowed
    
    Assert.isTrue(
      timeRatio <= maxAcceptableRatio,
      `Poor message count scalability: ${timeRatio.toFixed(2)}x time for ${messageRatio}x messages`
    );
  });
}

/**
 * Run comprehensive performance benchmarks
 */
function runPerformanceBenchmarks() {
  Logger.info('Starting Gmail Export Performance Benchmarks');
  Logger.info('='.repeat(60));
  
  const benchmarks = {
    htmlConversion: [],
    threadProcessing: [],
    fileExport: [],
    memoryUsage: []
  };
  
  // HTML Conversion Benchmarks
  Logger.info('Benchmarking HTML to Markdown conversion...');
  const htmlSizes = [500, 1000, 2000, 5000, 10000];
  
  htmlSizes.forEach(size => {
    const html = PerformanceTestUtils.generateHtmlContent(size);
    const measurement = PerformanceTestUtils.measureTime(
      () => convertHtmlToMarkdown(html),
      `HTML Conversion (${size} chars)`
    );
    
    benchmarks.htmlConversion.push({
      size,
      duration: measurement.duration,
      throughput: size / measurement.duration // chars per ms
    });
  });
  
  // Thread Processing Benchmarks
  Logger.info('Benchmarking thread processing...');
  const threadCounts = [1, 5, 10, 25];
  
  threadCounts.forEach(count => {
    const threads = PerformanceTestUtils.generateTestData({
      threads: count,
      messagesPerThread: 5,
      contentSize: 2000
    });
    
    const mockFolder = new MockDriveFolder();
    const config = { includePdf: false, includeMarkdown: true };
    const context = { targetFolder: mockFolder };
    
    const measurement = PerformanceTestUtils.measureTime(
      () => {
        const results = { processed: 0, successful: 0, failed: 0, files: [] };
        threads.forEach(thread => {
          const result = processThread(thread, config, context);
          results.processed++;
          if (result.success) results.successful++;
        });
        return results;
      },
      `Thread Processing (${count} threads)`
    );
    
    benchmarks.threadProcessing.push({
      threadCount: count,
      duration: measurement.duration,
      avgPerThread: measurement.duration / count
    });
  });
  
  // Print benchmark results
  Logger.info('\n' + '='.repeat(60));
  Logger.info('BENCHMARK RESULTS');
  Logger.info('='.repeat(60));
  
  Logger.info('\nHTML to Markdown Conversion:');
  benchmarks.htmlConversion.forEach(result => {
    Logger.info(`  ${result.size} chars: ${result.duration}ms (${result.throughput.toFixed(2)} chars/ms)`);
  });
  
  Logger.info('\nThread Processing:');
  benchmarks.threadProcessing.forEach(result => {
    Logger.info(`  ${result.threadCount} threads: ${result.duration}ms (${result.avgPerThread.toFixed(1)}ms/thread)`);
  });
  
  return benchmarks;
}

/**
 * Main performance test runner
 */
function runAllPerformanceTests() {
  try {
    Logger.info('Gmail Export Performance Test Suite Starting...');
    
    // Run unit performance tests
    const testResults = runGmailExportPerformanceTests();
    
    if (testResults) {
      // Run benchmarks if tests pass
      Logger.info('\nRunning performance benchmarks...');
      const benchmarks = runPerformanceBenchmarks();
      
      Logger.info('\n' + '='.repeat(60));
      Logger.info('PERFORMANCE TEST SUITE COMPLETED SUCCESSFULLY');
      Logger.info('='.repeat(60));
      
      return { testResults, benchmarks };
    } else {
      Logger.error('Performance tests failed - skipping benchmarks');
      return { testResults: false, benchmarks: null };
    }
    
  } catch (error) {
    Logger.error('Performance test suite failed:', error);
    return { testResults: false, benchmarks: null, error: error.message };
  }
}
