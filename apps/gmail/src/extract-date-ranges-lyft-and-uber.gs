/ * *
 * Script Name: extract- date- ranges- lyft- and- uber
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Format output for presentation
 * 7. Send notifications or reports
 *
 * Script Functions:
 * - appendToSheet(): Appends to sheet to existing content
 * - createMapsLink(): Creates new maps link or resources
 * - extractReceiptFromMessage(): Extracts specific information
 * - extractReceiptsFromGmailDateRange(): Extracts specific information
 * - getExistingMessageIds(): Gets specific existing message ids or configuration
 * - processRideReceiptsDateRange(): Processes and transforms ride receipts date range
 *
 * Script Helper Functions:
 * - cleanAddress(): Performs specialized operations
 * - convertTo24Hour(): Converts between formats
 * - formatDate(): Formats date for display
 * - formatDuration(): Formats duration for display
 * - parseTime(): Sets parime or configuration values
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ / Main Functions

/ * *

 * Appends to sheet to existing content
 * @param
 * @param {any} receipts - The receipts parameter
 * @returns {Array} Array of results

 * /

function appendToSheet(receipts) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RideReceipts'); / / Create sheet if it doesn't exist;
    if (! sheet) {
      sheet = spreadsheet.insertSheet('RideReceipts'); / / Create headers for new sheet;
      const headers = [;
        'Thread ID', 'Message ID', 'Message Link', 'Provider', 'Trip Date', 'Trip Start Time', 'Trip End Time',
        'Mileage', 'Trip Duration (min)', 'Start Location', 'End Location', 'Total Cost'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    } / / Prepare rows for the spreadsheet
    const rows = receipts.map(receipt = > { / / Format date for spreadsheet (MM / DD / YYYY);
      let formattedDate = receipt.trip_date;
      const dateMatch = receipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2})(?:,|)\s * (\d{4}) / i);
      if (dateMatch) {
        const monthNames = [;
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = monthNames.findIndex(m = > m.toLowerCase() = = = dateMatch[1].toLowerCase()) + 1;
        if (month > 0) { / / Valid month name found
          formattedDate = `${month.toString().padStart(2, '0')} / ${dateMatch[2].padStart(2, '0')} / ${dateMatch[3]}`;
        }
      } / / Create Google Maps hyperlinks for locations
      const startLocationLink = createMapsLink(receipt.start_location);
      const endLocationLink = createMapsLink(receipt.end_location);

      return [;
        receipt.thread_id,
        receipt.message_id,
        receipt.message_link,
        receipt.provider,
        formattedDate,
        receipt.trip_start_time,
        receipt.trip_end_time,
        receipt.mileage,
        receipt.trip_duration, / / Integer minutes
        startLocationLink, / / Google Maps hyperlink
        endLocationLink, / / Google Maps hyperlink
        receipt.total_cost
      ];
    });

    if (rows.length = = = 0) {
      Logger.log('No receipts to append to sheet.');
      return;
    } / / Append new rows to the sheet
    const lastRow = Math.max(1, sheet.getLastRow());
    sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows); / / Format the cost column as currency;
    sheet.getRange(lastRow + 1, 12, rows.length, 1).setNumberFormat("$#,##0.00"); / / Auto - resize columns if the sheet isn't too large;
    if (sheet.getLastRow() < 1000) {
      sheet.autoResizeColumns(1, 12);
    }

    Logger.log(`Added ${rows.length} new receipts to the sheet. Total rows: ${sheet.getLastRow()}`);
  } catch (e) {
    Logger.log(`Error appending to sheet: ${e.message}`);
  }
}

/ * *

 * Creates new maps link or resources
 * @param
 * @param {any} address - The address for creation
 * @returns {Array} The newly created array

 * /

