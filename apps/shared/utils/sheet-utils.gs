/**
  * Script Name: sheet-utils
  *
  * Script Summary:
  * Shared utility functions for Google Sheets operations in Google Apps Script.
  *
  * Script Purpose:
  * - Initialize and format spreadsheets consistently
  * - Insert and manage data efficiently
  * - Provide reusable sheet manipulation functions
  *
  * Script Functions:
  * - setupSheet(): Initialize sheet with headers and formatting
  * - formatSheet(): Apply consistent formatting to a sheet
  * - insertDataIntoSheet(): Insert data with proper formatting
  * - clearSheet(): Clear sheet contents while preserving structure
  * - autoResizeColumns(): Auto-resize columns to fit content
  * - setSheetStyle(): Apply consistent styling across sheets
  * - createOrGetSheet(): Get existing or create new sheet
  * - appendDataToSheet(): Append data to existing sheet
  * - getSheetDataAsObjects(): Convert sheet data to objects
  *
  * Script Dependencies:
  * - None (standalone utility module)
  *
  * Google Services:
  * - SpreadsheetApp: For spreadsheet operations
  */

/**
  * Default sheet formatting configuration
  */
const DEFAULT_SHEET_CONFIG = {
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

/**
  * Sets up a sheet with headers and initial formatting
  * @param {Sheet} sheet - The sheet to set up
  * @param {string[]} headers - Array of header values
  * @param {Object} config - Optional configuration overrides
  * @returns {Sheet} The configured sheet
  */
function setupSheet(sheet, headers, config) {
  const settings = Object.assign({}, DEFAULT_SHEET_CONFIG, config || {});

  // Clear existing content if any
  if (sheet.getLastRow() > 0) {
    sheet.clear();
  }

  // Set headers
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight(settings.headerFontWeight);

    if (settings.headerBackground) {
      headerRange.setBackground(settings.headerBackground);
    }
  }

  // Apply sheet formatting
  formatSheet(sheet, settings);

  // Freeze rows/columns
  if (settings.freezeRows > 0) {
    sheet.setFrozenRows(settings.freezeRows);
  }
  if (settings.freezeColumns > 0) {
    sheet.setFrozenColumns(settings.freezeColumns);
  }

  return sheet;
}

/**
  * Applies consistent formatting to a sheet
  * @param {Sheet} sheet - The sheet to format
  * @param {Object} config - Formatting configuration
  * @returns {Sheet} The formatted sheet
  */
function formatSheet(sheet, config) {
  const settings = Object.assign({}, DEFAULT_SHEET_CONFIG, config || {});
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();

  if (maxRows > 0 && maxCols > 0) {
    const fullRange = sheet.getRange(1, 1, maxRows, maxCols);

    // Apply formatting
    fullRange.setFontSize(settings.fontSize)
      .setFontFamily(settings.fontFamily)
      .setHorizontalAlignment(settings.horizontalAlignment)
      .setVerticalAlignment(settings.verticalAlignment)
      .setWrapStrategy(settings.wrapStrategy);
  }

  return sheet;
}

/**
  * Inserts data into a sheet with proper formatting
  * @param {Sheet} sheet - The sheet to insert data into
  * @param {Array[]} data - 2D array of data to insert
  * @param {string[]} headers - Optional headers to set/verify
  * @param {Object} options - Insert options (startRow, preserveHeaders, etc.)
  * @returns {boolean} True if successful
  */
function insertDataIntoSheet(sheet, data, headers, options) {
  try {
    const opts = Object.assign({
      startRow: 2,
      preserveHeaders: true,
      clearExisting: false,
      autoResize: true
    }, options || {});

    // Handle headers
    if (headers && headers.length > 0) {
      if (sheet.getLastRow() === 0 || !opts.preserveHeaders) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
      }
    }

    // Clear existing data if requested
    if (opts.clearExisting && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }

    // Insert data
    if (data && data.length > 0) {
      const numRows = data.length;
      const numCols = data[0].length;

      // Ensure sheet has enough rows
      const currentRows = sheet.getMaxRows();
      const neededRows = opts.startRow + numRows - 1;
      if (neededRows > currentRows) {
        sheet.insertRowsAfter(currentRows, neededRows - currentRows);
      }

      // Insert the data
      sheet.getRange(opts.startRow, 1, numRows, numCols).setValues(data);

      // Auto-resize columns if requested
      if (opts.autoResize) {
        autoResizeColumns(sheet, 1, numCols);
      }
    }

    return true;
  } catch (error) {
    Logger.log(`Error inserting data into sheet: ${error.toString()}`);
    return false;
  }
}

