/**
 * Script Name: create- sheets- tabs- tree- diagram
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Generate new sheets tabs tree diagram items
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
* Google Sheets Tab Index Generator and Formatter
*
* Script Summary:
* - - - - - - - - - - - - - - -
* Purpose: Automates the organization and navigation of complex Google Sheets workbooks
* by creating a centralized, clickable index of all sheets and applying consistent formatting.
*
* Problem Solved: In large Google Sheets workbooks, finding and navigating between specific
* sheets becomes difficult and time- consuming. Sheet naming conventions and formatting may
* also be inconsistent across tabs.
*
* What the Script Does:
* 1. Creates an organized index of all sheets in the workbook
* 2. Extracts categories from sheet names using PascalCase convention
* 3. Generates clickable navigation links to each sheet
* 4. Applies consistent formatting across all sheets
* 5. Reorganizes sheets in alphabetical order
*
* Successful Execution:
* - Creates/ updates an "Index" sheet in the first position
* - Organizes all sheets alphabetically
* - Generates working hyperlinks to all sheets
* - Applies consistent formatting across all sheets
* - Logs execution steps and confirms completion
*
* Functions- Alphabetical:
* - - - - - - - - - - - - - - - - - - - - - -
* createIndexV2(): Main function that orchestrates the index creation and formatting
* extractCategory(): Extracts category from sheet name using PascalCase convention
* formatSheet(): Applies consistent formatting to a specified sheet
*
* Functions- Ordered:
* - - - - - - - - - - - - - - - - -
* 1. createIndexV2(): Primary function that controls the script execution
* 2. extractCategory(): Helper function called during index creation
* 3. formatSheet(): Helper function called for each sheet
*
* Script- Steps:
* - - - - - - - - - - - -
* 1. Initialize and Access Spreadsheet
*    Input: Active Google Spreadsheet
*    Output: Spreadsheet object and array of sheets
*
* 2. Sort and Reorder Sheets
*    Input: Array of sheet objects
*    Output: Physically reordered sheets in the spreadsheet
*
* 3. Create/ Clear Index Sheet
*    Input: Spreadsheet object
*    Output: Fresh "Index" sheet ready for content
*
* 4. Generate Index Content
*    Input: Sorted sheets array
*    Output: Categories and hyperlinks in Index sheet
*    Uses: extractCategory() for each sheet name
*
* 5. Apply Formatting
*    Input: All sheets including Index
*    Output: Consistently formatted sheets
*    Uses: formatSheet() for each sheet
*
* 6. Finalize and Notify
*    Input: Completed Index sheet
*    Output: Index sheet moved to first position, success message
*
* - - - - - - - - - - - - - - -
* extractCategory(sheetName: string): string
*   - Extracts category from PascalCase sheet names
*   - Returns lowercase prefix before first capital letter
*
* formatSheet(sheet: Sheet): void
*   - Applies consistent formatting to a sheet
*   - Sets font, alignment, and special first row formatting
* // * *
 * Create index v2
 * @return {* } The created index v2
 *// * *
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
 * @returns {boolean} The newly created boolean

 */

function createIndexV2() {
  console.log(" = = = Sheet Index Generator Started = = = ");
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
        const hyperlink = ` = HYPERLINK("#gid = ${sheet.getSheetId()}", "${sheetName}")`;

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
          console.log(" = = = Sheet Index Generator Completed Successfully = = = ");

          // User notification
          SpreadsheetApp.getUi().alert("Sheet index created successfully ! ");

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
 * @returns {boolean} True if successful, false otherwise

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
 * @returns {boolean} True if successful, false otherwise

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