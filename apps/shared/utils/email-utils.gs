/**
  * Script Name: email-utils
  *
  * Script Summary:
  * Shared utility functions for email processing in Google Apps Script.
  *
  * Script Purpose:
  * - Extract email addresses and names from sender strings
  * - Parse email messages into structured data
  * - Provide consistent email handling across all scripts
  *
  * Script Functions:
  * - extractEmail(): Extract email address from sender string
  * - extractName(): Extract display name from sender string
  * - parseEmailData(): Parse email message into structured data
  * - extractEmailAddress(): Alternative email extraction method
  * - validateEmailAddress(): Validate email format
  * - getEmailDomain(): Extract domain from email address
  * - formatSenderInfo(): Format sender information consistently
  *
  * Script Dependencies:
  * - None (standalone utility module)
  *
  * Google Services:
  * - GmailApp: For email message handling (when passed as parameter)
  */

/**
  * Extracts email address from a sender string
  * @param {string} fromString - The sender string (e.g., "John Doe <john@example.com>")
  * @returns {string} The extracted email address
  */
function extractEmail(fromString) {
  if (!fromString) return '';

  // First try to match email in angle brackets
  const emailMatch = fromString.match(/<(.+?)>/);
  if (emailMatch) return emailMatch[1];

  // Then try to match standalone email
  const emailOnlyMatch = fromString.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  return emailOnlyMatch ? emailOnlyMatch[0] : fromString;
}

/**
  * Extracts display name from a sender string
  * @param {string} fromString - The sender string (e.g., "John Doe <john@example.com>")
  * @returns {string} The extracted display name
  */
function extractName(fromString) {
  if (!fromString) return 'No display name';

  // Check for email in angle brackets
  const emailMatch = fromString.match(/<(.+?)>/);
  if (emailMatch) {
    const name = fromString.replace(emailMatch[0], '').trim();
    return name || 'No display name';
  }

  // Check for standalone email
  const emailPart = fromString.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailPart) {
    const name = fromString.replace(emailPart[0], '').trim();
    return name || 'No display name';
  }

  return fromString;
}

/**
  * Alternative email extraction method (for compatibility)
  * @param {string} sender - The sender string
  * @returns {string} The extracted email address
  */
function extractEmailAddress(sender) {
  return extractEmail(sender);
}

/**
  * Validates email address format
  * @param {string} email - The email address to validate
  * @returns {boolean} True if valid email format
  */
function validateEmailAddress(email) {
  const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w{2,}$/;
  return emailRegex.test(email);
}

/**
  * Extracts domain from email address
  * @param {string} email - The email address
  * @returns {string} The domain part of the email
  */
function getEmailDomain(email) {
  const cleanEmail = extractEmail(email);
  const parts = cleanEmail.split('@');
  return parts.length === 2 ? parts[1] : '';
}

/**
  * Formats sender information consistently
  * @param {string} fromString - The raw sender string
  * @returns {Object} Object with email, name, and domain
  */
function formatSenderInfo(fromString) {
  const email = extractEmail(fromString);
  const name = extractName(fromString);
  const domain = getEmailDomain(email);

  return {
    email: email,
    name: name,
    domain: domain,
    display: name !== 'No display name' ? `${name} <${email}>` : email
  };
}

/**
  * Parses email message into structured data
  * @param {GmailMessage} message - The Gmail message object
  * @returns {Object} Structured email data
  */
function parseEmailData(message) {
  try {
    const from = message.getFrom();
    const senderInfo = formatSenderInfo(from);

    // Get recipients
    const to = message.getTo();
    const cc = message.getCc();
    const bcc = message.getBcc();

    // Combine and parse all recipients
    const allRecipients = [to, cc, bcc]
      .filter(Boolean)
      .join(',')
      .split(',')
      .map(recipient => extractEmail(recipient.trim()))
      .filter(email => email && validateEmailAddress(email));

    // Get unique recipients excluding sender
    const uniqueRecipients = [...new Set(allRecipients)]
      .filter(email => email !== senderInfo.email);

    return {
      id: message.getId(),
      threadId: message.getThread().getId(),
      date: message.getDate(),
      subject: message.getSubject(),
      from: senderInfo.email,
      fromName: senderInfo.name,
      fromDomain: senderInfo.domain,
      to: to ? to.split(',').map(r => extractEmail(r.trim())).filter(Boolean) : [],
      cc: cc ? cc.split(',').map(r => extractEmail(r.trim())).filter(Boolean) : [],
      bcc: bcc ? bcc.split(',').map(r => extractEmail(r.trim())).filter(Boolean) : [],
      recipients: uniqueRecipients,
      hasAttachments: message.getAttachments().length > 0,
      attachmentCount: message.getAttachments().length,
      labels: message.getThread().getLabels().map(label => label.getName()),
      snippet: message.getPlainBody().substring(0, 200),
      isUnread: message.isUnread(),
      isStarred: message.isStarred(),
      messageId: message.getHeader("Message-ID")
    };
  } catch (error) {
    Logger.log(`Error parsing email data: ${error.toString()}`);
    return null;
  }
}