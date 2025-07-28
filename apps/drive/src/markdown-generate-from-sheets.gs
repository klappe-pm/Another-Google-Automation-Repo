/**
 * Script Name: markdown- generate- from- sheets
 *
 * Script Summary:
 * Generates markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Apply filters and criteria
 * 7. Format output for presentation
 * 8. Write results to destination
 *
 * Script Functions:
 * - applyStandardFormatting(): Formats apply standardting for display
 * - batchUpdateSheet(): Updates existing batch sheet
 * - createColumnMap(): Creates new column map or resources
 * - createConfigTemplate(): Creates new config template or resources
 * - createFile(): Creates new file or resources
 * - createSampleDataSheet(): Creates new sample data sheet or resources
 * - ensureStatusColumn(): Works with spreadsheet data
 * - generateContent(): Generates new content or reports
 * - generateMarkdownFiles(): Generates new content or reports
 * - generateSection(): Generates new content or reports
 * - getOrCreateSubfolder(): Gets specific or create subfolder or configuration
 * - loadConfiguration(): Loads configuration from storage
 * - onOpen(): Works with spreadsheet data
 * - processDataSheet(): Processes and transforms data sheet
 * - toKebabCase(): Performs specialized operations
 * - toSentenceCase(): Performs specialized operations
 * - toTitleCase(): Performs specialized operations
 *
 * Script Helper Functions:
 * - formatAllSheets(): Formats all sheets for display
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

const DEFAULT_YAML_FIELDS = {
  "filename": "filename",
  "area": "area",
  "category": "category",
  "subCategory": "subCategory",
  "topic": "topic",
  "subTopic": "subTopic",
  "dateCreated": "dateCreated",
  "dateRevised": "dateRevised",
  "aliases": "aliases",
  "tags": "tags"
  };

  const DEFAULT_SECTION_ORDER = [
  { "title": "Summary ${filename}", "headerLevel": "2", "type": "bullet" },
  { "title": "Notes ${filename}", "headerLevel": "2", "type": "bullet" },
  { "title": "Research", "headerLevel": "2", "type": "bullet" },
  { "title": "Key Use Cases", "headerLevel": "2", "type": "bullet" },
  { "title": "Key Takeaways", "headerLevel": "2", "type": "bullet" }
  ];

  / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
  / / CONFIGURATION LOADER
  / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

  / * *
  * Loads all configuration from the Config sheet.
  * This makes the script completely data- driven.
  *
  * @returns {Object} Configuration object with all settings.
  * @throws {Error} If the Config sheet is missing or contains invalid JSON.
  * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
      / / MAIN GENERATOR FUNCTION
      / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

      / * *
      * Main function that reads configuration and processes the data sheet to create files.
      * This is the primary entry point triggered by the user.
      * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
        / / DATA PROCESSING
        / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

        / * *
        * Processes all valid rows in the data sheet.
        *
        * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet containing the data to process.
        * @param {Object} config The configuration object.
        * @param {Object} folderCache A cache to store Drive Folder objects for this run.
        * @returns {{created: number, errors: number}} An object with counts of created files and errors.
        * / / * *
            * Updates the spreadsheet in batches for better performance.
            *
            * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to update.
            * @param {Array < Object > } updates An array of update objects.
            * @param {Object} config The configuration object.
            * @param {Object} colMap The column name to index map.
            * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
              / / CONTENT GENERATION
              / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

              / * *
              * Generates the full markdown content for a single row based on configuration.
              * Applies specific formatting rules to YAML values.
              *
              * @param {Array < any > } row The data for the current row.
              * @param {Object} colMap The column name to index map.
              * @param {Object} config The configuration object.
              * @returns {string} The complete markdown content as a string.
              * / / * *
                      * Generates a single markdown section.
                      *
                      * @param {Object} section The configuration for the section.
                      * @param {Array < any > } row The data for the current row.
                      * @param {Object} colMap The column name to index map.
                      * @param {Object} config The global configuration object.
                      * @returns {string} The markdown for the generated section.
                      * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
                        / / FILE OPERATIONS
                        / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

                        / * *
                        * Creates a file in Drive, managing subfolders and handling duplicates.
                        *
                        * @param {string} filename The desired name for the file (without extension).
                        * @param {string} content The content of the file.
                        * @param {Object} config The configuration object.
                        * @param {Array < any > } row The data for the current row, used for subfolder lookup.
                        * @param {Object} colMap The column name to index map.
                        * @param {Object} folderCache A cache holding the parent and subfolder Drive objects.
                        * @returns {GoogleAppsScript.Drive.File} The newly created file object.
                        * @throws {Error} If the parent Drive folder is inaccessible.
                        * / / * *
                        * Gets a subfolder by name, or creates it if it doesn't exist.
                        *
                        * @param {GoogleAppsScript.Drive.Folder} parentFolder The parent folder to search within.
                        * @param {string} name The name of the subfolder to find or create.
                        * @returns {GoogleAppsScript.Drive.Folder} The existing or newly created subfolder.
                        * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
                        / / HELPER FUNCTIONS
                        / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

                        / * *
                        * Creates a mapping of column header names to their zero- based index.
                        *
                        * @param {Array < string > } headers An array of header strings from the sheet.
                        * @param {Object} customMapping A mapping of sheet headers to desired keys.
                        * @returns {Object} A map where keys are column names and values are their indices.
                        * / / * *
                          * Ensures a column for status messages exists, creating it if necessary.
                          *
                          * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to check.
                          * @param {Object} config The configuration object containing the status column name.
                          * / / * *
                          * Converts a string to Title Case.
                          *
                          * @param {string} str The input string to convert.
                          * @returns {string} The Title Cased string, or 'Uncategorized' if the input is empty.
                          * / / * *
                          * Converts a string to kebab- case (lowercase, spaces replaced with hyphens).
                          * @param {string} str The string to convert.
                          * @returns {string} The kebab- cased string.
                          * / / * *
                          * Converts a string to Sentence case (capitalizes the first letter).
                          * @param {string} str The string to convert.
                          * @returns {string} The Sentence- cased string.
                          * / / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
                          / / MENU, SETUP, AND FORMATTING
                          / / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

                          / * *
                          * Creates the custom UI menu when the spreadsheet is opened.
                          * Merges Markdown Generator and Custom Formatting functionality.
                          * / / * *
                          * Creates the 'Config' sheet with default settings and descriptions.
                          * Automatically applies standard formatting after creation.
                          * / / * *
                          * Creates a sample data sheet with columns that exactly match the default JSON configuration.
                          *
                          * @throws {Error} If the configuration cannot be loaded to determine the sheet name.
                          * / / * *
                          * Main formatting function that applies all formatting rules to every sheet.
                          * / / * *
                            * Applies a standard set of formatting rules to a given sheet.
                            * This is a reusable helper function.
                            *
                            * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet object to format.
                            * @param {boolean} shouldResizeColumns If true, resizes all columns to 100px.
                            * / / / Main Functions

/ / Main Functions

/**

 * Formats apply standardting for display
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {number} shouldResizeColumns - The shouldResizeColumns parameter
 * @returns {any} The result

 * /

function applyStandardFormatting(sheet, shouldResizeColumns) {
                              const dataRange = sheet.getDataRange();

                              / / Set font to Helvetica Neue, size 11 for all cells
                              dataRange.setFontFamily("Helvetica Neue")
                              .setFontSize(11);

                              / / Set horizontal alignment to left and vertical alignment to top for all cells
                              dataRange.setHorizontalAlignment("left")
                              .setVerticalAlignment("top");

                              / / Make the top row bold
                              const topRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
                              topRow.setFontWeight("bold");

                              / / Set text wrapping to clip for all cells
                              dataRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

                              / / Freeze the top row
                              sheet.setFrozenRows(1);

                              / / Optionally resize all columns to 100 pixels
                              if (shouldResizeColumns) {
                                const numColumns = sheet.getLastColumn();
                                for (let j = 1; j < = numColumns; j+ + ) {
                                  sheet.setColumnWidth(j, 100);
                                }
                              }
                            }

/**

 * Updates existing batch sheet
 * @param
 * @param {Sheet} sheet - The sheet to update
 * @param {any} updates - The updates to update
 * @param {Object} config - Configuration settings
 * @param {any} colMap - The colMap to update
 * @returns {any} The result

 * /

function batchUpdateSheet(sheet, updates, config, colMap) {
              const processedColIdx = config.processedColumn ? colMap[config.processedColumn] : - 1;
              const urlColIdx = config.urlColumn ? colMap[config.urlColumn] : - 1;
              const statusColIdx = config.statusColumn ? colMap[config.statusColumn] : - 1;

              / / Perform individual updates as ranges may not be contiguous
              updates.forEach(update = > {
                if (processedColIdx ! = = - 1) {
                  sheet.getRange(update.row, processedColIdx + 1).setValue(update.processed);
                }
                if (urlColIdx ! = = - 1) {
                  sheet.getRange(update.row, urlColIdx + 1).setValue(update.url);
                }
                if (statusColIdx ! = = - 1) {
                  sheet.getRange(update.row, statusColIdx + 1).setValue(update.status);
                }
                });

                SpreadsheetApp.flush(); / / Apply all pending changes at once
              }

/**

 * Creates new column map or resources
 * @param
 * @param {any} headers - The headers for creation
 * @param {any} customMapping - The customMapping for creation
 * @returns {any} The newly created any

 * /

function createColumnMap(headers, customMapping) {
                          const map = {};
                          const reverseMapping = {};
                          / / Create a reverse map for easier lookup
                          for (const key in customMapping) {
                            reverseMapping[customMapping[key]] = key;
                          }
                          headers.forEach((header, index) = > {
                            const key = reverseMapping[header] || header;
                            map[key] = index;
                            });
                            return map;
                          }

/**

 * Creates new config template or resources
 * @returns {any} The newly created any

 * /

function createConfigTemplate() {
                            const ss = SpreadsheetApp.getActiveSpreadsheet();
                            if (ss.getSheetByName('Config')) {
                              SpreadsheetApp.getUi().alert('The "Config" sheet already exists.');
                              return;
                            }

                            const configSheet = ss.insertSheet('Config');
                            const configData = [
                            ['Setting', 'Value', 'Description'],
                            ['folderId', 'YOUR_FOLDER_ID_HERE', 'REQUIRED: The ID of the Google Drive folder for output files.'],
                            ['dataSheetName', 'DataInput', 'The name of the sheet containing your data.'],
                            ['fileExtension', '.md', 'The file extension for generated files (e.g., .md, .txt).'],
                            ['filenameColumn', 'filename', 'The column header containing the base name for each file.'],
                            ['titleColumn', 'filename', 'The column for the main H1 title. Defaults to filenameColumn.'],
                            ['mainHeaderLevel', '1', 'The header level for the main title (1- 6).'],
                            ['sectionHeaderLevel', '2', 'The default header level for content sections (1- 6).'],
                            ['processedColumn', 'processed', 'A checkbox column to mark rows as complete and skip them.'],
                            ['urlColumn', 'url', 'A column to store the URL of the created file.'],
                            ['statusColumn', 'status', 'A column for status messages (e.g., "Success", "Error").'],
                            ['subfolderColumn', 'category', 'Optional: A column to create and organize files into subfolders.'],
                            ['batchSize', '50', 'Optional: Number of files to process at once. Blank to process all.'],
                            ['', '', ''],
                            ['yamlFields', JSON.stringify(DEFAULT_YAML_FIELDS, null, 2), 'JSON defining the YAML frontmatter. Keys are YAML keys, values are sheet column names.'],
                            ['', '', ''],
                            ['columnMapping', '{}', 'Optional JSON to map sheet headers to different names (e.g., {"Post Title": "filename"}).'],
                            ['', '', ''],
                            ['sectionOrder', JSON.stringify(DEFAULT_SECTION_ORDER, null, 2), 'JSON array defining the order and type of content sections.']
                            ];

                            configSheet.getRange(1, 1, configData.length, 3).setValues(configData);

                            / / Apply standard formatting first
                            applyStandardFormatting(configSheet, false); / / `false` to skip column resize

                            / / Apply specific formatting for this sheet
                            configSheet.setColumnWidth(1, 200);
                            configSheet.setColumnWidth(2, 400);
                            configSheet.setColumnWidth(3, 450);

                            SpreadsheetApp.getUi().alert('The "Config" sheet has been created and formatted. Please update the folderId.');
                          }

/**

 * Creates new file or resources
 * @param
 * @param {string} filename - The filename for creation
 * @param {string} content - The content to process
 * @param {Object} config - Configuration settings
 * @param {any} row - The row for creation
 * @param {any} colMap - The colMap for creation
 * @param {Folder} folderCache - The folderCache for creation
 * @returns {any} The newly created any

 * /

function createFile(filename, content, config, row, colMap, folderCache) {
                          / / Use the cached parent folder object for this run
                          if ( ! folderCache.parent) {
                            try {
                              folderCache.parent = DriveApp.getFolderById(config.folderId);
                            } catch (e) {
                              throw new Error(`Cannot access Drive folder. Check folderId and permissions. Error: ${e.message}`);
                            }
                          }
                          let parentFolder = folderCache.parent;

                          / / Handle subfolder logic
                          if (config.subfolderColumn) {
                            const subfolderName = row[colMap[config.subfolderColumn]] || 'Uncategorized';
                            const folderKey = toTitleCase(subfolderName);
                            / / Use the cache if this subfolder has been seen before in this run
                            if ( ! folderCache.subfolders[folderKey]) {
                              folderCache.subfolders[folderKey] = getOrCreateSubfolder(parentFolder, folderKey);
                            }
                            parentFolder = folderCache.subfolders[folderKey];
                          }

                          const sanitized = String(filename).replace(/ [ < > :"/ \\|?* ]/ g, '_').trim();
                          const extension = config.fileExtension || '.md';
                          const fullName = sanitized + extension;

                          / / Simplified duplicate check: Overwrite if exists.
                          const existingFiles = parentFolder.getFilesByName(fullName);
                          if (existingFiles.hasNext()) {
                            existingFiles.next().setTrashed(true);
                          }

                          return parentFolder.createFile(fullName, content, MimeType.PLAIN_TEXT);
                        }

/**

 * Creates new sample data sheet or resources
 * @returns {any} The newly created any

 * /

function createSampleDataSheet() {
                            const ss = SpreadsheetApp.getActiveSpreadsheet();
                            const dataSheetName = 'DataInput'; / / Use the established default name

                            if (ss.getSheetByName(dataSheetName)) {
                              SpreadsheetApp.getUi().alert(`The "${dataSheetName}" sheet already exists.`);
                              return;
                            }

                            const dataSheet = ss.insertSheet(dataSheetName);

                            / / Headers now match all fields in the updated DEFAULT_YAML_FIELDS constant.
                            const sampleHeaders = [
                            'filename', 'area', 'category', 'subCategory', 'topic', 'subTopic',
                            'dateCreated', 'dateRevised', 'aliases', 'tags',
                            'processed', 'url', 'status'
                            ];

                            const sampleData = [
                            sampleHeaders,
                            [
                            'getting- started- guide', 'Sales', 'Documentation', 'Onboarding', 'Setup', 'Initial Configuration',
                            new Date(), new Date(), 'start here, beginner guide', 'setup, tutorial, new',
                            false, '', ''
                            ],
                            [
                            'api- reference- v2', 'Engineering', 'Technical Docs', 'API', 'Reference', 'Endpoints',
                            new Date(), new Date(), 'api docs, v2 api', 'api, reference, developer',
                            false, '', ''
                            ]
                            ];

                            dataSheet.getRange(1, 1, sampleData.length, sampleData[0].length).setValues(sampleData);

                            / / Insert checkboxes in the 'processed' column
                            const processedColIdx = sampleHeaders.indexOf('processed');
                            if (processedColIdx ! = = - 1) {
                              dataSheet.getRange(2, processedColIdx + 1, dataSheet.getLastRow() - 1, 1).insertCheckboxes();
                            }

                            / / Apply standard formatting first
                            applyStandardFormatting(dataSheet, false); / / `false` to skip column resize

                            / / Apply specific auto- sizing for this sheet's content
                            dataSheet.autoResizeColumns(1, sampleData[0].length);

                            SpreadsheetApp.getUi().alert(`Sample data sheet "${dataSheetName}" has been created and formatted to match the default JSON.`);
                          }

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {Object} config - Configuration settings
 * @returns {any} The result

 * /

function ensureStatusColumn(sheet, config) {
                            const statusColumnName = config.statusColumn || 'status';
                            if ( ! statusColumnName) return;

                            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
                            if (headers.indexOf(statusColumnName) = = = - 1) {
                              const newCol = sheet.getLastColumn() + 1;
                              sheet.getRange(1, newCol).setValue(statusColumnName).setFontWeight('bold');
                            }
                          }

/**

 * Generates new content or reports
 * @param
 * @param {any} row - The row parameter
 * @param {any} colMap - The colMap parameter
 * @param {Object} config - Configuration settings
 * @returns {any} The result

 * /

function generateContent(row, colMap, config) {
                let content = '';
                const spreadsheetTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

                if (config.yamlFields) {
                  content + = '- - - \n';
                  Object.entries(config.yamlFields).forEach(([key, colName]) = > {
                    const yamlKey = key.toLowerCase().replace(/ \s+ / g, '- ').replace(/ _/ g, '- ');
                    let value = row[colMap[colName]];

                    if (value = = = null || value = = = undefined || value = = = '') return;

                    / / Rule: Format dates as yyyy- MM- dd
                    if ((yamlKey = = = 'datecreated' || yamlKey = = = 'daterevised') && value instanceof Date) {
                      content + = `${yamlKey}: ${Utilities.formatDate(value, spreadsheetTz, 'yyyy- MM- dd')}\n`;
                      return; / / Done with this field
                    }

                    let valueStr = String(value);
                    let isList = valueStr.includes(',');

                    / / For lists, format each item individually. For single values, create a temporary list to use the same logic.
                    const items = isList ? valueStr.split(',').map(item = > item.trim()).filter(Boolean) : [valueStr];

                    const formattedItems = items.map(item = > {
                      switch (yamlKey) {
                        case 'area':
                        case 'category':
                        case 'subcategory':
                        case 'topic':
                        case 'subtopic':
                        return toKebabCase(item);
                        / / Rule: No changes for filename, aliases, and tags
                        case 'filename':
                        case 'aliases':
                        case 'tags':
                        default:
                        return item;
                      }
                      });

                      / / Build the final YAML output
                      if (isList && formattedItems.length > 0) {
                        content + = `${yamlKey}:\n`;
                        formattedItems.forEach(item = > {
                          content + = `  - ${item}\n`;
                          });
                        } else if ( ! isList && formattedItems.length > 0) {
                          content + = `${yamlKey}: ${formattedItems[0]}\n`;
                        }
                        });
                        content + = '- - - \n\n';
                      }

                      const titleCol = config.titleColumn || config.filenameColumn || 'filename';
                      const title = row[colMap[titleCol]] || 'Untitled';
                      const mainHeaderLevel = config.mainHeaderLevel || '1';
                      content + = `${'#'.repeat(parseInt(mainHeaderLevel, 10))} ${title}\n\n`;

                      if (config.sectionOrder) {
                        config.sectionOrder.forEach(section = > {
                          const sectionContent = generateSection(section, row, colMap, config);
                          if (sectionContent) {
                            content + = sectionContent;
                          }
                          });
                        }

                        return content;
                      }

/**

 * Generates new content or reports
 * @returns {any} The result

 * /

function generateMarkdownFiles() {
        try {
          const config = loadConfiguration();

          if ( ! config.folderId) {
            throw new Error('folderId not configured. Please add it to the Config sheet.');
          }

          const ss = SpreadsheetApp.getActiveSpreadsheet();
          / / Use the sheet name from the config, or fall back to a default
          const dataSheetName = config.dataSheetName || 'DataInput';
          const dataSheet = ss.getSheetByName(dataSheetName);

          if ( ! dataSheet) {
            throw new Error(`Data sheet "${dataSheetName}" not found.`);
          }

          ensureStatusColumn(dataSheet, config);

          / / Initialize a cache for this run to hold Drive folder objects
          const folderCache = {
            parent: null,
            subfolders: {}
            };

            const results = processDataSheet(dataSheet, config, folderCache);

            console.log(`Completed ! Created: ${results.created}, Errors: ${results.errors}`);
            SpreadsheetApp.getUi().alert(`Processing complete ! \n\nCreated: ${results.created}\nErrors: ${results.errors}`);

          } catch (error) {
            console.error('An unrecoverable error occurred: ' + error.message);
            SpreadsheetApp.getUi().alert(`An error occurred: ${error.message}`);
          }
        }

/**

 * Generates new content or reports
 * @param
 * @param {any} section - The section parameter
 * @param {any} row - The row parameter
 * @param {any} colMap - The colMap parameter
 * @param {Object} config - Configuration settings
 * @returns {any} The result

 * /

function generateSection(section, row, colMap, config) {
                        const rawContent = section.column ? (row[colMap[section.column]] || '') : '';
                        / / The 'bullet' type does not depend on content, so it should always run.
                        if ( ! rawContent && section.type ! = = 'bullet') return '';

                        let sectionContent = '';
                        const sectionHeaderLevel = section.headerLevel || config.sectionHeaderLevel || '2';
                        const headerPrefix = '#'.repeat(parseInt(sectionHeaderLevel, 10));

                        / / Process title - can include variables like ${filename}
                        let sectionTitle = section.title || section.column || '';
                        sectionTitle = sectionTitle.replace(/ \${(\w+ )}/ g, (match, colName) = > row[colMap[colName]] || '');

                        sectionContent + = `${headerPrefix} ${sectionTitle}\n\n`;

                        switch (section.type) {
                          case 'list':
                          const items = String(rawContent).split(section.delimiter || ';').map(item = > item.trim()).filter(Boolean);
                          items.forEach(item = > {
                            sectionContent + = `- ${item}\n`;
                            });
                            break;

                            case 'bullet':
                            / / This type creates a heading and a single empty bullet point as a placeholder.
                            sectionContent + = '- \n';
                            break;

                            default: / / 'text'
                            sectionContent + = `${rawContent}\n`;
                          }

                          return sectionContent + '\n';
                        }

/**

 * Gets specific or create subfolder or configuration
 * @param
 * @param {Folder} parentFolder - The parentFolder to retrieve
 * @param {string} name - The name to use
 * @returns {any} The requested any

 * /

function getOrCreateSubfolder(parentFolder, name) {
                          const folders = parentFolder.getFoldersByName(name);
                          if (folders.hasNext()) {
                            return folders.next();
                          }
                          console.log(`Creating new subfolder: "${name}"`);
                          return parentFolder.createFolder(name);
                        }

/**

 * Loads configuration from storage
 * @returns {any} The result

 * /

function loadConfiguration() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = ss.getSheetByName('Config');

    if ( ! configSheet) {
      throw new Error('Config sheet not found. Please create a "Config" sheet via the menu.');
    }

    const configData = configSheet.getDataRange().getValues();
    const config = {};

    configData.forEach(row = > {
      if (row[0] && row[1] ! = = '') {
        config[row[0]] = row[1];
      }
      });

      / / Parse JSON fields with enhanced error handling
      ['yamlFields', 'columnMapping', 'sectionOrder'].forEach(field = > {
        if (config[field]) {
          try {
            config[field] = JSON.parse(config[field]);
          } catch (e) {
            throw new Error(`Invalid JSON in '${field}' configuration. Parser error: ${e.message}`);
          }
        }
        });

        return config;
      }

/**

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function onOpen() {
                            SpreadsheetApp.getUi()
                            .createMenu('Markdown Generator')
                            .addItem('Generate Files', 'generateMarkdownFiles')
                            .addSeparator()
                            .addItem('Setup Config Sheet', 'createConfigTemplate')
                            .addItem('Create Sample Data Sheet', 'createSampleDataSheet')
                            .addSeparator()
                            .addItem('Format All Sheets', 'formatAllSheets')
                            .addToUi();
                          }

/**

 * Processes and transforms data sheet
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {Object} config - Configuration settings
 * @param {Folder} folderCache - The folderCache parameter
 * @returns {any} The result

 * /

function processDataSheet(sheet, config, folderCache) {
          const data = sheet.getDataRange().getValues();
          const headers = data[0];
          const colMap = createColumnMap(headers, config.columnMapping || {});

          let created = 0;
          let errors = 0;

          const batchSize = config.batchSize ? parseInt(config.batchSize, 10) : null;
          const updates = [];

          const unprocessedRows = [];
          for (let i = 1; i < data.length; i+ + ) {
            / / Check if the "processed" column exists and if the checkbox is checked (true)
            const processedColumnName = config.processedColumn || 'processed';
            const isProcessed = colMap[processedColumnName] ! = = undefined ? data[i][colMap[processedColumnName]] = = = true : false;
            if ( ! isProcessed) {
              unprocessedRows.push({ row: data[i], index: i });
            }
          }

          const rowsToProcess = batchSize ? unprocessedRows.slice(0, batchSize) : unprocessedRows;

          if (rowsToProcess.length = = = 0) {
            console.log('No unprocessed rows found.');
            return { created: 0, errors: 0 };
          }

          console.log(`Processing ${rowsToProcess.length} of ${unprocessedRows.length} unprocessed rows...`);

          for (const rowData of rowsToProcess) {
            const { row, index } = rowData;
            const rowNum = index + 1;

            try {
              const filenameColumnName = config.filenameColumn || 'filename';
              const filename = row[colMap[filenameColumnName]];
              if ( ! filename) {
                throw new Error(`Filename is empty in column '${filenameColumnName}'.`);
              }

              const content = generateContent(row, colMap, config);
              const file = createFile(filename, content, config, row, colMap, folderCache);

              updates.push({
                row: rowNum,
                processed: true,
                url: file.getUrl(),
                status: '✅ Success'
                });
                created+ + ;
              } catch (error) {
                errors+ + ;
                updates.push({
                  row: rowNum,
                  processed: false,
                  url: '',
                  status: `❌ ${error.message}`
                  });
                  console.error(`Row ${rowNum} error: ${error.message}`);
                }
              }

              if (updates.length > 0) {
                batchUpdateSheet(sheet, updates, config, colMap);
              }

              if (batchSize && unprocessedRows.length > rowsToProcess.length) {
                const remaining = unprocessedRows.length - rowsToProcess.length;
                console.log(`${remaining} rows remaining. Run the script again to process the next batch.`);
              }

              return { created, errors };
            }

/**

 * Performs specialized operations
 * @param
 * @param {any} str - The str parameter
 * @returns {any} The result

 * /

function toKebabCase(str) {
                            if ( ! str || typeof str ! = = 'string') return '';
                            return str.trim().toLowerCase().replace(/ \s+ / g, '- ');
                          }

/**

 * Performs specialized operations
 * @param
 * @param {any} str - The str parameter
 * @returns {any} The result

 * /

function toSentenceCase(str) {
                            if ( ! str || typeof str ! = = 'string') return '';
                            const trimmed = str.trim();
                            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                          }

/**

 * Performs specialized operations
 * @param
 * @param {any} str - The str parameter
 * @returns {any} The result

 * /

function toTitleCase(str) {
                            if ( ! str || typeof str ! = = 'string') return 'Uncategorized';
                            return str.toLowerCase().split(' ').map(word = >
                            word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ');
                          }

/ / Helper Functions

/**

 * Formats all sheets for display
 * @returns {any} The result

 * /

function formatAllSheets() {
                            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
                            const sheets = spreadsheet.getSheets();
                            sheets.forEach(sheet = > {
                              applyStandardFormatting(sheet, true); / / `true` to force column resize
                              });
                              SpreadsheetApp.getUi().alert('All sheets have been formatted successfully ! ');
                            }