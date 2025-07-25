/**
 * Gmail Contact Extractor
 * 
 * This script extracts contact information from Gmail threads and messages
 * within the last 24 months. It compiles a list of unique contacts, including
 * their email addresses, names, first and last contact dates, and whether
 * the user has responded to them. The extracted information is then written
 * to the active sheet in the current Google Spreadsheet.
 */

/**
 * Main function to extract contact information from Gmail and populate a spreadsheet.
 */
function getContactList() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var contactList = [];

  try {
    Logger.log("Starting script execution");
    var threads = GmailApp.search('in:anywhere after:' + getDateXMonthsAgo(24));
    Logger.log("Number of threads found: " + threads.length);

    for (var i = 0; i < threads.length; i++) {
      try {
        Logger.log("Processing thread " + (i + 1) + " of " + threads.length);
        var messages = threads[i].getMessages();
        Logger.log("Number of messages in this thread: " + messages.length);
        var responded = false;
        
        for (var j = 0; j < messages.length; j++) {
          var message = messages[j];
          Logger.log("Processing message " + (j + 1) + " in thread " + (i + 1));
          
          var sender = message.getFrom();
          Logger.log("Sender: " + sender);
          
          // Extract email address
          var email = sender.match(/<(.+)>/);
          if (email && email[1]) {
            email = email[1];
          } else {
            email = sender;
          }
          Logger.log("Extracted email: " + email);
          
          // Extract name
          var name = sender.replace(/<.+>/, '').trim().split(' ');
          var firstName = name[0] || '';
          var lastName = name.slice(1).join(' ') || '';
          Logger.log("Extracted name: " + firstName + " " + lastName);
          
          var date = message.getDate();
          Logger.log("Message date: " + date);
          
          // Check if the user has responded in this thread
          if (message.getFrom().indexOf(Session.getEffectiveUser().getEmail()) !== -1) {
            responded = true;
            Logger.log("User has responded to this thread");
          }
          
          // Update or add contact to the list
          var existingContact = contactList.find(contact => contact.email === email);
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
              emailId: message.getId()
            });
          }
        }
      } catch (threadError) {
        Logger.log("Error processing thread " + (i + 1) + ": " + threadError.toString());
      }
    }

    Logger.log("Sorting contact list");
    contactList.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

    Logger.log("Writing to spreadsheet");
    sheet.clearContents();
    sheet.appendRow(['First Contact', 'Last Contact', 'Email', 'First Name', 'Last Name', 'Responded', 'Thread Link', 'Thread ID', 'Email ID']);

    contactList.forEach((contact, index) => {
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
 * Calculates the date X months ago from the current date.
 * @param {number} months - The number of months to subtract from the current date.
 * @return {string} A formatted date string in the format "yyyy/MM/dd".
 */
function getDateXMonthsAgo(months) {
  var date = new Date();
  date.setMonth(date.getMonth() - months);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
}
