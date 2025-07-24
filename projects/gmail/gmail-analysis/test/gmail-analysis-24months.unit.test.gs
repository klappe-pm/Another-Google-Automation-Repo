/**
 * @fileoverview Unit tests for gmail-analysis-24months.gs
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-07-24
 * @lastmodified 2025-07-24
 */

/**
 * Unit tests for message processing functions
 */
function testMessageProcessingFunctions() {
  Logger.info('Running unit tests for message processing functions');
  
  try {
    testGetMessageSize();
    testGetMessageDate();
    testGetMessageSender();
    testGetMessageThreadId();
    testGetMessageInReplyTo();
    testProcessMessages();
    
    Logger.info('All unit tests passed for message processing functions');
  } catch (error) {
    Logger.error('Unit tests failed:', error);
    throw error;
  }
}

/**
 * Test getMessageSize function
 */
function testGetMessageSize() {
  Logger.info('Testing getMessageSize function');
  
  // Test with sizeEstimate property
  const message1 = { sizeEstimate: 1024 };
  const size1 = getMessageSize(message1);
  Assert.equal(size1, 1024, 'Should return sizeEstimate when available');
  
  // Test with size property
  const message2 = { size: 2048 };
  const size2 = getMessageSize(message2);
  Assert.equal(size2, 2048, 'Should return size when available');
  
  // Test with fallback to 0
  const message3 = {};
  const size3 = getMessageSize(message3);
  Assert.equal(size3, 0, 'Should return 0 when no size information available');
  
  Logger.info('getMessageSize tests passed');
}

/**
 * Test getMessageDate function
 */
function testGetMessageDate() {
  Logger.info('Testing getMessageDate function');
  
  // Test with internalDate property
  const message1 = { internalDate: '1640995200000' }; // 2022-01-01
  const date1 = getMessageDate(message1);
  Assert.isTrue(date1 instanceof Date, 'Should return Date object for internalDate');
  
  // Test with date property
  const testDate = new Date('2022-01-01');
  const message2 = { date: testDate };
  const date2 = getMessageDate(message2);
  Assert.equal(date2, testDate, 'Should return date property when available');
  
  // Test with fallback to current date
  const message3 = {};
  const date3 = getMessageDate(message3);
  Assert.isTrue(date3 instanceof Date, 'Should return Date object as fallback');
  
  Logger.info('getMessageDate tests passed');
}

/**
 * Test getMessageSender function
 */
function testGetMessageSender() {
  Logger.info('Testing getMessageSender function');
  
  // Test with payload headers
  const message1 = {
    payload: {
      headers: [{ name: 'From', value: 'test@example.com' }]
    }
  };
  const sender1 = getMessageSender(message1);
  Assert.equal(sender1, 'test@example.com', 'Should extract sender from payload headers');
  
  // Test with from property
  const message2 = { from: 'user@domain.com' };
  const sender2 = getMessageSender(message2);
  Assert.equal(sender2, 'user@domain.com', 'Should return from property when available');
  
  // Test with fallback to unknown
  const message3 = {};
  const sender3 = getMessageSender(message3);
  Assert.equal(sender3, 'unknown', 'Should return unknown as fallback');
  
  Logger.info('getMessageSender tests passed');
}

/**
 * Test getMessageThreadId function
 */
function testGetMessageThreadId() {
  Logger.info('Testing getMessageThreadId function');
  
  // Test with threadId property
  const message1 = { threadId: 'thread123' };
  const threadId1 = getMessageThreadId(message1);
  Assert.equal(threadId1, 'thread123', 'Should return threadId when available');
  
  // Test with fallback to null
  const message2 = {};
  const threadId2 = getMessageThreadId(message2);
  Assert.equal(threadId2, null, 'Should return null as fallback');
  
  Logger.info('getMessageThreadId tests passed');
}

/**
 * Test getMessageInReplyTo function
 */
function testGetMessageInReplyTo() {
  Logger.info('Testing getMessageInReplyTo function');
  
  // Test with In-Reply-To header
  const message1 = {
    payload: {
      headers: [{ name: 'In-Reply-To', value: '<message123@example.com>' }]
    }
  };
  const inReplyTo1 = getMessageInReplyTo(message1);
  Assert.equal(inReplyTo1, '<message123@example.com>', 'Should extract In-Reply-To from headers');
  
  // Test with isReply property
  const message2 = { isReply: true };
  const inReplyTo2 = getMessageInReplyTo(message2);
  Assert.equal(inReplyTo2, 'reply', 'Should return reply indicator when isReply is true');
  
  // Test with fallback to null
  const message3 = {};
  const inReplyTo3 = getMessageInReplyTo(message3);
  Assert.equal(inReplyTo3, null, 'Should return null as fallback');
  
  Logger.info('getMessageInReplyTo tests passed');
}

/**
 * Test processMessages function with mock data
 */
