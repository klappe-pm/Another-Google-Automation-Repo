var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Services = WorkspaceAutomation.Services || {};

(function(Services, Core) {
  'use strict';
  
  /**
   * DriveService
   * Extends BaseService providing Drive-specific functionality
   * Includes batch operations and rate limiting
   */
  Services.DriveService = function(name, options) {
    Core.BaseService.call(this, name || 'DriveService', options);

    // Rate limiting configuration
    this.rateLimit = {
      requestsPerMinute: 100,
      requestCount: 0,
      lastReset: new Date()
    };

    this.batchSize = 100; // Default batch size for operations
  };
  Services.DriveService.prototype = Object.create(Core.BaseService.prototype);

  /**
   * Rate limiting helper
   */
  Services.DriveService.prototype.checkRateLimit = function() {
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
  Services.DriveService.prototype.processBatch = function(items, processor, batchSize) {
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
   * List files in a folder
   */
  Services.DriveService.prototype.listFiles = function(folderId) {
    return this.execute('listFiles', { folderId: folderId });
  };

  /**
   * Search for files by name
   */
  Services.DriveService.prototype.searchFiles = function(query) {
    return this.execute('searchFiles', { query: query });
  };

  /**
   * Overriding performOperation to execute Drive-specific logic
   */
  Services.DriveService.prototype.performOperation = function(operation, params) {
    this.checkRateLimit();

    switch (operation) {
      case 'listFiles':
        return this._listFilesImpl(params.folderId);
      case 'searchFiles':
        return this._searchFilesImpl(params.query);
      default:
        throw new Error('Operation "' + operation + '" not implemented in DriveService');
    }
  };

  /**
   * Implementation: List files in a folder
   */
  Services.DriveService.prototype._listFilesImpl = function(folderId) {
    var folder = DriveApp.getFolderById(folderId);
    var files = [];

    var iterator = folder.getFiles();
    while (iterator.hasNext()) {
      var file = iterator.next();
      files.push({
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl()
      });
    }

    return files;
  };

  /**
   * Implementation: Search files by name
   */
  Services.DriveService.prototype._searchFilesImpl = function(query) {
    var files = DriveApp.searchFiles('title contains "' + query + '"');
    var result = [];

    while (files.hasNext()) {
      var file = files.next();
      result.push({
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl()
      });
    }

    return result;
  };

})(WorkspaceAutomation.Services, WorkspaceAutomation.Core);
