/**
 * Mark All Gmail as Read
 * Version: 1.0.0
 * Last Updated: 2024-02-21
 * 
 * =====================================
 * SCRIPT SUMMARY
 * =====================================
 * Summary: This script processes all unread emails in a Gmail account and marks them as read
 * Purpose: To provide a quick way to mark all unread emails as read in bulk
 * Description: The script searches for unread emails in batches, marks them as read, and provides
 *             detailed logging of the process. It includes safety features to prevent timeout issues
 *             and verification steps to ensure emails are properly marked.
 * Problem: Users with large numbers of unread emails need an efficient way to mark them all as read
 * Success Criteria: All unread emails are marked as read, with detailed logs of the process and
 *                  confirmation of successful execution
 */

function markAllEmailsAsRead() {
  try {
    // Initialize logging
    Logger.log('=== Mark All Emails As Read - Execution Start ===');
    Logger.log(`Execution started at: ${new Date().toISOString()}`);
    
    // Set batch configuration
    const BATCH_SIZE = 100;
    Logger.log(`Batch size configured: ${BATCH_SIZE}`);
    
    // Initialize tracking variables
    let startIndex = 0;
    let totalProcessed = 0;
    const startTime = Date.now();
    
    // Get initial count
    Logger.log('Performing initial unread email count...');
    const initialCount = GmailApp.search('is:unread').length;
    Logger.log(`Initial unread thread count: ${initialCount}`);
    
    if (initialCount === 0) {
      Logger.log('No unread emails found. Script execution complete.');
      return;
    }
    
    // Main processing loop
    do {
      // Batch start logging
      Logger.log(`\n=== Processing Batch ${Math.floor(startIndex/BATCH_SIZE) + 1} ===`);
      Logger.log(`Starting index: ${startIndex}`);
      
      // Get thread batch
      const threads = GmailApp.search('is:unread', startIndex, BATCH_SIZE);
      Logger.log(`Retrieved ${threads.length} threads in current batch`);
      
      // Check for completion
      if (threads.length === 0) {
        Logger.log('No more unread threads found. Processing complete.');
        break;
      }
      
      // Process each thread in batch
      threads.forEach((thread, index) => {
        try {
          const subject = thread.getFirstMessageSubject() || '[No Subject]';
          const date = thread.getLastMessageDate();
          Logger.log(`Processing thread ${startIndex + index + 1}: "${subject}" from ${date}`);
        } catch (e) {
          Logger.log(`Error processing thread details at index ${index}: ${e.toString()}`);
        }
      });
      
      // Mark threads as read
      Logger.log('Marking batch as read...');
      try {
        GmailApp.markThreadsRead(threads);
        Logger.log('Batch successfully marked as read');
      } catch (e) {
        Logger.log(`Error marking batch as read: ${e.toString()}`);
        throw e;
      }
      
      // Update progress tracking
      totalProcessed += threads.length;
      startIndex += BATCH_SIZE;
      
      // Log progress statistics
      Logger.log(`Progress: ${totalProcessed}/${initialCount} threads processed`);
      
      // Check execution time limits
      const executionTime = (Date.now() - startTime) / 1000;
      Logger.log(`Current execution time: ${executionTime.toFixed(1)} seconds`);
      
      if (executionTime > 280) {
        Logger.log('WARNING: Approaching execution time limit. Stopping safely.');
        break;
      }
      
      // Verify batch processing
      const verificationCount = GmailApp.search('is:unread', startIndex - BATCH_SIZE, BATCH_SIZE).length;
      Logger.log(`Verification: ${verificationCount} threads remain unread in previous batch`);
      
    } while (true);
    
    // Generate final report
    const finalUnreadCount = GmailApp.search('is:unread').length;
    const totalTime = (Date.now() - startTime) / 1000;
    
    Logger.log('\n=== Final Execution Report ===');
    Logger.log(`Initial unread count: ${initialCount}`);
    Logger.log(`Threads processed: ${totalProcessed}`);
    Logger.log(`Remaining unread: ${finalUnreadCount}`);
    Logger.log(`Total execution time: ${totalTime.toFixed(1)} seconds`);
    Logger.log(`Success rate: ${((initialCount - finalUnreadCount) / initialCount * 100).toFixed(1)}%`);
    Logger.log('=== Script Execution Complete ===\n');
    
  } catch (error) {
    Logger.log('\n=== ERROR REPORT ===');
    Logger.log(`Error Type: ${error.name}`);
    Logger.log(`Error Message: ${error.message}`);
    Logger.log(`Stack Trace: ${error.stack}`);
    Logger.log('=== Script Execution Failed ===\n');
    throw error;
  }
}

function testGmailAccess() {
  Logger.log('\n=== Gmail Access Test - Start ===');
  try {
    // Test user authentication
    const user = Session.getActiveUser().getEmail();
    Logger.log(`Authenticated User: ${user}`);
    
    // Test inbox access
    const threads = GmailApp.getInboxThreads(0, 1);
    Logger.log(`Inbox Access: Success (Found ${threads.length} thread(s))`);
    
    // Test search functionality
    const unreadCount = GmailApp.search('is:unread').length;
    Logger.log(`Search Function: Success (Found ${unreadCount} unread threads)`);
    
    // Test complete
    Logger.log('=== Gmail Access Test - Success ===\n');
    return 'Gmail access verification completed successfully';
  } catch (error) {
    Logger.log(`Gmail Access Test - Failed: ${error.toString()}`);
    Logger.log('=== Gmail Access Test - Failed ===\n');
    throw error;
  }
}