function testProcessMessages() {
  Logger.info('Testing processMessages function');
  
  // Create mock messages
  const mockMessages = [
    {
      sizeEstimate: 1024,
      internalDate: '1640995200000', // 2022-01-01
      payload: {
        headers: [{ name: 'From', value: 'user1@example.com' }]
      },
      threadId: 'thread1'
    },
    {
      sizeEstimate: 2048,
      internalDate: '1643673600000', // 2022-02-01
      payload: {
        headers: [
          { name: 'From', value: 'user2@example.com' },
          { name: 'In-Reply-To', value: '<msg1@example.com>' }
        ]
      },
      threadId: 'thread1'
    },
    {
      sizeEstimate: 512,
      internalDate: '1646265600000', // 2022-03-01
      payload: {
        headers: [{ name: 'From', value: 'user1@example.com' }]
      },
      threadId: 'thread2'
    }
  ];
  
  const results = processMessages(mockMessages);
  
  // Validate results structure
  Assert.isTrue(typeof results === 'object', 'Results should be an object');
  Assert.isTrue(typeof results.totalMessages === 'number', 'Should have totalMessages as number');
  Assert.isTrue(typeof results.totalSize === 'number', 'Should have totalSize as number');
  Assert.isTrue(typeof results.averageSize === 'number', 'Should have averageSize as number');
  Assert.isTrue(typeof results.monthlyBreakdown === 'object', 'Should have monthlyBreakdown as object');
  Assert.isTrue(typeof results.responseTimeStats === 'object', 'Should have responseTimeStats as object');
  Assert.isTrue(typeof results.senderStats === 'object', 'Should have senderStats as object');
  Assert.isTrue(typeof results.metadata === 'object', 'Should have metadata as object');
  
  // Validate calculated values
  Assert.equal(results.totalMessages, 3, 'Should count all messages correctly');
  Assert.equal(results.totalSize, 3584, 'Should sum all message sizes correctly'); // 1024 + 2048 + 512
  Assert.equal(results.averageSize, 1195, 'Should calculate average size correctly'); // 3584 / 3 rounded
  
  // Validate monthly breakdown
  Assert.isTrue(Object.keys(results.monthlyBreakdown).length > 0, 'Should have monthly breakdown data');
  
  // Validate sender stats
  Assert.isTrue(results.senderStats['user1@example.com'], 'Should track user1@example.com');
  Assert.isTrue(results.senderStats['user2@example.com'], 'Should track user2@example.com');
  Assert.equal(results.senderStats['user1@example.com'].count, 2, 'Should count user1 messages correctly');
  Assert.equal(results.senderStats['user2@example.com'].count, 1, 'Should count user2 messages correctly');
  
  Logger.info('processMessages tests passed');
}

/**
 * Test data validation functions
 */
function testDataValidation() {
  Logger.info('Running data validation tests');
  
  try {
    testValidateMessageStructure();
    testValidateResultStructure();
    
    Logger.info('All data validation tests passed');
  } catch (error) {
    Logger.error('Data validation tests failed:', error);
    throw error;
  }
}

/**
 * Test message structure validation
 */
function testValidateMessageStructure() {
  Logger.info('Testing message structure validation');
  
  const validMessage = {
    sizeEstimate: 1024,
    internalDate: '1640995200000',
    payload: {
      headers: [{ name: 'From', value: 'test@example.com' }]
    },
    threadId: 'thread123'
  };
  
  // Test valid message
  Assert.isTrue(isValidMessageStructure(validMessage), 'Valid message should pass validation');
  
  const invalidMessage = {
    // Missing required fields
  };
  
  // Test invalid message
  Assert.isFalse(isValidMessageStructure(invalidMessage), 'Invalid message should fail validation');
  
  Logger.info('Message structure validation tests passed');
}

/**
 * Helper function to validate message structure
 * @param {Object} message - Message to validate
 * @returns {boolean} True if valid
 */
function isValidMessageStructure(message) {
  if (!message || typeof message !== 'object') {
    return false;
  }
  
  // Check for at least one size field
  const hasSizeField = message.sizeEstimate || message.size || (message.getRawContent && typeof message.getRawContent === 'function');
  
  // Check for at least one date field
  const hasDateField = message.internalDate || message.date || (message.getDate && typeof message.getDate === 'function');
  
  return hasSizeField && hasDateField;
}

/**
 * Test result structure validation
 */
function testValidateResultStructure() {
  Logger.info('Testing result structure validation');
  
  const validResult = {
    totalMessages: 10,
    totalSize: 10240,
    averageSize: 1024,
    monthlyBreakdown: {},
    responseTimeStats: {
      totalResponseTime: 0,
      responseCount: 0,
      averageResponseTime: 0,
      fastestResponse: null,
      slowestResponse: null
    },
    senderStats: {},
    metadata: {
      analysisDate: new Date().toISOString(),
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString()
    }
  };
  
  Assert.isTrue(isValidResultStructure(validResult), 'Valid result should pass validation');
  
  const invalidResult = {
    totalMessages: 'invalid'
  };
  
  Assert.isFalse(isValidResultStructure(invalidResult), 'Invalid result should fail validation');
  
  Logger.info('Result structure validation tests passed');
}

/**
 * Helper function to validate result structure
 * @param {Object} result - Result to validate
 * @returns {boolean} True if valid
 */
function isValidResultStructure(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }
  
  const requiredFields = ['totalMessages', 'totalSize', 'averageSize', 'monthlyBreakdown', 'responseTimeStats', 'senderStats', 'metadata'];
  
  for (const field of requiredFields) {
    if (!(field in result)) {
      return false;
    }
  }
  
  // Validate number fields
  const numberFields = ['totalMessages', 'totalSize', 'averageSize'];
  for (const field of numberFields) {
    if (typeof result[field] !== 'number') {
      return false;
    }
  }
  
  // Validate object fields
  const objectFields = ['monthlyBreakdown', 'responseTimeStats', 'senderStats', 'metadata'];
  for (const field of objectFields) {
    if (typeof result[field] !== 'object' || result[field] === null) {
      return false;
    }
  }
  
  return true;
}

/**
 * Run all unit tests
 */
function runAllUnitTests() {
  Logger.info('Running all unit tests for gmail-analysis-24months');
  
  try {
    testMessageProcessingFunctions();
    testDataValidation();
    
    Logger.info('All unit tests passed successfully!');
    return true;
  } catch (error) {
    Logger.error('Unit tests failed:', error);
    return false;
  }
}