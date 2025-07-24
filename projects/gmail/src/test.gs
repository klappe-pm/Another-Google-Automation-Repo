/**
 * Gmail Automation Test Suite
 * Service: Gmail
 * Purpose: Test core Gmail automation functions
 * Created: 2025-07-24
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/**
 * Basic test function to verify project setup
 */
function test() {
  Logger.log('Hello from Gmail Automation!');
  Logger.log('Project initialized successfully');
  return 'Gmail Automation is working!';
}

/**
 * Main function to run comprehensive Gmail tests
 */
function main() {
  Logger.log('=== Gmail Automation Test Suite ===');
  
  try {
    // Basic connectivity test
    test();
    
    // Test Gmail API access
    testGmailAccess();
    
    // Test Drive API access
    testDriveAccess();
    
    // Test basic Gmail operations
    testGmailOperations();
    
    Logger.log('=== All tests completed successfully ===');
    
  } catch (error) {
    Logger.log(`Error in main(): ${error.message}`);
    throw error;
  }
}

/**
 * Test Gmail API access and basic operations
 */
function testGmailAccess() {
  Logger.log('Testing Gmail API access...');
  
  try {
    // Test inbox access
    const threads = GmailApp.search('in:inbox', 0, 5);
    Logger.log(`✓ Gmail access confirmed - Found ${threads.length} threads in inbox`);
    
    // Test label access
    const labels = GmailApp.getUserLabels();
    Logger.log(`✓ Label access confirmed - Found ${labels.length} user labels`);
    
    return true;
  } catch (error) {
    Logger.log(`✗ Gmail access failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test Drive API access for file operations
 */
function testDriveAccess() {
  Logger.log('Testing Drive API access...');
  
  try {
    // Test root folder access
    const rootFolder = DriveApp.getRootFolder();
    Logger.log(`✓ Drive access confirmed - Root folder: ${rootFolder.getName()}`);
    
    // Test file listing
    const files = DriveApp.getFiles();
    let fileCount = 0;
    while (files.hasNext() && fileCount < 5) {
      files.next();
      fileCount++;
    }
    Logger.log(`✓ File listing confirmed - Can access files`);
    
    return true;
  } catch (error) {
    Logger.log(`✗ Drive access failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test basic Gmail operations that the automation scripts will use
 */
function testGmailOperations() {
  Logger.log('Testing Gmail operations...');
  
  try {
    // Test search functionality
    const recentThreads = GmailApp.search('newer_than:1d', 0, 3);
    Logger.log(`✓ Gmail search confirmed - Found ${recentThreads.length} recent threads`);
    
    // Test thread operations (read-only)
    if (recentThreads.length > 0) {
      const firstThread = recentThreads[0];
      const messages = firstThread.getMessages();
      Logger.log(`✓ Thread access confirmed - First thread has ${messages.length} messages`);
      
      // Test message metadata access
      if (messages.length > 0) {
        const firstMessage = messages[0];
        const subject = firstMessage.getSubject();
        const date = firstMessage.getDate();
        Logger.log(`✓ Message metadata access - Subject: "${subject.substring(0, 50)}...", Date: ${date}`);
      }
    }
    
    return true;
  } catch (error) {
    Logger.log(`✗ Gmail operations failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test configuration validation
 */
function testConfiguration() {
  Logger.log('Testing configuration...');
  
  try {
    // Test timezone setting
    const timeZone = Session.getScriptTimeZone();
    Logger.log(`✓ Timezone configured: ${timeZone}`);
    
    // Test quota information
    const gmailQuota = MailApp.getRemainingDailyQuota();
    Logger.log(`✓ Gmail quota remaining: ${gmailQuota}`);
    
    return true;
  } catch (error) {
    Logger.log(`✗ Configuration test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Utility function to get project information
 */
function getProjectInfo() {
  const info = {
    projectName: 'Gmail Automation - Dev',
    scriptId: '1fRuwT0EE6AdpDTlQLSL5w-jjA5kS7b4-HYRJFWYObV0kKvIiq1-o4JvJ',
    timezone: Session.getScriptTimeZone(),
    userEmail: Session.getActiveUser().getEmail(),
    executionDate: new Date().toISOString()
  };
  
  Logger.log('Project Information:');
  Logger.log(JSON.stringify(info, null, 2));
  
  return info;
}

/**
 * Run all available tests including configuration
 */
function runAllTests() {
  Logger.log('=== Comprehensive Gmail Automation Test Suite ===');
  
  try {
    getProjectInfo();
    testConfiguration();
    main();
    
    Logger.log('=== All comprehensive tests completed successfully ===');
    
  } catch (error) {
    Logger.log(`Error in runAllTests(): ${error.message}`);
    throw error;
  }
}
