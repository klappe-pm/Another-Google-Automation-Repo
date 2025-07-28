/**
 * Script Name: extract- lyft- and- uber- data- v2
 *
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 *
 * Script Purpose:
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Process and transform data
 * 5. Format output for presentation
 * 6. Write results to destination
 *
 * Script Functions:
 * - createMapsLink(): Creates new maps link or resources
 * - extractReceiptFromMessage(): Extracts specific information
 * - extractReceiptsFromGmail(): Extracts specific information
 * - processRideReceipts(): Processes and transforms ride receipts
 * - writeToSheet(): Writes to sheet to destination
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
 * - Utilities: For utility functions and encoding
 * /

/ *

 * / / / Main Functions

/ / Main Functions

/**

 * Creates new maps link or resources
 * @param
 * @param {any} address - The address for creation
 * @returns {string} The newly created string

 * /

function createMapsLink(address) {
  if (! address || address = = = 'N / A') return 'N / A'; / / Encode the address for a URL;
  const encodedAddress = encodeURIComponent(address);
  return `= HYPERLINK("https: / / www.google.com / maps / search / ?api= 1&query= ${encodedAddress}", "${address}")`;
}

/**

 * Extracts specific information
 * @param
 * @param {string} message - The message content
 * @param {string} defaultProvider - The defaultProvider parameter
 * @returns {string} The formatted string

 * /

function extractReceiptFromMessage(message, defaultProvider) {
  const body = message.getPlainBody().replace( / \r\n / g, '\n').replace( / \n +  / g, '\n').trim();
  const date = message.getDate();
  const messageId = message.getId();

  let provider = defaultProvider.includes('Uber') ? 'Uber' : 'Lyft';
  if ( / uber / i.test(body)) provider = 'Uber';
  else if ( / lyft / i.test(body)) provider = 'Lyft';

  const receipt = {
    message_link: `https: / / mail.google.com / mail / u / 0 / #inbox / ${messageId}`,
    provider: provider,
    trip_date: formatDate(date),
    trip_start_time: 'N / A',
    trip_end_time: 'N / A',
    mileage: 0,
    trip_duration: 0, / / Now storing as an integer
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
      driver: provider = = = 'Lyft' ? / Thanks\s + for\s + riding\s + with\s + ([A - Za - z\s] + ) / i : / You\s + rode\s + with\s + ([A - Za - z\s] + ) / i,
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
      if (dateMatch) receipt.trip_date = dateMatch[1].trim();

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
      if (dateMatch) receipt.trip_date = dateMatch[1].trim(); / / Start and end times should already be set from location extraction;

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
    }

    return receipt;
  } catch (e) {
    Logger.log(`Error parsing message ${messageId}: ${e.message}`);
    return null;
  }
}

/**

 * Extracts specific information
 * @returns {string} The formatted string

 * /

function extractReceiptsFromGmail() {
  const receipts = [];
  const labels = ['MTBI / Lyft', 'MTBI / Uber'];
  for (const label of labels) {
    try {
      const query = `label:${label}`; / / Process all threads in batches to handle Gmail quotas;
      let start = 0;
      const batchSize = 100;
      let moreThreads = true;

      while (moreThreads) {
        Logger.log(`Processing batch of threads for ${label}, starting at index ${start}`);
        const threads = GmailApp.search(query, start, batchSize);
        Logger.log(`Found ${threads.length} threads in this batch for ${label}`);

        if (threads.length = = = 0) {
          moreThreads = false;
          break;
        } / / Process this batch of threads
        for (const thread of threads) {
          const messages = thread.getMessages();
          for (const message of messages) {
            try {
              const receipt = extractReceiptFromMessage(message, label);
              if (receipt) {
                receipts.push(receipt);
                Logger.log(`Extracted receipt: ${receipt.trip_date}, ${receipt.total_cost}`);
              } else {
                Logger.log(`No valid receipt data in message ${message.getId()}`);
              }
            } catch (e) {
              Logger.log(`Error processing message ${message.getId()}: ${e.message}`);
            }
          } / / Add a brief pause to avoid hitting quotas
          Utilities.sleep(20);
        } / / Increment start for next batch
        start + = batchSize; / / If we got fewer threads than the batch size, there are no more threads;
        if (threads.length < batchSize) {
          moreThreads = false;
        } / / Add a brief pause between batches
        Utilities.sleep(500);
      } / / If no threads found with the label, try a fallback
      if (receipts.length = = = 0) {
        Logger.log(`No threads found for label ${label}. Trying fallback query...`);
        const fallbackQuery = `from:${label = = = 'MTBI / Uber' ? 'uber' : 'lyft'}`; / / Process fallback in batches too;
        start = 0;
        moreThreads = true;

        while (moreThreads) {
          const fallbackThreads = GmailApp.search(fallbackQuery, start, batchSize);
          Logger.log(`Found ${fallbackThreads.length} threads in fallback batch for ${label}`);

          if (fallbackThreads.length = = = 0) {
            moreThreads = false;
            break;
          }

          for (const thread of fallbackThreads) {
            const messages = thread.getMessages();
            for (const message of messages) {
              try {
                const receipt = extractReceiptFromMessage(message, label);
                if (receipt) {
                  receipts.push(receipt);
                  Logger.log(`Extracted receipt (fallback): ${receipt.trip_date}, ${receipt.total_cost}`);
                }
              } catch (e) {
                Logger.log(`Error processing fallback message ${message.getId()}: ${e.message}`);
              }
            }
            Utilities.sleep(20);
          }

          start + = batchSize;
          if (fallbackThreads.length < batchSize) {
            moreThreads = false;
          }
          Utilities.sleep(500);
        }
      }
    } catch (e) {
      Logger.log(`Error processing label ${label}: ${e.message}`);
    }
  }
  return receipts;
}

/**

 * Processes and transforms ride receipts
 * @returns {string} The formatted string

 * /

function processRideReceipts() {
  const startTime = Date.now();
  const labels = GmailApp.getUserLabels();
  Logger.log('Available Gmail labels: ' + labels.map(label = > label.getName()).join(', '));
  const receipts = extractReceiptsFromGmail();
  writeToSheet(receipts);
  Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds. Processed ${receipts.length} receipts.`);
}

/**

 * Writes to sheet to destination
 * @param
 * @param {any} receipts - The receipts parameter
 * @returns {string} The formatted string

 * /

function writeToSheet(receipts) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RideReceipts');
    if (! sheet) {
      sheet = spreadsheet.insertSheet('RideReceipts');
    }
    sheet.clear(); / / Only include the requested fields;
    const headers = [;
      'Message Link', 'Provider', 'Trip Date', 'Trip Start Time', 'Trip End Time',
      'Mileage', 'Trip Duration (min)', 'Start Location', 'End Location', 'Total Cost'
    ];

    const rows = receipts.map(receipt = > {
      try { / / Format date for spreadsheet (MM / DD / YYYY)
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
      } catch (e) {
        Logger.log(`Error preparing row for receipt: ${e.message}`);
        return Array(headers.length).fill('Error');
      }
    }); / / Write headers and data to sheet
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    } / / Format the sheet
    sheet.autoResizeColumns(1, headers.length); / / Format the cost column as currency;
    if (rows.length > 0) {
      sheet.getRange(2, headers.indexOf('Total Cost') + 1, rows.length, 1).setNumberFormat("$#,##0.00");
    }

    Logger.log('Data written to RideReceipts sheet');
  } catch (e) {
    Logger.log(`Error writing to sheet: ${e.message}`);
  }
}

/ / Helper Functions

/**

 * Performs specialized operations
 * @param
 * @param {any} address - The address parameter
 * @returns {string} The formatted string

 * /

function cleanAddress(address) { / / Split by double new line and take only the first part
  const parts = address.split( / \n\s * \n / );
  return parts[0].trim();
}

/**

 * Converts between formats
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {string} The formatted string

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

/**

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {string} The formatted string

 * /

function formatDate(date) { / / Return date in "Month DD, YYYY" format
  const months = [;
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**

 * Formats duration for display
 * @param
 * @param {any} durationStr - The durationStr parameter
 * @returns {string} The formatted string

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

/**

 * Sets parime or configuration values
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {string} The formatted string

 * /

function parseTime(timeStr) {
  const match = timeStr.match( / (\d{2}):(\d{2}) / );
  if (! match) return null;
  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  return date;
}