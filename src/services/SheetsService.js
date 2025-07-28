var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Services = WorkspaceAutomation.Services || {};

(function(Services, Core) {
  'use strict';
  
  /**
   * SheetsService
   * Extends BaseService providing Sheets-specific functionality
   * Includes batch operations and rate limiting
   */
  Services.SheetsService = function(name, options) {
    Core.BaseService.call(this, name || 'SheetsService', options);

    // Rate limiting configuration
    this.rateLimit = {
      requestsPerMinute: 100,
      requestCount: 0,
      lastReset: new Date()
    };

    this.batchSize = 1000; // Default batch size for sheet operations
    
    // Default sheet configuration from sheet-utils.gs
    this.defaultConfig = {
      fontSize: 11,
      fontFamily: 'Helvetica Neue',
      horizontalAlignment: 'left',
      verticalAlignment: 'top',
      wrapStrategy: SpreadsheetApp.WrapStrategy.CLIP,
      headerFontWeight: 'bold',
      headerBackground: '#f3f3f3',
      freezeRows: 1,
      freezeColumns: 0
    };
  };
  Services.SheetsService.prototype = Object.create(Core.BaseService.prototype);

  /**
   * Rate limiting helper
   */
  Services.SheetsService.prototype.checkRateLimit = function() {
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
  Services.SheetsService.prototype.processBatch = function(items, processor, batchSize) {
    var results = [];
    var size = batchSize || this.batchSize;

    for (var i = 0; i < items.length; i += size) {
      var batch = items.slice(i, i + size);
      this.logger.debug('Processing batch ' + (Math.floor(i / size) + 1) + ' of ' + Math.ceil(items.length / size));

      var batchResults = processor(batch);
      results = results.concat(batchResults);

      // Add delay between batches to avoid rate limits
      if (i + size < items.length) {
        Utilities.sleep(500);
      }
    }

    return results;
  };

  /**
   * Get sheet data
   */
  Services.SheetsService.prototype.getSheetData = function(spreadsheetId, sheetName) {
    return this.execute('getSheetData', { spreadsheetId: spreadsheetId, sheetName: sheetName });
  };

  /**
   * Setup sheet with headers and formatting
   */
  Services.SheetsService.prototype.setupSheet = function(spreadsheetId, sheetName, headers, config) {
    return this.execute('setupSheet', { 
      spreadsheetId: spreadsheetId, 
      sheetName: sheetName, 
      headers: headers, 
      config: config 
    });
  };

  /**
   * Insert data into sheet
   */
  Services.SheetsService.prototype.insertDataIntoSheet = function(spreadsheetId, sheetName, data, headers, options) {
    return this.execute('insertDataIntoSheet', {
      spreadsheetId: spreadsheetId,
      sheetName: sheetName,
      data: data,
      headers: headers,
      options: options
    });
  };

  /**
   * Clear sheet contents
   */
  Services.SheetsService.prototype.clearSheet = function(spreadsheetId, sheetName, preserveHeaders) {
    return this.execute('clearSheet', {
      spreadsheetId: spreadsheetId,
      sheetName: sheetName,
      preserveHeaders: preserveHeaders
    });
  };

  /**
   * Get or create sheet
   */
  Services.SheetsService.prototype.getOrCreateSheet = function(spreadsheetId, sheetName) {
    return this.execute('getOrCreateSheet', {
      spreadsheetId: spreadsheetId,
      sheetName: sheetName
    });
  };

  /**
   * Overriding performOperation to execute Sheets-specific logic
   */
  Services.SheetsService.prototype.performOperation = function(operation, params) {
    this.checkRateLimit();

    switch (operation) {
      case 'getSheetData':
        return this._getSheetDataImpl(params.spreadsheetId, params.sheetName);
      case 'setupSheet':
        return this._setupSheetImpl(params.spreadsheetId, params.sheetName, params.headers, params.config);
      case 'insertDataIntoSheet':
        return this._insertDataIntoSheetImpl(params.spreadsheetId, params.sheetName, params.data, params.headers, params.options);
      case 'clearSheet':
        return this._clearSheetImpl(params.spreadsheetId, params.sheetName, params.preserveHeaders);
      case 'getOrCreateSheet':
        return this._getOrCreateSheetImpl(params.spreadsheetId, params.sheetName);
      default:
        throw new Error('Operation "' + operation + '" not implemented in SheetsService');
    }
  };

  /**
   * Implementation: Get sheet data
   */
  Services.SheetsService.prototype._getSheetDataImpl = function(spreadsheetId, sheetName) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getSheets()[0];
    return sheet.getDataRange().getValues();
  };

  /**
   * Implementation: Setup sheet (ported from sheet-utils.gs)
   */
  Services.SheetsService.prototype._setupSheetImpl = function(spreadsheetId, sheetName, headers, config) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = this._getOrCreateSheetImpl(spreadsheetId, sheetName);
    var settings = this._mergeConfig(config);

    // Clear existing content if any
    if (sheet.getLastRow() > 0) {
      sheet.clear();
    }

    // Set headers
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight(settings.headerFontWeight);

      if (settings.headerBackground) {
        headerRange.setBackground(settings.headerBackground);
      }
    }

    // Apply sheet formatting
    this._formatSheet(sheet, settings);

    // Freeze rows/columns
    if (settings.freezeRows > 0) {
      sheet.setFrozenRows(settings.freezeRows);
    }
    if (settings.freezeColumns > 0) {
      sheet.setFrozenColumns(settings.freezeColumns);
    }

    return sheet;
  };

  /**
   * Implementation: Insert data into sheet (ported from sheet-utils.gs)
   */
  Services.SheetsService.prototype._insertDataIntoSheetImpl = function(spreadsheetId, sheetName, data, headers, options) {
    try {
      var sheet = this._getOrCreateSheetImpl(spreadsheetId, sheetName);
      var opts = this._mergeInsertOptions(options);

      // Handle headers
      if (headers && headers.length > 0) {
        if (sheet.getLastRow() === 0 || !opts.preserveHeaders) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          var headerRange = sheet.getRange(1, 1, 1, headers.length);
          headerRange.setFontWeight('bold');
        }
      }

      // Clear existing data if requested
      if (opts.clearExisting && sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }

      // Insert data
      if (data && data.length > 0) {
        var numRows = data.length;
        var numCols = data[0].length;

        // Ensure sheet has enough rows
        var currentRows = sheet.getMaxRows();
        var neededRows = opts.startRow + numRows - 1;
        if (neededRows > currentRows) {
          sheet.insertRowsAfter(currentRows, neededRows - currentRows);
        }

        // Insert the data
        sheet.getRange(opts.startRow, 1, numRows, numCols).setValues(data);

        // Auto-resize columns if requested
        if (opts.autoResize) {
          this._autoResizeColumns(sheet, 1, numCols);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error inserting data into sheet', error);
      return false;
    }
  };

  /**
   * Implementation: Clear sheet
   */
  Services.SheetsService.prototype._clearSheetImpl = function(spreadsheetId, sheetName, preserveHeaders) {
    var sheet = this._getOrCreateSheetImpl(spreadsheetId, sheetName);
    preserveHeaders = preserveHeaders !== false; // Default to true

    if (sheet.getLastRow() > 1) {
      var startRow = preserveHeaders ? 2 : 1;
      var numRows = sheet.getLastRow() - startRow + 1;

      if (numRows > 0) {
        sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).clearContent();
      }
    } else if (!preserveHeaders && sheet.getLastRow() > 0) {
      sheet.clear();
    }

    return sheet;
  };

  /**
   * Implementation: Get or create sheet
   */
  Services.SheetsService.prototype._getOrCreateSheetImpl = function(spreadsheetId, sheetName) {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    return sheet;
  };

  /**
   * Helper: Format sheet
   */
  Services.SheetsService.prototype._formatSheet = function(sheet, config) {
    var maxRows = sheet.getMaxRows();
    var maxCols = sheet.getMaxColumns();

    if (maxRows > 0 && maxCols > 0) {
      var fullRange = sheet.getRange(1, 1, maxRows, maxCols);

      // Apply formatting
      fullRange.setFontSize(config.fontSize)
        .setFontFamily(config.fontFamily)
        .setHorizontalAlignment(config.horizontalAlignment)
        .setVerticalAlignment(config.verticalAlignment)
        .setWrapStrategy(config.wrapStrategy);
    }

    return sheet;
  };

  /**
   * Helper: Auto-resize columns
   */
  Services.SheetsService.prototype._autoResizeColumns = function(sheet, startColumn, numColumns) {
    try {
      for (var i = 0; i < numColumns; i++) {
        sheet.autoResizeColumn(startColumn + i);
      }
    } catch (error) {
      this.logger.error('Error auto-resizing columns', error);
    }
    return sheet;
  };

  /**
   * Helper: Merge configuration
   */
  Services.SheetsService.prototype._mergeConfig = function(config) {
    var merged = {};
    for (var key in this.defaultConfig) {
      merged[key] = this.defaultConfig[key];
    }
    if (config) {
      for (var key in config) {
        merged[key] = config[key];
      }
    }
    return merged;
  };

  /**
   * Helper: Merge insert options
   */
  Services.SheetsService.prototype._mergeInsertOptions = function(options) {
    var defaults = {
      startRow: 2,
      preserveHeaders: true,
      clearExisting: false,
      autoResize: true
    };
    var merged = {};
    for (var key in defaults) {
      merged[key] = defaults[key];
    }
    if (options) {
      for (var key in options) {
        merged[key] = options[key];
      }
    }
    return merged;
  };

})(WorkspaceAutomation.Services, WorkspaceAutomation.Core);
