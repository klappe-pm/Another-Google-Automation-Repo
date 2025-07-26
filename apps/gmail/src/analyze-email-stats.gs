/**
 * Script Name: analyze-email-stats
 * 
 * Script Summary:
 * Processes Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Analyze email stats patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 * 
 * Script Steps:
 * 1. Connect to Gmail service
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Sort data by relevant fields
 * 5. Send notifications or reports
 * 
 * Script Functions:
 * - getGmailStats(): Gets specific gmail stats or configuration
 * - logStats(): Logs stats or messages
 * 
 * Script Helper Functions:
 * - extractEmailAddress(): Extracts specific information
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 */

const MAX_THREADS = 100; // Maximum number of threads to process;

// Main Functions

/**

 * Gets specific gmail stats or configuration
 * @param
 * @param {number} maxThreads - The maxThreads to retrieve
 * @returns {Array} The requested array

 */

function getGmailStats(maxThreads = MAX_THREADS) {
  try { // Retrieve inbox threads
    const threads = GmailApp.getInboxThreads(0, maxThreads);
    if (!threads || threads.length === 0) {
      Logger.log("No threads found in inbox.");
      return;
    } // Initialize statistics object
    let emailStats = {
      totalThreads: 0,
      totalMessages: 0,
      senders: {},
      labels: {},
      recentSubjects: [],
    }; // Process each thread
    threads.forEach(thread => {
      emailStats.totalThreads ++; const messages = thread.getMessages();
      emailStats.totalMessages += messages.length;

      messages.forEach(message => { // Extract sender email address;
        const sender = extractEmailAddress(message.getFrom());
        const subject = message.getSubject() || "(No Subject)";
        const labels = thread.getLabels().map(label => label.getName()); // Track sender frequency;
        emailStats.senders[sender] = (emailStats.senders[sender] || 0) + 1; // Track label frequency;
        labels.forEach(label => {
          emailStats.labels[label] = (emailStats.labels[label] || 0) + 1;
        }); // Track recent subjects (avoid duplicates)
        if (emailStats.recentSubjects.length < MAX_TOP_ITEMS && !emailStats.recentSubjects.includes(subject)) {
          emailStats.recentSubjects.push(subject);
        }
      });
    }); // Log the collected statistics
    logStats(emailStats);
  } catch (error) {
    Logger.log(`Error in getGmailStats: ${error.message}`);
  }
}

/**

 * Logs stats or messages
 * @param
 * @param {string} emailStats - The emailStats parameter
 * @returns {Array} Array of results

 */

function logStats(emailStats) {
  try {
    Logger.log("Gmail Statistics Summary:");
    Logger.log(`Total Threads: ${emailStats.totalThreads}`);
    Logger.log(`Total Messages: ${emailStats.totalMessages}`); // Log top senders;
    Logger.log("\nTop Senders:");
    const sortedSenders = Object.entries(emailStats.senders);
      .sort(([, a], [, b]) => b - a);
      .slice(0, MAX_TOP_ITEMS);
    if (sortedSenders.length === 0) {
      Logger.log(" - No senders found.");
    } else {
      sortedSenders.forEach(([sender, count]) => {
        Logger.log(` - ${sender}: ${count} messages`);
      });
    } // Log top labels
    Logger.log("\nTop Labels:");
    const sortedLabels = Object.entries(emailStats.labels);
      .sort(([, a], [, b]) => b - a);
      .slice(0, MAX_TOP_ITEMS);
    if (sortedLabels.length === 0) {
      Logger.log(" - No labels found.");
    } else {
      sortedLabels.forEach(([label, count]) => {
        Logger.log(` - ${label}: ${count} threads`);
      });
    } // Log recent subjects
    Logger.log("\nRecent Email Subjects:");
    if (emailStats.recentSubjects.length === 0) {
      Logger.log(" - No subjects found.");
    } else {
      emailStats.recentSubjects.forEach((subject, index) => {
        Logger.log(`${index + 1}. ${subject}`);
      });
    }

    Logger.log("\n --- End of Statistics --- ");
  } catch (error) {
    Logger.log(`Error in logStats: ${error.message}`);
  }
}

// Helper Functions

/**

 * Extracts specific information
 * @param
 * @param {any} sender - The sender parameter
 * @returns {Array} Array of results

 */

function extractEmailAddress(sender) {
  const emailMatch = sender.match( / < (. + ?) > / );
  return emailMatch ? emailMatch[1] : sender;
}