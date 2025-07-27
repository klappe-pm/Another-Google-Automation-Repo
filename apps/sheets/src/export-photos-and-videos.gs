/ * *
 * Script Name: export- photos- and- videos
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Extract photos and videos data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Validate input data
 * 4. Process and transform data
 * 5. Sort data by relevant fields
 * 6. Format output for presentation
 * 7. Write results to destination
 *
 * Script Functions:
 * - addSelectedAlbumsToIndex(): Works with spreadsheet data
 * - clearAlbumsCache(): Performs specialized operations
 * - createIndexSheet(): Creates new index sheet or resources
 * - exportPhotoAlbumsToSheets(): Exports photo albums to sheets to external format
 * - fetchWithRetry(): Retrieves with retry from service
 * - findNextUnprocessedAlbum(): Processes and transforms find next uned album
 * - getGooglePhotosAlbums(): Gets specific google photos albums or configuration
 * - getPhotosFromAlbum(): Gets specific photos from album or configuration
 * - listAllAlbums(): Checks boolean condition
 * - notify(): Performs specialized operations
 * - onOpen(): Works with spreadsheet data
 * - processPhotoItem(): Processes and transforms photo item
 * - processPhotos(): Processes and transforms photos
 * - recordProcessedFiles(): Processes and transforms recorded files
 * - resetProcessedAlbums(): Sets re processed albums or configuration values
 * - sortSheetByCreateTime(): Creates new sort sheet by time or resources
 * - updateAlbumIndex(): Updates existing album index
 * - writeDataToSheet(): Writes data to sheet to destination
 *
 * Script Helper Functions:
 * - sanitizeSheetName(): Cleans and sanitizes input
 * - setupSheet(): Sets up sheet or configuration values
 *
 * Script Dependencies:
 * - OAuth2 library
 *
 * Google Services:
 * - Logger: For logging and debugging
 * - ScriptApp: For script management and triggers
 * - SpreadsheetApp: For spreadsheet operations
 * - UrlFetchApp: For HTTP requests to external services
 * - Utilities: For utility functions and encoding
 * /

const DEFAULT_CONFIG = {
  batchSize: 50,
  thumbnailColumnWidth: 100,
  rowHeight: 75,
  maxRetries: 3,
  baseRetryDelay: 1000,
  apiThrottleDelay: 500,
  useThumbnails: true,
  albumHeaders: [
    "Thumbnail", "Album Name", "Filename", "ID", "File Link", "Create Date", "Create Time", "Description"
  ],
  processedHeaders: [
    "Album Name", "Album ID", "File ID", "File Link"
  ]
};

/ * *
 * Main export function
 * / / * *
 * Creates an index sheet if it doesn't exist
 * / / * *
 * Finds the next unprocessed album
 * / / * *
 * Processes photos from an album
 * / / * *
 * Updates the album index sheet
 * / / * *
 * Gets the configuration from the Config sheet
 * / / * *
 * Sets up a sheet for album data
 * / / * *
 * Process a single photo item
 * / / * *
 * Writes data to a sheet
 * / / * *
 * Sorts a sheet by create time
 * / / * *
 * Resets the processed flag for all albums
 * / / * *
 * Clears the albums cache
 * / / * *
 * Shows a notification to the user
 * / / * *
 * Gets all albums from Google Photos
 * / / * *
 * Gets photos from an album
 * / / * *
 * Fetches a URL with retry logic
 * /
) {
  options.headers = { "Authorization": "Bearer " + ScriptApp.getOAuthToken() };
  options.muteHttpExceptions = true;

  for (let attempt = 0; attempt < = DEFAULT_CONFIG.maxRetries; attempt+ + ) {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();

    if (code = = = 200) return response;

    if (code > = 400) {
      const errorContent = response.getContentText();
      Logger.log(`HTTP Error ${code}: ${errorContent}`);

      if (code = = = 401 || code = = = 403) {
        Logger.log("Permission error - check your OAuth scopes");
      }

      if (code ! = = 429 && code < 500) {
        return { error: `Client error ${code}: ${errorContent}` };
      }
    }

    Utilities.sleep(DEFAULT_CONFIG.baseRetryDelay * Math.pow(2, attempt));
  }

  return { error: "Max retries exceeded" };
}

/ * *
 * Sanitizes a sheet name
 * / / * *
 * Creates a new sheet with all available Google Photos albums and their IDs
 * to help update your "Album Index" sheet with the correct IDs
 * / / * *
 * Adds selected albums to the index
 * /