function createMapsLink(address) {
  if (! address || address = = = 'N / A') return 'N / A'; / / Encode the address for a URL;
  const encodedAddress = encodeURIComponent(address);
  return `= HYPERLINK("https: / / www.google.com / maps / search / ?api= 1&query= ${encodedAddress}", "${address}")`;
}

/ * *

 * Extracts specific information
 * @param
 * @param {string} message - The message content
 * @param {string} defaultProvider - The defaultProvider parameter
 * @returns {Array} Array of results

 * /

function extractReceiptFromMessage(message, defaultProvider) {
  const body = message.getPlainBody().replace( / \r\n / g, '\n').replace( / \n +  / g, '\n').trim();
  const date = message.getDate();
  const messageId = message.getId();
  const threadId = message.getThread().getId();

  let provider = defaultProvider.includes('Uber') ? 'Uber' : 'Lyft';
  if ( / uber / i.test(body)) provider = 'Uber';
  else if ( / lyft / i.test(body)) provider = 'Lyft';

  const receipt = {
    thread_id: threadId,
    message_id: messageId,
    message_link: `https: / / mail.google.com / mail / u / 0 / #inbox / ${messageId}`,
    provider: provider,
    email_date: date,
    trip_date: formatDate(date),
    trip_start_time: 'N / A',
    trip_end_time: 'N / A',
    mileage: 0,
    trip_duration: 0, / / Integer minutes
    start_location: 'N / A',
    end_location: 'N / A',
    total_cost: 0
  };

  try { / / Check for Lyft missed ride
    if (provider = = = 'Lyft' && / missed\s + ride / i.test(body)) {
      const cancelFeeMatch = body.match( / Lyft\s + cancel\s + fee\s + \$(\d + \.\d{2}) / i);
      if (cancelFeeMatch) {
        receipt.total_cost = parseFloat(cancelFeeMatch[1]); / / Try to extract the date for missed rides;
        const missedDateMatch = body.match( / Request\s + on\s + ([A - Za - z] + \s + \d{1,2})(?:\s + at|\s + AT)?\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i);
        if (missedDateMatch) {
          const currentYear = new Date().getFullYear();
          receipt.trip_date = `${missedDateMatch[1]}, ${currentYear}`;
          receipt.trip_start_time = convertTo24Hour(missedDateMatch[2]);
        } / / Try to extract location for missed rides
        const locationMatch = body.match( / Request. * at\s + ([A - Za - z0 - 9\s,. - ] + ) / i);
        if (locationMatch) {
          receipt.start_location = cleanAddress(locationMatch[1].trim());
        }

        return receipt;
      }
    } / / Define regex patterns based on provider
    const patterns = {
      tripDate: provider = = = 'Lyft' ? / ([A - Z] + \s + \d{1,2},\s * \d{4}) / i : / ([A - Za - z] + \s + \d{1,2}(?:,\s * |\s + )\d{4}) / i,
      startTime: provider = = = 'Lyft' ? / Pickup\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / ^(\d{1,2}:\d{2}\s * (?:AM|PM)) / im,
      endTime: provider = = = 'Lyft' ? / Drop - off\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))(?= \s * \n[^0 - 9]) / im,
      mileage: provider = = = 'Lyft' ? / \((\d + \.\d{1,2})mi, / i : / (\d + \.\d{1,2})\s * miles / i,
      duration: provider = = = 'Lyft' ? / \(\d + \.\d{1,2}mi,\s * (\d + m\s * (?:\d + s)?)\) / i : / \|\s * (\d + \s * min) / i,
    }; / / Extract locations using line - by - line approach
    let locations = [];
    if (provider = = = 'Lyft') { / / Lyft locations;
      const pickupMatch = body.match( / Pickup\s + \d{1,2}:\d{2}\s * (?:AM|PM)\s * \n([A - Za - z0 - 9\s,. - ] + ) / i);
      const dropoffMatch = body.match( / Drop - off\s + \d{1,2}:\d{2}\s * (?:AM|PM)\s * \n([A - Za - z0 - 9\s,. - ] + ) / i);

      if (pickupMatch) receipt.start_location = cleanAddress(pickupMatch[1].trim());
      if (dropoffMatch) receipt.end_location = cleanAddress(dropoffMatch[1].trim());
    } else { / / Uber locations - line - by - line approach
      const lines = body.split('\n');
      for (let i = 0; i < lines.length; i + + ) {
        const line = lines[i].trim(); / / Find time patterns;
        if ( / ^\d{1,2}:\d{2}\s * (?:AM|PM)$ / .test(line) && i + 1 < lines.length) {
          locations.push({
            time: line,
            location: cleanAddress(lines[i + 1].trim());
          });
        }
      }

      if (locations.length > 0) {
        receipt.start_location = locations[0].location;
        receipt.trip_start_time = convertTo24Hour(locations[0].time);
      }

      if (locations.length > 1) {
        receipt.end_location = locations[1].location;
        receipt.trip_end_time = convertTo24Hour(locations[1].time);
      }
    } / / Process receipts differently based on provider
    if (provider = = = 'Lyft') { / / Extract Lyft - specific fields;
      const dateMatch = body.match(patterns.tripDate);
      if (dateMatch) {
        receipt.trip_date = dateMatch[1].trim();
      }

      const startTimeMatch = body.match(patterns.startTime);
      if (startTimeMatch) receipt.trip_start_time = convertTo24Hour(startTimeMatch[1]);

      const endTimeMatch = body.match(patterns.endTime);
      if (endTimeMatch) receipt.trip_end_time = convertTo24Hour(endTimeMatch[1]);

      const mileageMatch = body.match(patterns.mileage);
      if (mileageMatch) receipt.mileage = parseFloat(mileageMatch[1]);

      const durationMatch = body.match(patterns.duration);
      if (durationMatch) {
        const durationStr = durationMatch[1].trim();
        receipt.trip_duration = formatDuration(durationStr);
      } / / Try multiple patterns for total cost
      const totalCostPatterns = [ / (?:Pay|Charged to|Apple Pay|American Express)\s + [^\$] * \$(\d + \.\d{2}) / i, / total\s + [^\$] * \$(\d + \.\d{2}) / i;
      ];

      for (const pattern of totalCostPatterns) {
        const match = body.match(pattern);
        if (match) {
          receipt.total_cost = parseFloat(match[1]);
          break;
        }
      }

    } else if (provider = = = 'Uber') { / / Extract Uber - specific fields;
      const dateMatch = body.match(patterns.tripDate);
      if (dateMatch) {
        receipt.trip_date = dateMatch[1].trim();
      } / / Start and end times should already be set from location extraction

      const mileageMatch = body.match(patterns.mileage);
      if (mileageMatch) receipt.mileage = parseFloat(mileageMatch[1]);

      const durationMatch = body.match(patterns.duration);
      if (durationMatch) {
        const durationStr = durationMatch[1].trim();
        receipt.trip_duration = formatDuration(durationStr);
      } / / Total cost
      const totalCostMatch = body.match( / Total\s + \$(\d + \.\d{2}) / i);
      if (totalCostMatch) receipt.total_cost = parseFloat(totalCostMatch[1]);
    } / / Calculate trip duration if both start and end times are available and duration wasn't found
    if (receipt.trip_start_time ! = = 'N / A' && receipt.trip_end_time ! = = 'N / A' && receipt.trip_duration = = = 0) {
      try {
        const start = parseTime(receipt.trip_start_time);
        const end = parseTime(receipt.trip_end_time);
        if (start && end) {
          let minutes = (end - start) / (1000 * 60);
          if (minutes < 0) minutes + = 24 * 60; / / Handle overnight rides;
          receipt.trip_duration = Math.round(minutes);
        }
      } catch (e) {
        Logger.log(`Error calculating duration: ${e.message}`);
      }
    } / / Check if the receipt is for a trip in our target date range / / We'll do this by parsing the trip date and checking
    try {
      const tripDateParts = receipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2})(?:,|)\s * (\d{4}) / i);
      if (tripDateParts) {
        const monthNames = [;
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = monthNames.findIndex(m = > m.toLowerCase() = = = tripDateParts[1].toLowerCase());
        const day = parseInt(tripDateParts[2]);
        const year = parseInt(tripDateParts[3]);

        if (month ! = = - 1 && ! isNaN(day) && ! isNaN(year)) {
          const tripDate = new Date(year, month, day); / / Return null if trip date is outside our target range;
          const startDate = new Date('2023 - 10 - 08');
          const endDate = new Date('2023 - 11 - 30');
          endDate.setHours(23, 59, 59, 999);

          if (tripDate < startDate || tripDate > endDate) {
            Logger.log(`Skipping receipt with trip date ${tripDate.toDateString()} - outside date range`);
            return null;
          }
        }
      }
    } catch (e) {
      Logger.log(`Error checking trip date range: ${e.message}`);
    }

    return receipt;
  } catch (e) {
    Logger.log(`Error parsing message ${messageId}: ${e.message}`);
    return null;
  }
}