/**
  * Clears sheet contents while preserving headers and formatting
  * @param {Sheet} sheet - The sheet to clear
  * @param {boolean} preserveHeaders - Whether to preserve the header row
  * @returns {Sheet} The cleared sheet
  */
function clearSheet(sheet, preserveHeaders = true) {
  if (sheet.getLastRow() > 1) {
    const startRow = preserveHeaders ? 2 : 1;
    const numRows = sheet.getLastRow() - startRow + 1;

    if (numRows > 0) {
      sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).clearContent();
    }
  } else if (!preserveHeaders && sheet.getLastRow() > 0) {
    sheet.clear();
  }

  return sheet;
}

/**
  * Auto-resizes columns to fit content
  * @param {Sheet} sheet - The sheet to resize columns for
  * @param {number} startColumn - Starting column (1-based)
  * @param {number} numColumns - Number of columns to resize
  * @returns {Sheet} The sheet with resized columns
  */
function autoResizeColumns(sheet, startColumn = 1, numColumns = null) {
  try {
    const columnsToResize = numColumns || sheet.getLastColumn() - startColumn + 1;

    for (let i = 0; i < columnsToResize; i++) {
      sheet.autoResizeColumn(startColumn + i);
    }

    return sheet;
  } catch (error) {
    Logger.log(`Error auto-resizing columns: ${error.toString()}`);
    return sheet;
  }
}

/**
  * Creates a new sheet or gets an existing one
  * @param {Spreadsheet} spreadsheet - The spreadsheet object
  * @param {string} sheetName - Name of the sheet
  * @param {boolean} clearIfExists - Clear the sheet if it exists
  * @returns {Sheet} The sheet object
  */
function createOrGetSheet(spreadsheet, sheetName, clearIfExists = false) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  } else if (clearIfExists) {
    sheet.clear();
  }

  return sheet;
}

/**
  * Appends data to the end of a sheet
  * @param {Sheet} sheet - The sheet to append to
  * @param {Array[]} data - 2D array of data to append
  * @returns {boolean} True if successful
  */
function appendDataToSheet(sheet, data) {
  try {
    if (!data || data.length === 0) return true;

    const lastRow = sheet.getLastRow();
    const numRows = data.length;
    const numCols = data[0].length;

    // Ensure sheet has enough rows
    const currentRows = sheet.getMaxRows();
    const neededRows = lastRow + numRows;
    if (neededRows > currentRows) {
      sheet.insertRowsAfter(currentRows, neededRows - currentRows);
    }

    sheet.getRange(lastRow + 1, 1, numRows, numCols).setValues(data);
    return true;
  } catch (error) {
    Logger.log(`Error appending data to sheet: ${error.toString()}`);
    return false;
  }
}

/**
  * Converts sheet data to an array of objects using headers as keys
  * @param {Sheet} sheet - The sheet to read from
  * @param {Object} options - Read options (startRow, numRows, etc.)
  * @returns {Object[]} Array of objects representing the data
  */
function getSheetDataAsObjects(sheet, options) {
  try {
    const opts = Object.assign({
      startRow: 2,
      headerRow: 1,
      numRows: null
    }, options || {});

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow < opts.headerRow || lastCol === 0) {
      return [];
    }

    // Get headers
    const headers = sheet.getRange(opts.headerRow, 1, 1, lastCol).getValues()[0];

    // Calculate rows to read
    const rowsToRead = opts.numRows || (lastRow - opts.startRow + 1);
    if (rowsToRead <= 0) return [];

    // Get data
    const data = sheet.getRange(opts.startRow, 1, rowsToRead, lastCol).getValues();

    // Convert to objects
    return data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  } catch (error) {
    Logger.log(`Error converting sheet data to objects: ${error.toString()}`);
    return [];
  }
}

/**
  * Sets consistent column widths for a sheet
  * @param {Sheet} sheet - The sheet to modify
  * @param {number} startColumn - Starting column (1-based)
  * @param {number} numColumns - Number of columns
  * @param {number} width - Width in pixels
  * @returns {Sheet} The modified sheet
  */
function setColumnWidths(sheet, startColumn, numColumns, width) {
  try {
    sheet.setColumnWidths(startColumn, numColumns, width);
    return sheet;
  } catch (error) {
    Logger.log(`Error setting column widths: ${error.toString()}`);
    return sheet;
  }
}