function getConfigFromSheet(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("Config") || spreadsheet.insertSheet("Config");
  const config = { ...DEFAULT_CONFIG };

  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, 2).setValues([["Key", "Value"]]);
    Object.entries(DEFAULT_CONFIG).forEach(([key, value], i) = > {
      sheet.getRange(i + 2, 1, 1, 2).setValues([[key, typeof value = = = "object" ? JSON.stringify(value) : value]]);
    });
  }

  const data = sheet.getDataRange().getValues().slice(1);
  data.forEach(([key, value]) = > {
    if (key in DEFAULT_CONFIG) {
      try {
        config[key] = typeof DEFAULT_CONFIG[key] = = = "object" ? JSON.parse(value) : value;
      } catch (e) {
        Logger.log(`Invalid config for ${key}: ${e}`);
      }
    }
  });
  return config;
}

/ / Main Functions

/ * *

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function addSelectedAlbumsToIndex() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const availableSheet = spreadsheet.getSheetByName("Available Albums");

  if (! availableSheet) {
    SpreadsheetApp.getUi().alert("Please run 'List All Available Albums' first.");
    return;
  }

  const indexSheet = spreadsheet.getSheetByName("Album Index") || createIndexSheet(spreadsheet);
  const data = availableSheet.getDataRange().getValues();

  / / Skip header row
  let addedCount = 0;
  for (let i = 1; i < data.length; i+ + ) {
    const [albumName, albumId, photoCount, isSelected] = data[i];

    / / Only add selected albums
    if (isSelected = = = true) {
      / / Check if this ID already exists in the index
      const indexData = indexSheet.getDataRange().getValues();
      let exists = false;

      for (let j = 1; j < indexData.length; j+ + ) {
        if (indexData[j][1] = = = albumId) {
          exists = true;
          break;
        }
      }

      if (! exists) {
        / / Add to the next available row
        const nextRow = indexSheet.getLastRow() + 1;
        indexSheet.getRange(nextRow, 1, 1, 2).setValues([[false, albumId]]);
        addedCount+ + ;
      }
    }
  }

  if (addedCount > 0) {
    SpreadsheetApp.getUi().alert(`Added ${addedCount} album(s) to the index. You can now run "Export Next Album" to process them.`);
  } else {
    SpreadsheetApp.getUi().alert("No albums were selected. Please check the boxes in column D for albums you want to add.");
  }
}

/ * *

 * Performs specialized operations
 * @returns {any} The result

 * /

function clearAlbumsCache() {
  CacheService.getScriptCache().remove("all_albums");
  Logger.log("Albums cache cleared");
  notify("Albums cache cleared. Run 'Export Next Album' to refresh data.");
}

/ * *

 * Creates new index sheet or resources
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet for creation
 * @returns {any} The newly created any

 * /

function createIndexSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet("Album Index");
  sheet.getRange(1, 1, 1, 4).setValues([["Processed", "Album ID", "Tab Link", "Photo Count"]]);
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(3, 200);
  notify("Created 'Album Index' tab. Add album IDs in Column B.");
  return sheet;
}

/ * *

 * Exports photo albums to sheets to external format
 * @returns {any} The result

 * /

function exportPhotoAlbumsToSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const config = getConfigFromSheet(spreadsheet);
  const indexSheet = spreadsheet.getSheetByName("Album Index") || createIndexSheet(spreadsheet);

  const allAlbums = getGooglePhotosAlbums();
  Logger.log(`Found ${allAlbums.length} albums from Google Photos API`);
  if (! allAlbums.length) {
    notify("No albums found in Google Photos. Check permissions.", true);
    return;
  }

  const data = indexSheet.getDataRange().getValues().slice(1);
  const albumInfo = findNextUnprocessedAlbum(data, allAlbums);

  if (! albumInfo) {
    notify("No unprocessed albums with valid IDs found.");
    return;
  }

  const { album, rowIndex } = albumInfo;
  const tabName = sanitizeSheetName(album.title || `Untitled_${album.id.slice(0, 8)}`);
  notify(`Processing album: ${album.title || "Untitled"} (ID: ${album.id})`);

  const sheet = setupSheet(spreadsheet, tabName, config.albumHeaders);
  const photos = getPhotosFromAlbum(album.id, config.batchSize);
  if (photos.error) {
    notify(`Error fetching photos: ${photos.error}`, true);
    return;
  }

  const { photoData, fileCount } = processPhotos(photos, tabName, config.useThumbnails);
  if (photoData.length) {
    writeDataToSheet(sheet, photoData, config.albumHeaders);
    sortSheetByCreateTime(sheet);
    updateAlbumIndex(indexSheet, rowIndex, sheet, tabName, fileCount);
    recordProcessedFiles(spreadsheet, photoData.map(p = > ({
      "Album Name": tabName,
      "Album ID": album.id,
      "File ID": p.id,
      "File Link": p.fileLink
    })));
  }

  notify(`Completed: ${album.title || "Untitled"}. ${fileCount} photos exported.`);
}

