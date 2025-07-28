/**
 * Script Name: analyze- metadata- 24months
 *
 * Script Summary:
 * Processes spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Analyze metadata 24months patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Process and transform data
 * 5. Sort data by relevant fields
 * 6. Format output for presentation
 * 7. Send notifications or reports
 *
 * Script Functions:
 * - getContactList(): Gets specific contact list or configuration
 * - getDateXMonthsAgo(): Gets specific date x months ago or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

/**  * Main function to extract contact information from Gmail and populate a spreadsheet. *// *  *  * Calculates the date X months ago from the current date. * @param {number} months - The number of months to subtract from the current date. * @return {string} A formatted date string in the format "yyyy / MM / dd". *// / Main Functions

// Main Functions

/**

 * Gets specific contact list or configuration
 * @returns {string} The requested string

 */

function getContactList() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let contactList = [];

  try {
    Logger.log("Starting script execution");
    let threads = GmailApp.search('in:anywhere after:' + getDateXMonthsAgo(24));
    Logger.log("Number of threads found: " + threads.length);

    for (let i = 0; i < threads.length; i + + ) {
      try {
        Logger.log("Processing thread " + (i + 1) + " of " + threads.length);
        let messages = threads[i].getMessages();
        Logger.log("Number of messages in this thread: " + messages.length);
        let responded = false;

        for (let j = 0; j < messages.length; j + + ) {
          let message = messages[j];
          Logger.log("Processing message " + (j + 1) + " in thread " + (i + 1));

          let sender = message.getFrom();
          Logger.log("Sender: " + sender); // Extract email address;
          let email = sender.match( / < (. + ) > / );
          if (email && email[1]) {
            email = email[1];
          } else {
            email = sender;
          }
          Logger.log("Extracted email: " + email); // Extract name;
          let name = sender.replace( / < . + > / , '').trim().split(' ');
          let firstName = name[0] || '';
          let lastName = name.slice(1).join(' ') || '';
          Logger.log("Extracted name: " + firstName + " " + lastName);

          let date = message.getDate();
          Logger.log("Message date: " + date); // Check if the user has responded in this thread;
          if (message.getFrom().indexOf(Session.getEffectiveUser().getEmail()) ! = = - 1) {
            responded = true;
            Logger.log("User has responded to this thread");
          } // Update or add contact to the list
          let existingContact = contactList.find(contact = > contact.email = = = email);
          if (existingContact) {
            if (date < existingContact.firstContact) existingContact.firstContact = date;
            if (date > existingContact.lastContact) existingContact.lastContact = date;
            existingContact.responded = existingContact.responded || responded;
          } else {
            contactList.push({
              firstContact: date,
              lastContact: date,
              email: email,
              firstName: firstName,
              lastName: lastName,
              responded: responded,
              threadLink: threads[i].getPermalink(),
              threadId: threads[i].getId(),
              emailId: message.getId();
            });
          }
        }
      } catch (threadError) {
        Logger.log("Error processing thread " + (i + 1) + ": " + threadError.toString());
      }
    }

    Logger.log("Sorting contact list");
    contactList.sort((a, b) = > a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

    Logger.log("Writing to spreadsheet");
    sheet.clearContents();
    sheet.appendRow(['First Contact', 'Last Contact', 'Email', 'First Name', 'Last Name', 'Responded', 'Thread Link', 'Thread ID', 'Email ID']);

    contactList.forEach((contact, index) = > {
      try {
        sheet.appendRow([
          contact.firstContact,
          contact.lastContact,
          contact.email,
          contact.firstName,
          contact.lastName,
          contact.responded,
          contact.threadLink,
          contact.threadId,
          contact.emailId
        ]);
      } catch (rowError) {
        Logger.log("Error writing row " + (index + 1) + ": " + rowError.toString());
      }
    });

    Logger.log("Script execution completed");
  } catch (error) {
    Logger.log("Main error: " + error.toString());
    throw error;
  }
}

/**

 * Gets specific date x months ago or configuration
 * @param
 * @param {any} months - The months to retrieve
 * @returns {string} The requested string

 */

function getDateXMonthsAgo(months) {
  let date = new Date();
  date.setMonth(date.getMonth() - months);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy / MM / dd");
}