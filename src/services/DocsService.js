var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Services = WorkspaceAutomation.Services || {};

(function(Services, Core) {
  'use strict';
  
  /**
   * DocsService
   * Extends BaseService providing Docs-specific functionality
   * Includes batch operations and rate limiting
   */
  Services.DocsService = function(name, options) {
    Core.BaseService.call(this, name || 'DocsService', options);

    // Rate limiting configuration
    this.rateLimit = {
      requestsPerMinute: 100,
      requestCount: 0,
      lastReset: new Date()
    };

    this.batchSize = 50; // Default batch size for document operations
  };
  Services.DocsService.prototype = Object.create(Core.BaseService.prototype);

  /**
   * Rate limiting helper
   */
  Services.DocsService.prototype.checkRateLimit = function() {
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
  Services.DocsService.prototype.processBatch = function(items, processor, batchSize) {
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
   * Get document content as text
   */
  Services.DocsService.prototype.getDocContent = function(docId) {
    return this.execute('getDocContent', { docId: docId });
  };

  /**
   * Export document to markdown format
   */
  Services.DocsService.prototype.exportToMarkdown = function(docId) {
    return this.execute('exportToMarkdown', { docId: docId });
  };

  /**
   * Get document metadata
   */
  Services.DocsService.prototype.getDocMetadata = function(docId) {
    return this.execute('getDocMetadata', { docId: docId });
  };

  /**
   * Extract comments from document
   */
  Services.DocsService.prototype.extractComments = function(docId) {
    return this.execute('extractComments', { docId: docId });
  };

  /**
   * Format document content
   */
  Services.DocsService.prototype.formatDocument = function(docId, formatOptions) {
    return this.execute('formatDocument', { docId: docId, formatOptions: formatOptions });
  };

  /**
   * Replace text in document
   */
  Services.DocsService.prototype.replaceText = function(docId, searchText, replaceText) {
    return this.execute('replaceText', { 
      docId: docId, 
      searchText: searchText, 
      replaceText: replaceText 
    });
  };

  /**
   * Overriding performOperation to execute Docs-specific logic
   */
  Services.DocsService.prototype.performOperation = function(operation, params) {
    this.checkRateLimit();

    switch (operation) {
      case 'getDocContent':
        return this._getDocContentImpl(params.docId);
      case 'exportToMarkdown':
        return this._exportToMarkdownImpl(params.docId);
      case 'getDocMetadata':
        return this._getDocMetadataImpl(params.docId);
      case 'extractComments':
        return this._extractCommentsImpl(params.docId);
      case 'formatDocument':
        return this._formatDocumentImpl(params.docId, params.formatOptions);
      case 'replaceText':
        return this._replaceTextImpl(params.docId, params.searchText, params.replaceText);
      default:
        throw new Error('Operation "' + operation + '" not implemented in DocsService');
    }
  };

  /**
   * Implementation: Get document content
   */
  Services.DocsService.prototype._getDocContentImpl = function(docId) {
    var doc = DocumentApp.openById(docId);
    return doc.getBody().getText();
  };

  /**
   * Implementation: Export to markdown (basic conversion)
   */
  Services.DocsService.prototype._exportToMarkdownImpl = function(docId) {
    try {
      var doc = DocumentApp.openById(docId);
      var body = doc.getBody();
      var text = body.getText();
      
      // Basic markdown conversion
      var markdown = text
        .replace(/\n\n/g, '\n\n')  // Preserve paragraph breaks
        .replace(/^(.+)$/gm, function(match) {
          // Convert headings (basic detection)
          if (match.length > 0 && match === match.toUpperCase()) {
            return '# ' + match;
          }
          return match;
        });

      return {
        title: doc.getName(),
        content: markdown,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error exporting to markdown', error);
      return null;
    }
  };

  /**
   * Implementation: Get document metadata
   */
  Services.DocsService.prototype._getDocMetadataImpl = function(docId) {
    try {
      var doc = DocumentApp.openById(docId);
      
      return {
        id: docId,
        name: doc.getName(),
        url: doc.getUrl(),
        wordCount: this._getWordCount(doc.getBody().getText()),
        lastModified: DriveApp.getFileById(docId).getLastUpdated(),
        owner: DriveApp.getFileById(docId).getOwner().getEmail()
      };
    } catch (error) {
      this.logger.error('Error getting document metadata', error);
      return null;
    }
  };

  /**
   * Implementation: Extract comments (placeholder - requires advanced API)
   */
  Services.DocsService.prototype._extractCommentsImpl = function(docId) {
    // Note: Full comment extraction requires the Google Docs API
    // This is a placeholder implementation
    this.logger.info('Comment extraction requires Google Docs API integration');
    return {
      docId: docId,
      comments: [],
      note: 'Comment extraction requires Google Docs API integration'
    };
  };

  /**
   * Implementation: Format document
   */
  Services.DocsService.prototype._formatDocumentImpl = function(docId, formatOptions) {
    try {
      var doc = DocumentApp.openById(docId);
      var body = doc.getBody();
      
      // Apply basic formatting options
      if (formatOptions) {
        if (formatOptions.fontSize) {
          body.editAsText().setFontSize(formatOptions.fontSize);
        }
        if (formatOptions.fontFamily) {
          body.editAsText().setFontFamily(formatOptions.fontFamily);
        }
        if (formatOptions.lineSpacing) {
          body.setLineSpacing(formatOptions.lineSpacing);
        }
      }
      
      return {
        success: true,
        docId: docId,
        formatOptions: formatOptions
      };
    } catch (error) {
      this.logger.error('Error formatting document', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Implementation: Replace text in document
   */
  Services.DocsService.prototype._replaceTextImpl = function(docId, searchText, replaceText) {
    try {
      var doc = DocumentApp.openById(docId);
      var body = doc.getBody();
      
      // Replace text using regular expression
      var replacements = body.replaceText(searchText, replaceText);
      
      return {
        success: true,
        docId: docId,
        searchText: searchText,
        replaceText: replaceText,
        replacements: replacements
      };
    } catch (error) {
      this.logger.error('Error replacing text in document', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  /**
   * Helper: Get word count
   */
  Services.DocsService.prototype._getWordCount = function(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

})(WorkspaceAutomation.Services, WorkspaceAutomation.Core);