/ * *

 * Retrieves with retry from service
 * @param
 * @param {string} url - The URL to access
 * @param {Object} options - Configuration options
 * @param {any} allAlbums - The allAlbums parameter
 * @returns {any} The result

 * /

function fetchWithRetry(url, options = {}

/ * *

 * Processes and transforms find next uned album
 * @param
 * @param {Object} data - The data object to process
 * @param {any} allAlbums - The allAlbums parameter
 * @returns {any} The result

 * /

function findNextUnprocessedAlbum(data, allAlbums) {
  Logger.log(`Looking through ${data.length} rows of data for unprocessed albums...`);

  / / Log the first few album IDs from the API for comparison
  if (allAlbums.length > 0) {
    Logger.log(`Sample album IDs from API: ${allAlbums.slice(0, 3).map(a = > a.id).join(', ')}`);
  }

  for (let i = 0; i < data.length; i+ + ) {
    const [isProcessed, albumId] = data[i];
    Logger.log(`Row ${i+ 2}: isProcessed= ${isProcessed}, albumId= ${albumId}`);

    / / Check for any falsy value (blank, false, null, undefined, empty string)
    if (! isProcessed && albumId && albumId.toString().trim() ! = = '') {
      const stringId = albumId.toString().trim();
      Logger.log(`Looking for album with ID: ${stringId}`);

      const album = allAlbums.find(a = > a.id.toString() = = = stringId);
      if (album) {
        Logger.log(`Found matching album: ${album.title || "Untitled"}`);
        return { album, rowIndex: i + 2 };
      } else {
        Logger.log(`No matching album found for ID: ${stringId}`);
      }
    }
  }

  Logger.log("No unprocessed albums found.");
  return null;
}

/ * *

 * Gets specific google photos albums or configuration
 * @returns {any} The requested any

 * /

function getGooglePhotosAlbums() {
  const cache = CacheService.getScriptCache();
  const cacheKey = "all_albums";
  / / Comment out cache temporarily for debugging
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const albums = [];
  let nextPageToken = null;

  Logger.log("Fetching albums from Google Photos API...");

  do {
    / / Modified to include shared albums
    const url = `https:/ / photoslibrary.googleapis.com/ v1/ albums?pageSize= 50&excludeNonAppCreatedData= false${nextPageToken ? `&pageToken= ${nextPageToken}` : ''}`;
    Logger.log(`Fetching URL: ${url}`);

    const response = fetchWithRetry(url);

    if (response.error) {
      Logger.log(`API Error: ${response.error}`);
      return [];
    }

    const responseText = response.getContentText();
    Logger.log(`Response first 200 chars: ${responseText.substring(0, 200)}...`);

    try {
      const data = JSON.parse(responseText);

      if (data.albums && data.albums.length > 0) {
        Logger.log(`Found ${data.albums.length} albums in this batch`);
        Logger.log(`First album: ${JSON.stringify(data.albums[0])}`);
        albums.push(...data.albums);
      } else {
        Logger.log("No albums found in this response");
      }

      nextPageToken = data.nextPageToken;
      if (nextPageToken) {
        Logger.log(`Next page token: ${nextPageToken}`);
      }
    } catch (e) {
      Logger.log(`Error parsing response: ${e}`);
      return [];
    }
  } while (nextPageToken);

  Logger.log(`Total albums found: ${albums.length}`);
  if (albums.length > 0) {
    / / Log a few sample IDs to compare with your sheet
    Logger.log(`Sample album IDs: ${albums.slice(0, 3).map(a = > a.id).join(', ')}`);
  }

  cache.put(cacheKey, JSON.stringify(albums), 21600);
  return albums;
}

/ * *

 * Gets specific photos from album or configuration
 * @param
 * @param {string} albumId - The albumId to retrieve
 * @param {number} maxResults - The maxResults to retrieve
 * @returns {any} The requested any

 * /

function getPhotosFromAlbum(albumId, maxResults) {
  const photos = [];
  let nextPageToken = null;

  Logger.log(`Getting photos from album ID: ${albumId}`);

  do {
    const url = "https:/ / photoslibrary.googleapis.com/ v1/ mediaItems:search";
    const response = fetchWithRetry(url, {
      method: "post",
      contentType: "application/ json",
      payload: JSON.stringify({
        albumId,
        pageSize: maxResults,
        pageToken: nextPageToken || undefined
      })
    });

    if (response.error) {
      Logger.log(`Error fetching photos: ${response.error}`);
      return { error: response.error };
    }

    const data = JSON.parse(response.getContentText());
    Logger.log(`Found ${data.mediaItems ? data.mediaItems.length : 0} media items in this batch`);

    if (data.mediaItems) photos.push(...data.mediaItems);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  Logger.log(`Total photos found in album: ${photos.length}`);
  return photos;
}

/ * *

 * Checks boolean condition
 * @returns {any} True if condition is met, false otherwise

 * /

function listAllAlbums() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("Available Albums") || spreadsheet.insertSheet("Available Albums");

  / / Clear the sheet and set up headers
  sheet.clear();
  sheet.getRange(1, 1, 1, 5).setValues([["Album Name", "Album ID", "Photo Count", "Select", "Album Link"]]);
  sheet.getRange(1, 1, 1, 5).setFontWeight("bold");

  / / Get all albums
  const albums = getGooglePhotosAlbums();

  if (! albums.length) {
    sheet.getRange(2, 1).setValue("No albums found. Check permissions.");
    SpreadsheetApp.getUi().alert("No albums found in Google Photos. Check permissions.");
    return;
  }

  / / Prepare the data
  const data = albums.map(album = > [
    album.title || "Untitled",
    album.id,
    album.mediaItemsCount || "0",
    false,
    `= HYPERLINK("${album.productUrl}","Open Album")`
  ]);

  / / Write to sheet
  sheet.getRange(2, 1, data.length, 5).setValues(data);

  / / Auto- size columns
  sheet.autoResizeColumn(1);
  sheet.autoResizeColumn(2);
  sheet.autoResizeColumn(3);
  sheet.autoResizeColumn(5);

  / / Add instructions
  sheet.getRange(1, 7, 4, 1).setValues([
    ["Instructions:"],
    ["1. Find the albums you want to export"],
    ["2. Check the box in column D for albums to add"],
    ["3. Click 'Add Selected Albums to Index'"]
  ]);

  SpreadsheetApp.getUi().alert("Album list created! Check the boxes in column D for albums you want to add to your index, then click 'Add Selected Albums to Index' from the Photo Albums menu.");
}

/ * *

 * Performs specialized operations
 * @param
 * @param {string} message - The message content
 * @param {any} isError - The isError parameter
 * @returns {any} The result

 * /

function notify(message, isError = false) {
  try {
    const ui = SpreadsheetApp.getUi();
    if (isError) {
      ui.alert("Error", message, ui.ButtonSet.OK);
    } else {
      ui.toast(message);
    }
  } catch (e) {
    Logger.log(`${isError ? "Error" : "Info"}: ${message}`);
  }
}

/ * *

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Photo Albums")
    .addItem("Export Next Album", "exportPhotoAlbumsToSheets")
    .addItem("List All Available Albums", "listAllAlbums")
    .addItem("Add Selected Albums to Index", "addSelectedAlbumsToIndex")
    .addItem("Reset Processed Albums", "resetProcessedAlbums")
    .addItem("Clear Albums Cache", "clearAlbumsCache")
    .addToUi();
}

