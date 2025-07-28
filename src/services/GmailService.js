var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Services = WorkspaceAutomation.Services || {};

(function(Services, Core) {
  'use strict';
  
  /**
   * GmailService
   * Extends BaseService providing Gmail-specific functionality
   * Includes batch operations and rate limiting
   */
  Services.GmailService = function(name, options) {
    Core.BaseService.call(this, name || 'GmailService', options);
    
    // Rate limiting configuration
    this.rateLimit = {
      requestsPerMinute: 100,
      requestCount: 0,
      lastReset: new Date()
    };
    
    this.batchSize = 100; // Default batch size for operations
  };
  Services.GmailService.prototype = Object.create(Core.BaseService.prototype);
  
  /**
   * Rate limiting helper
   */
  Services.GmailService.prototype.checkRateLimit = function() {
    var now = new Date();
    var timeDiff = now - this.rateLimit.lastReset;
    
    // Reset counter every minute
    if (timeDiff >= 60000) {
      this.rateLimit.requestCount = 0;
      this.rateLimit.lastReset = now;
    }
    
    if (this.rateLimit.requestCount >= this.rateLimit.requestsPerMinute) {
      var waitTime = 60000 - timeDiff;
      this.logger.info('Rate limit reached, waiting ' + waitTime + 'ms');
      Utilities.sleep(waitTime);
      this.rateLimit.requestCount = 0;
      this.rateLimit.lastReset = new Date();
    }
    
    this.rateLimit.requestCount++;
  };
  
  /**
   * Batch processing helper
   */
  Services.GmailService.prototype.processBatch = function(items, processor, batchSize) {
    var results = [];
    var size = batchSize || this.batchSize;
    
    for (var i = 0; i < items.length; i += size) {
      var batch = items.slice(i, i + size);
      this.logger.debug('Processing batch ' + (Math.floor(i / size) + 1) + ' of ' + Math.ceil(items.length / size));
      
      var batchResults = processor(batch);
      results = results.concat(batchResults);
      
      // Add delay between batches to avoid rate limits
      if (i + size < items.length) {
        Utilities.sleep(1000);
      }
    }
    
    return results;
  };
  
  /**
   * Get Gmail labels with statistics
   */
  Services.GmailService.prototype.getLabelStats = function() {
    return this.execute('getLabelStats');
  };
  
  /**
   * Export emails to structured data
   */
  Services.GmailService.prototype.exportEmails = function(query, maxResults) {
    return this.execute('exportEmails', { query: query, maxResults: maxResults || 100 });
  };
  
  /**
   * Parse email data using utility functions
   */
  Services.GmailService.prototype.parseEmailData = function(message) {
    return this.execute('parseEmailData', { message: message });
  };
  
  /**
   * Mark emails as read in batch
   */
  Services.GmailService.prototype.markEmailsRead = function(threadIds) {
    return this.execute('markEmailsRead', { threadIds: threadIds });
  };
  
  /**
   * Get unread email count by label
   */
  Services.GmailService.prototype.getUnreadCounts = function() {
    return this.execute('getUnreadCounts');
  };
  
  /**
   * Overriding performOperation to execute Gmail-specific logic
   */
  Services.GmailService.prototype.performOperation = function(operation, params) {
    this.checkRateLimit();
    
    switch (operation) {
      case 'getLabelStats':
        return this._getLabelStatsImpl();
      case 'exportEmails':
        return this._exportEmailsImpl(params.query, params.maxResults);
      case 'parseEmailData':
        return this._parseEmailDataImpl(params.message);
      case 'markEmailsRead':
        return this._markEmailsReadImpl(params.threadIds);
      case 'getUnreadCounts':
        return this._getUnreadCountsImpl();
      default:
        throw new Error('Operation "' + operation + '" not implemented in GmailService');
    }
  };
  
  /**
   * Implementation: Get label statistics
   */
  Services.GmailService.prototype._getLabelStatsImpl = function() {
    var labels = GmailApp.getUserLabels();
    var stats = [];
    
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var threads = label.getThreads();
      var totalEmails = 0;
      
      for (var j = 0; j < threads.length; j++) {
        totalEmails += threads[j].getMessages().length;
      }
      
      stats.push({
        name: label.getName(),
        threadCount: threads.length,
        emailCount: totalEmails
      });
    }
    
    return stats;
  };
  
  /**
   * Implementation: Export emails
   */
  Services.GmailService.prototype._exportEmailsImpl = function(query, maxResults) {
    var threads = GmailApp.search(query, 0, maxResults);
    var emails = [];
    
    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        emails.push(this._parseEmailDataImpl(messages[j]));
      }
    }
    
    return emails;
  };
  
  /**
   * Implementation: Parse email data (ported from email-utils.gs)
   */
  Services.GmailService.prototype._parseEmailDataImpl = function(message) {
    try {
      var from = message.getFrom();
      var senderInfo = this._formatSenderInfo(from);
      
      return {
        id: message.getId(),
        threadId: message.getThread().getId(),
        date: message.getDate(),
        subject: message.getSubject(),
        from: senderInfo.email,
        fromName: senderInfo.name,
        fromDomain: senderInfo.domain,
        to: this._parseRecipients(message.getTo()),
        cc: this._parseRecipients(message.getCc()),
        bcc: this._parseRecipients(message.getBcc()),
        hasAttachments: message.getAttachments().length > 0,
        attachmentCount: message.getAttachments().length,
        labels: message.getThread().getLabels().map(function(label) { return label.getName(); }),
        snippet: message.getPlainBody().substring(0, 200),
        isUnread: message.isUnread(),
        isStarred: message.isStarred()
      };
    } catch (error) {
      this.logger.error('Error parsing email data', error);
      return null;
    }
  };
  
  /**
   * Implementation: Mark emails as read
   */
  Services.GmailService.prototype._markEmailsReadImpl = function(threadIds) {
    var self = this;
    return this.processBatch(threadIds, function(batch) {
      var threads = batch.map(function(id) { return GmailApp.getThreadById(id); });
      GmailApp.markThreadsRead(threads);
      return threads.length;
    });
  };
  
  /**
   * Implementation: Get unread counts
   */
  Services.GmailService.prototype._getUnreadCountsImpl = function() {
    var labels = GmailApp.getUserLabels();
    var counts = {};
    
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var unreadCount = label.getUnreadCount();
      counts[label.getName()] = unreadCount;
    }
    
    return counts;
  };
  
  /**
   * Helper: Extract email from sender string
   */
  Services.GmailService.prototype._extractEmail = function(fromString) {
    if (!fromString) return '';
    
    var emailMatch = fromString.match(/<(.+?)>/);
    if (emailMatch) return emailMatch[1];
    
    var emailOnlyMatch = fromString.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    return emailOnlyMatch ? emailOnlyMatch[0] : fromString;
  };
  
  /**
   * Helper: Extract name from sender string
   */
  Services.GmailService.prototype._extractName = function(fromString) {
    if (!fromString) return 'No display name';
    
    var emailMatch = fromString.match(/<(.+?)>/);
    if (emailMatch) {
      var name = fromString.replace(emailMatch[0], '').trim();
      return name || 'No display name';
    }
    
    return fromString;
  };
  
  /**
   * Helper: Format sender information
   */
  Services.GmailService.prototype._formatSenderInfo = function(fromString) {
    var email = this._extractEmail(fromString);
    var name = this._extractName(fromString);
    var domain = email.split('@')[1] || '';
    
    return {
      email: email,
      name: name,
      domain: domain
    };
  };
  
  /**
   * Helper: Parse recipients
   */
  Services.GmailService.prototype._parseRecipients = function(recipientString) {
    if (!recipientString) return [];
    
    var self = this;
    return recipientString.split(',').map(function(recipient) {
      return self._extractEmail(recipient.trim());
    }).filter(function(email) {
      return email && email.indexOf('@') > -1;
    });
  };
  
})(WorkspaceAutomation.Services, WorkspaceAutomation.Core);