/ * *

 * Extracts specific information
 * @param
 * @param {string} existingMessageIds - The existingMessageIds parameter
 * @param {any} startDate - The startDate parameter
 * @param {any} endDate - The endDate parameter
 * @returns {Array} Array of results

 * /

function extractReceiptsFromGmailDateRange(existingMessageIds, startDate, endDate) {
  const receipts = [];
  const labels = ['MTBI / Lyft', 'MTBI / Uber']; / / Format dates for Gmail search query (YYYY / MM / DD);
  const formattedStartDate = `${startDate.getFullYear()} / ${(startDate.getMonth() + 1).toString().padStart(2, '0')} / ${startDate.getDate().toString().padStart(2, '0')}`;
  const formattedEndDate = `${endDate.getFullYear()} / ${(endDate.getMonth() + 1).toString().padStart(2, '0')} / ${endDate.getDate().toString().padStart(2, '0')}`;

  for (const label of labels) {
    try {
      Logger.log(`Processing emails with label: ${label} within date range`); / / Create query with date range;
      const query = `label:${label} after:${formattedStartDate} before:${formattedEndDate}`;
      const threads = GmailApp.search(query);
      Logger.log(`Found ${threads.length} threads with label ${label} in date range`);

      let processedCount = 0;
      let skippedCount = 0;

      for (const thread of threads) {
        const messages = thread.getMessages();
        for (const message of messages) {
          const messageId = message.getId();
          const messageDate = message.getDate(); / / Skip if outside date range (extra check);
          if (messageDate < startDate || messageDate > endDate) {
            Logger.log(`Skipping message from ${messageDate.toDateString()} - outside date range`);
            continue;
          } / / Skip already processed messages
          if (existingMessageIds.has(messageId)) {
            skippedCount + + ; continue;
          }

          try {
            const receipt = extractReceiptFromMessage(message, label);
            if (receipt) {
              receipts.push(receipt);
              processedCount + + ; / / Add to existing IDs set to avoid duplicates within this batch
              existingMessageIds.add(messageId);
            }
          } catch (e) {
            Logger.log(`Error processing message ${messageId}: ${e.message}`);
          }
        }
      }

      Logger.log(`${label}: Processed ${processedCount} new receipts, skipped ${skippedCount} already processed receipts`);
    } catch (e) {
      Logger.log(`Error processing label ${label}: ${e.message}`);
    }
  }

  return receipts;
}

