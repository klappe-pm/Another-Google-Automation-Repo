/**
 * Script Name: create- sheets- tree- diagram
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Generate new sheets tree diagram items
 * - Set up required structure and metadata
 * - Apply formatting and organization
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Sort data by relevant fields
 * 5. Format output for presentation
 *
 * Script Functions:
 * - createIndexV2(): Creates new index v2 or resources
 *
 * Script Helper Functions:
 * - extractCategory(): Extracts specific information
 * - formatSheet(): Formats sheet for display
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

/**
 * Extracts the category from a sheet name using PascalCase convention
 *
 * @param {string} sheetName - The name of the sheet to process
 * @returns {string} The extracted category or empty string if no category found
 *
 * Example:
 * - "salesData" returns "sales"
 * - "UserProfile" returns "user"
 * - "DATA" returns ""
 *// * *
 * Applies standardized formatting to a sheet
 *
 * @param {Sheet} sheet - The Google Sheets sheet object to format
 *
 * Formatting applied:
 * - Font: Helvetica, 10pt
 * - First row: Bold, wrapped text, frozen
 * - All cells: Left and top aligned
 *// / Main Functions

// Main Functions

/**

 * Creates new index v2 or resources
 * @returns {any} The newly created any

 */

function createIndexV2() {
  console.log("= = = Sheet Index Generator Started = = = ");
  console.time("Script Execution Time");

  try {
    // Initialize spreadsheet access
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    console.log(`Found ${sheets.length} sheets to process`);

    // Sort and reorder sheets
    console.log("Step 1: Sorting sheets alphabetically...");
    sheets.sort((a, b) = > a.getName().localeCompare(b.getName()));

    console.log("Step 2: Reordering sheets physically...");
    sheets.forEach((sheet, index) = > {
      const sheetName = sheet.getName();
      console.log(`  Moving "${sheetName}" to position ${index + 1}`);
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    });

    // Set up Index sheet
    console.log("Step 3: Preparing Index sheet...");
    let indexSheet = ss.getSheetByName("Index");
    if (indexSheet) {
      console.log("  Clearing existing Index sheet");
      indexSheet.clear();
    } else {
      console.log("  Creating new Index sheet");
      indexSheet = ss.insertSheet("Index");
    }

    // Add headers and content
    console.log("Step 4: Generating index content...");
    indexSheet.getRange("B1").setValue("Sheet Index").setFontWeight("bold");
    indexSheet.getRange("A1").setValue("Category").setFontWeight("bold");

    sheets.forEach((sheet, index) = > {
      const sheetName = sheet.getName();
      const category = extractCategory(sheetName);
      const row = index + 2;
      const hyperlink = `= HYPERLINK("#gid= ${sheet.getSheetId()}", "${sheetName}")`;

      console.log(`  Processing "${sheetName}" (Category: ${category})`);
      indexSheet.getRange(`A${row}`).setValue(category);
      indexSheet.getRange(`B${row}`).setFormula(hyperlink);
    });

    // Format sheets
    console.log("Step 5: Applying formatting...");
    indexSheet.autoResizeColumn(1);
    indexSheet.autoResizeColumn(2);

    sheets.forEach(sheet = > {
      console.log(`  Formatting sheet: ${sheet.getName()}`);
      formatSheet(sheet);
    });
    console.log("  Formatting Index sheet");
    formatSheet(indexSheet);

    // Finalize
    console.log("Step 6: Finalizing Index sheet position...");
    ss.setActiveSheet(indexSheet);
    ss.moveActiveSheet(1);

    SpreadsheetApp.flush();
    console.timeEnd("Script Execution Time");
    console.log("= = = Sheet Index Generator Completed Successfully = = = ");

    // User notification
    SpreadsheetApp.getUi().alert("Sheet index created successfully! ");

  } catch (error) {
    console.error("Script failed with error:", error);
    console.error("Stack trace:", error.stack);
    SpreadsheetApp.getUi().alert("Error creating sheet index. Check Apps Script logs for details.");
    throw error;
  }
}

// Helper Functions

/**

 * Extracts specific information
 * @param
 * @param {string} sheetName - The sheetName parameter
 * @returns {any} The result

 */

function extractCategory(sheetName) {
  console.log(`Extracting category from sheet name: "${sheetName}"`);
  const match = sheetName.match(/ ^[a- z]+ / );
  const category = match ? match[0] : "";
  console.log(`  Extracted category: "${category}"`);
  return category;
}

/**

 * Formats sheet for display
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @returns {any} The result

 */

function formatSheet(sheet) {
  const sheetName = sheet.getName();
  console.log(`Formatting sheet: "${sheetName}"`);

  try {
    // Get the data range
    const fullRange = sheet.getDataRange();
    console.log(`  Applying base formatting to range: ${fullRange.getA1Notation()}`);

    // Apply base formatting
    fullRange
      .setFontFamily("Helvetica")
      .setFontSize(10)
      .setHorizontalAlignment("left")
      .setVerticalAlignment("top");

    // Format header row
    console.log("  Formatting header row");
    sheet.getRange("1:1")
      .setFontWeight("bold")
      .setWrap(true);

    // Freeze header
    sheet.setFrozenRows(1);
    console.log(`  Completed formatting for "${sheetName}"`);

  } catch (error) {
    console.error(`Error formatting sheet "${sheetName}":`, error);
    throw error;
  }
}