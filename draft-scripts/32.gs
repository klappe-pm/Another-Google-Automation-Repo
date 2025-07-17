/**
 * Script Name: GmailStatsAnalyzer
 * Description: Analyzes Gmail inbox threads to generate statistics on total threads, messages,
 *              top senders, labels, and recent email subjects. Logs results to the Google Apps Script Logger.
 * 
 * Functions:
 * - getGmailStats(maxThreads): Retrieves and processes Gmail threads to collect statistics.
 * - logStats(emailStats): Logs formatted statistics to the Logger.
 * - extractEmailAddress(sender): Extracts the email address from a sender string.
 */

const MAX_THREADS = 100; // Maximum number of threads to process
const MAX_TOP_ITEMS = 10; // Maximum number of top senders/labels/subjects to display

/**
 * Retrieves and processes Gmail threads to collect statistics on threads, messages, senders, labels, and subjects.
 * @param {number} maxThreads - Maximum number of threads to retrieve (default: 100).
 * @returns {void}
 */
function getGmailStats(maxThreads = MAX_THREADS) {
  try {
    // Retrieve inbox threads
    const threads = GmailApp.getInboxThreads(0, maxThreads);
    if (!threads || threads.length === 0) {
      Logger.log("No threads found in inbox.");
      return;
    }

    // Initialize statistics object
    let emailStats = {
      totalThreads: 0,
      totalMessages: 0,
      senders: {},
      labels: {},
      recentSubjects: [],
    };

    // Process each thread
    threads.forEach(thread => {
      emailStats.totalThreads++;
      const messages = thread.getMessages();
      emailStats.totalMessages += messages.length;

      messages.forEach(message => {
        // Extract sender email address
        const sender = extractEmailAddress(message.getFrom());
        const subject = message.getSubject() || "(No Subject)";
        const labels = thread.getLabels().map(label => label.getName());

        // Track sender frequency
        emailStats.senders[sender] = (emailStats.senders[sender] || 0) + 1;

        // Track label frequency
        labels.forEach(label => {
          emailStats.labels[label] = (emailStats.labels[label] || 0) + 1;
        });

        // Track recent subjects (avoid duplicates)
        if (emailStats.recentSubjects.length < MAX_TOP_ITEMS && 
            !emailStats.recentSubjects.includes(subject)) {
          emailStats.recentSubjects.push(subject);
        }
      });
    });

    // Log the collected statistics
    logStats(emailStats);
  } catch (error) {
    Logger.log(`Error in getGmailStats: ${error.message}`);
  }
}

/**
 * Logs formatted Gmail statistics to the Google Apps Script Logger.
 * @param {Object} emailStats - Statistics object containing threads, messages, senders, labels, and subjects.
 * @returns {void}
 */
function logStats(emailStats) {
  try {
    Logger.log("Gmail Statistics Summary:");
    Logger.log(`Total Threads: ${emailStats.totalThreads}`);
    Logger.log(`Total Messages: ${emailStats.totalMessages}`);

    // Log top senders
    Logger.log("\nTop Senders:");
    const sortedSenders = Object.entries(emailStats.senders)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_TOP_ITEMS);
    if (sortedSenders.length === 0) {
      Logger.log("- No senders found.");
    } else {
      sortedSenders.forEach(([sender, count]) => {
        Logger.log(`- ${sender}: ${count} messages`);
      });
    }

    // Log top labels
    Logger.log("\nTop Labels:");
    const sortedLabels = Object.entries(emailStats.labels)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_TOP_ITEMS);
    if (sortedLabels.length === 0) {
      Logger.log("- No labels found.");
    } else {
      sortedLabels.forEach(([label, count]) => {
        Logger.log(`- ${label}: ${count} threads`);
      });
    }

    // Log recent subjects
    Logger.log("\nRecent Email Subjects:");
    if (emailStats.recentSubjects.length === 0) {
      Logger.log("- No subjects found.");
    } else {
      emailStats.recentSubjects.forEach((subject, index) => {
        Logger.log(`${index + 1}. ${subject}`);
      });
    }

    Logger.log("\n--- End of Statistics ---");
  } catch (error) {
    Logger.log(`Error in logStats: ${error.message}`);
  }
}

/**
 * Extracts the email address from a sender string (e.g., "John Doe <john@example.com>" -> "john@example.com").
 * @param {string} sender - The sender string from an email.
 * @returns {string} The extracted email address or the original string if no email is found.
 */
function extractEmailAddress(sender) {
  const emailMatch = sender.match(/<(.+?)>/);
  return emailMatch ? emailMatch[1] : sender;
}