/ * *

 * Gets specific existing message ids or configuration
 * @returns {Array} The requested array

 * /

function getExistingMessageIds() {
  const messageIds = new Set();

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RideReceipts');

    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) { / / Assuming message ID is in column B
        const data = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for (const row of data) {
          if (row[0]) messageIds.add(row[0]);
        }
      }
    }
  } catch (e) {
    Logger.log(`Error getting existing message IDs: ${e.message}`);
  }

  return messageIds;
}

/ * *

 * Processes and transforms ride receipts date range
 * @returns {Array} Array of results

 * /

function processRideReceiptsDateRange() {
  const startTime = Date.now(); / / Define the date range;
  const startDate = new Date('2023 - 10 - 08');
  const endDate = new Date('2023 - 11 - 30');
  endDate.setHours(23, 59, 59, 999); / / Set to end of day;

  Logger.log(`Processing ride receipts from ${startDate.toDateString()} to ${endDate.toDateString()}`); / / Get existing data from the sheet first to avoid duplicates;
  const existingMessageIds = getExistingMessageIds();
  Logger.log(`Found ${existingMessageIds.size} existing message IDs in the sheet`); / / Process emails with labels within date range;
  const receipts = extractReceiptsFromGmailDateRange(existingMessageIds, startDate, endDate);

  if (receipts.length > 0) {
    appendToSheet(receipts);
    Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds. Processed ${receipts.length} new receipts.`);
  } else {
    Logger.log('No new receipts to process in the specified date range.');
  }
}

/ / Helper Functions

/ * *

 * Performs specialized operations
 * @param
 * @param {any} address - The address parameter
 * @returns {Array} Array of results

 * /

function cleanAddress(address) { / / Split by double new line and take only the first part
  const parts = address.split( / \n\s * \n / );
  return parts[0].trim();
}

/ * *

 * Converts between formats
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {Array} Array of results

 * /

function convertTo24Hour(timeStr) {
  try {
    const match = timeStr.match( / (\d{1,2}):(\d{2})\s * (AM|PM) / i);
    if (! match) return 'N / A';
    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();
    if (period = = = 'PM' && hour < 12) hour + = 12;
    if (period = = = 'AM' && hour = = = 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  } catch (e) {
    Logger.log(`Error converting time ${timeStr}: ${e.message}`);
    return 'N / A';
  }
}

/ * *

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {Array} Array of results

 * /

function formatDate(date) { / / Return date in "Month DD, YYYY" format
  const months = [;
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/ * *

 * Formats duration for display
 * @param
 * @param {any} durationStr - The durationStr parameter
 * @returns {Array} Array of results

 * /

function formatDuration(durationStr) {
  if (durationStr = = = 'N / A') return 0; / / Extract minutes from various formats;
  let minutes = 0; / / Pattern like "5 minutes" or "5 min" or "5m";
  const minutesMatch = durationStr.match( / (\d + )\s * (?:minutes|mins|min|m) / i);
  if (minutesMatch) {
    minutes + = parseInt(minutesMatch[1]);
  } / / Pattern like "1h 30m" or "1 hour 30 minutes"
  const hoursMatch = durationStr.match( / (\d + )\s * (?:hours|hour|h) / i);
  if (hoursMatch) {
    minutes + = parseInt(hoursMatch[1]) * 60;
  } / / Pattern like "30s" (seconds)
  const secondsMatch = durationStr.match( / (\d + )\s * (?:seconds|second|s) / i);
  if (secondsMatch) { / / Round seconds to nearest minute if it's the only component
    if (! minutesMatch && ! hoursMatch) {
      minutes = Math.round(parseInt(secondsMatch[1]) / 60);
    } / / Otherwise, only count seconds if they make up a significant portion of a minute
    else if (parseInt(secondsMatch[1]) > = 30) {
      minutes + = 1;
    }
  }

  return minutes;
}

/ * *

 * Sets parime or configuration values
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {Array} Array of results

 * /

function parseTime(timeStr) {
  const match = timeStr.match( / (\d{2}):(\d{2}) / );
  if (! match) return null;
  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  return date;
}