/**
 * Script Name: mark- all- read
 *
 * Script Summary:
 * Manages email messages for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Connect to Gmail service
 * 2. Fetch source data
 * 3. Execute main operation
 * 4. Handle errors and edge cases
 * 5. Log completion status
 *
 * Script Functions:
 * - markAllEmailsAsRead(): Reads mark all emails as from source
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * /

/ / Main Functions

/**

 * Reads mark all emails as from source

 * /

function markAllEmailsAsRead() {
  let threads = GmailApp.getInboxThreads();
  for (let i = 0; i < threads.length; i + + ) {
    threads[i].markRead();
  }
}