/ * *

 * Processes and transforms photo item
 * @param
 * @param {any} mediaItem - The mediaItem parameter
 * @param {string} albumName - The albumName parameter
 * @param {any} useThumbnails - The useThumbnails parameter
 * @returns {any} The result

 * /

function processPhotoItem(mediaItem, albumName, useThumbnails) {
  try {
    const createDateTime = new Date(mediaItem.mediaMetadata.creationTime);
    const isVideo = mediaItem.mediaMetadata.video;

    / / Match the exact property names to the headers in DEFAULT_CONFIG.albumHeaders
    return {
      thumbnail: useThumbnails && ! isVideo ? `= IMAGE("${mediaItem.baseUrl}= w100- h100", 1)` : "",
      albumName,
      filename: mediaItem.filename,
      id: mediaItem.id,
      fileLink: mediaItem.productUrl,    / / This matches "File Link" in the headers
      createDate: Utilities.formatDate(createDateTime, "GMT", "yyyy- MM- dd"),  / / This matches "Create Date"
      createTime: Utilities.formatDate(createDateTime, "GMT", "HH:mm:ss"),    / / This matches "Create Time"
      description: mediaItem.description || ""
    };
  } catch (e) {
    Logger.log(`Error processing photo ${mediaItem.id || 'unknown'}: ${e}`);
    return null;
  }
}

/ * *

 * Processes and transforms photos
 * @param
 * @param {any} photos - The photos parameter
 * @param {string} albumName - The albumName parameter
 * @param {any} useThumbnails - The useThumbnails parameter
 * @returns {any} The result

 * /

function processPhotos(photos, albumName, useThumbnails) {
  const fileIds = new Set();
  const photoData = [];

  for (const photo of photos) {
    const item = processPhotoItem(photo, albumName, useThumbnails);
    if (item && ! fileIds.has(item.id)) {
      fileIds.add(item.id);
      photoData.push(item);
    }
  }

  return { photoData, fileCount: fileIds.size };
}

/ * *

 * Processes and transforms recorded files
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @param {File} processedFiles - The processedFiles parameter
 * @returns {any} The result

 * /

function recordProcessedFiles(spreadsheet, processedFiles) {
  let sheet = spreadsheet.getSheetByName("Processed") || spreadsheet.insertSheet("Processed");
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, DEFAULT_CONFIG.processedHeaders.length).setValues([DEFAULT_CONFIG.processedHeaders]).setFontWeight("bold");
  }
  const data = processedFiles.map(f = > [f["Album Name"], f["Album ID"], f["File ID"], f["File Link"]]);
  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, DEFAULT_CONFIG.processedHeaders.length).setValues(data);
}

/ * *

 * Sets re processed albums or configuration values
 * @returns {any} The result

 * /

function resetProcessedAlbums() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const indexSheet = spreadsheet.getSheetByName("Album Index");
  const processedSheet = spreadsheet.getSheetByName("Processed");

  if (indexSheet) {
    const dataRange = indexSheet.getDataRange();
    const data = dataRange.getValues();
    for (let i = 1; i < data.length; i+ + ) {
      indexSheet.getRange(i + 1, 1).setValue(false);
      indexSheet.getRange(i + 1, 3, 1, 2).clear();
    }
  }
  if (processedSheet) processedSheet.clear();
  notify("Reset completed.");
}

/ * *

 * Creates new sort sheet by time or resources
 * @param
 * @param {Sheet} sheet - The sheet for creation
 * @returns {any} The newly created any

 * /

function sortSheetByCreateTime(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).sort({ column: 7, ascending: true });
  }
}

/ * *

 * Updates existing album index
 * @param
 * @param {number} indexSheet - The indexSheet to update
 * @param {number} rowIndex - The rowIndex to update
 * @param {Sheet} sheet - The sheet to update
 * @param {string} tabName - The tabName to update
 * @param {number} fileCount - The fileCount to update
 * @returns {any} The result

 * /

function updateAlbumIndex(indexSheet, rowIndex, sheet, tabName, fileCount) {
  const hyperlink = `= HYPERLINK("#gid= ${sheet.getSheetId()}","${tabName}")`;
  indexSheet.getRange(rowIndex, 3).setValue(hyperlink);
  indexSheet.getRange(rowIndex, 4).setValue(fileCount);
  indexSheet.getRange(rowIndex, 1).setValue(true);
}

/ * *

 * Writes data to sheet to destination
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {Object} photoData - The photoData parameter
 * @param {any} headers - The headers parameter
 * @returns {any} The result

 * /

function writeDataToSheet(sheet, photoData, headers) {
  / / Create a mapping that properly handles spaces in header names
  const headerMap = {};
  headers.forEach(header = > {
    / / Convert to camelCase property name
    const propName = header.toLowerCase().replace(/ \s+ (.)/ g, (match, group) = > group.toUpperCase());
    / / Remove any remaining spaces
    headerMap[header] = propName.replace(/ \s+ / g, "");
  });

  / / Log the mapping for debugging
  Logger.log("Header mapping: " + JSON.stringify(headerMap));

  / / Map the data using the header mapping
  const data = photoData.map(obj = > {
    return headers.map(header = > {
      const propName = headerMap[header];
      return obj[propName] ! = = undefined ? obj[propName] : "";
    });
  });

  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, data.length, headers.length).setValues(data);
  sheet.setRowHeights(startRow, data.length, DEFAULT_CONFIG.rowHeight);
  for (let i = 2; i < = headers.length; i+ + ) sheet.autoResizeColumn(i);
}

/ / Helper Functions

/ * *

 * Cleans and sanitizes input
 * @param
 * @param {string} name - The name to use
 * @returns {any} The result

 * /

function sanitizeSheetName(name) {
  return name.replace(/ [\[\]* / \\?]/ g, "_").slice(0, 31);
}

function setupSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  sheet.clear().setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  sheet.setColumnWidth(1, DEFAULT_CONFIG.thumbnailColumnWidth);
  return sheet;
}