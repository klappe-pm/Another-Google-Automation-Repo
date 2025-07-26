/**
 * Script Name: extract-lyft-and-uber-data-v1
 * 
 * Script Summary:
 * Processes Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Format output for presentation
 * 7. Write results to destination
 * 8. Send notifications or reports
 * 
 * Script Functions:
 * - extractReceiptFromMessage(): Extracts specific information
 * - extractReceiptsFromGmail(): Extracts specific information
 * - processRideReceipts(): Processes and transforms ride receipts
 * - writeToSheet(): Writes to sheet to destination
 * 
 * Script Helper Functions:
 * - convertTo24Hour(): Converts between formats
 * - formatDate(): Formats date for display
 * - parseTime(): Sets parime or configuration values
 * - validateAndCleanReceipts(): Validates and clean receipts integrity
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

/* 

 */// Main Functions

// Main Functions

/**

 * Extracts specific information
 * @param
 * @param {string} message - The message content
 * @param {string} defaultProvider - The defaultProvider parameter
 * @returns {any} The result

 */

function extractReceiptFromMessage(message, defaultProvider) {
  const body = message.getPlainBody().replace( / \r\n / g, '\n').replace( / \n +  / g, '\n').trim();
  const date = message.getDate();
  const messageId = message.getId();
  Logger.log(`Email body for ${messageId}: ${body.substring(0, 1000)}`);

  let provider = defaultProvider.includes('Uber') ? 'Uber' : 'Lyft';
  if ( / uber / i.test(body)) provider = 'Uber';
  else if ( / lyft / i.test(body)) provider = 'Lyft';

  const receipt = {
    message_link: `https: // mail.google.com / mail / u / 0 / #inbox / ${messageId}`,
    provider: provider,
    trip_date: formatDate(date),
    trip_start_time: 'N / A',
    trip_end_time: 'N / A',
    mileage: 0,
    trip_duration: 'N / A',
    start_location: 'N / A',
    end_location: 'N / A',
    total_cost: 0,
    base_fare: 0,
    additional_fees: [],
    discounts: [],
    credits: [],
    tip_amount: 0,
    payment_method: 'N / A',
    driver_name: 'N / A',
    driver_rating: provider === 'Lyft' ? 'N / A' : 'N / A';
  };

  try { // Check for Lyft missed ride
    if (provider === 'Lyft' && / missed\s + ride / i.test(body)) {
      const cancelFeeMatch = body.match( / Lyft\s + cancel\s + fee\s + \$(\d + \.\d{2}) / i);
      if (cancelFeeMatch) {
        receipt.total_cost = parseFloat(cancelFeeMatch[1]);
        receipt.base_fare = 0; // Try to extract the date for missed rides;
        const missedDateMatch = body.match( / Request\s + on\s + ([A - Za - z] + \s + \d{1,2})(?:\s + at|\s + AT)?\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i);
        if (missedDateMatch) {
          const currentYear = new Date().getFullYear();
          receipt.trip_date = `${missedDateMatch[1]}, ${currentYear}`;
          receipt.trip_start_time = convertTo24Hour(missedDateMatch[2]);
        } // Try to extract location for missed rides
        const locationMatch = body.match( / Request. * at\s + ([A - Za - z0 - 9\s,. - ] + ) / i);
        if (locationMatch) {
          receipt.start_location = locationMatch[1].trim();
        } // Payment method
        const paymentMatch = body.match( / Charged\s + to\s + ([A - Za - z\s\(\)] + (?:ending\s * \d{4})?) / i);
        if (paymentMatch) {
          receipt.payment_method = paymentMatch[1].trim();
        }

        receipt.validation_notes = 'Missed ride cancel fee.';
        return receipt;
      }
    } // Define regex patterns based on provider
    const patterns = {
      tripDate: provider === 'Lyft' ? / ([A - Z] + \s + \d{1,2},\s * \d{4}) / i : / ([A - Za - z] + \s + \d{1,2}(?:,\s * |\s + )\d{4}) / i,
      startTime: provider === 'Lyft' ? / Pickup\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / ^(\d{1,2}:\d{2}\s * (?:AM|PM)) / im,
      endTime: provider === 'Lyft' ? / Drop - off\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))(?=\s * \n[^0 - 9]) / im,
      mileage: provider === 'Lyft' ? / \((\d + \.\d{1,2})mi, / i : / (\d + \.\d{1,2})\s * miles / i,
      duration: provider === 'Lyft' ? / \(\d + \.\d{1,2}mi,\s * (\d + m\s * (?:\d + s)?)\) / i : / \|\s * (\d + \s * min) / i,
      payment: provider === 'Lyft' ? / (?:Pay|Charged to)\s + ([A - Za - z\s\(\)] + (?:ending\s * \d{4})?) / i : / Payments\s + ([A - Za - z\s] + (?:ending\s * \d{4})?) / i,
      driver: provider === 'Lyft' ? / Thanks\s + for\s + riding\s + with\s + ([A - Za - z\s] + ) / i : / You\s + rode\s + with\s + ([A - Za - z\s] + ) / i,
      rating: provider === 'Lyft' ? null : / (\d + \.\d{1,2})\s * ★\s * Rating / i;
    }; // Extract locations using line - by - line approach
    let locations = [];
    if (provider === 'Lyft') { // Lyft locations;
      const pickupMatch = body.match( / Pickup\s + \d{1,2}:\d{2}\s * (?:AM|PM)\s * \n([A - Za - z0 - 9\s,. - ] + ) / i);
      const dropoffMatch = body.match( / Drop - off\s + \d{1,2}:\d{2}\s * (?:AM|PM)\s * \n([A - Za - z0 - 9\s,. - ] + ) / i);

      if (pickupMatch) receipt.start_location = pickupMatch[1].trim();
      if (dropoffMatch) receipt.end_location = dropoffMatch[1].trim();
    } else { // Uber locations - line - by - line approach
      const lines = body.split('\n');
      for (let i = 0; i < lines.length; i ++ ) {
        const line = lines[i].trim(); // Find time patterns;
        if ( / ^\d{1,2}:\d{2}\s * (?:AM|PM)$ / .test(line) && i + 1 < lines.length) {
          locations.push({
            time: line,
            location: lines[i + 1].trim();
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
    } // Process receipts differently based on provider
    if (provider === 'Lyft') { // Extract Lyft - specific fields;
      const dateMatch = body.match(patterns.tripDate);
      if (dateMatch) receipt.trip_date = dateMatch[1].trim();

      const startTimeMatch = body.match(patterns.startTime);
      if (startTimeMatch) receipt.trip_start_time = convertTo24Hour(startTimeMatch[1]);

      const endTimeMatch = body.match(patterns.endTime);
      if (endTimeMatch) receipt.trip_end_time = convertTo24Hour(endTimeMatch[1]);

      const mileageMatch = body.match(patterns.mileage);
      if (mileageMatch) receipt.mileage = parseFloat(mileageMatch[1]);

      const durationMatch = body.match(patterns.duration);
      if (durationMatch) receipt.trip_duration = durationMatch[1].trim(); // Try multiple patterns for total cost;
      const totalCostPatterns = [ / (?:Pay|Charged to|Apple Pay|American Express)\s + [^\$] * \$(\d + \.\d{2}) / i, / total\s + [^\$] * \$(\d + \.\d{2}) / i;
      ];

      for (const pattern of totalCostPatterns) {
        const match = body.match(pattern);
        if (match) {
          receipt.total_cost = parseFloat(match[1]);
          break;
        }
      } // Try different base fare patterns
      const baseFarePatterns = [ / Lyft\s + fare\s + [^\$] * \$(\d + \.\d{2}) / i, / fare\s + [^\$] * \$(\d + \.\d{2}) / i;
      ];

      for (const pattern of baseFarePatterns) {
        const match = body.match(pattern);
        if (match) {
          receipt.base_fare = parseFloat(match[1]);
          break;
        }
      } // Extract payment method
      const paymentMatch = body.match(patterns.payment);
      if (paymentMatch) receipt.payment_method = paymentMatch[1].trim(); // Extract driver name;
      const driverMatch = body.match(patterns.driver);
      if (driverMatch) receipt.driver_name = driverMatch[1].trim(); // Extract fees;
      const feePattern = / ((?:Service\s + Fee|Priority\s + Pickup\s + Upgrade|Wait\s + [tT]ime\s * [fF]ee|Booking\s + Fee|Regulatory\s * Fee|CA\s + Driver\s * Benefits?|Access\s + for\s + All\s + Fee|Airport\s * Fee|Clean\s + Miles\s + Standard\s + Regulatory\s + Fee))\s * [^\$] * \$(\d + \.\d{2}) / gi;
      let feeMatch;
      while ((feeMatch = feePattern.exec(body)) ! = = null) {
        receipt.additional_fees.push({
          name: feeMatch[1].trim(),
          amount: parseFloat(feeMatch[2])
        });
      } // Extract discounts
      const discountPattern = / ((?:Membership|Promotion))\s * [^\$] *  - ?\$(\d + \.\d{2}) / gi;
      let discountMatch;
      while ((discountMatch = discountPattern.exec(body)) ! = = null) {
        receipt.discounts.push({
          name: discountMatch[1].trim(),
          amount: - parseFloat(discountMatch[2])
        });
      } // Extract credits
      const creditPattern = / ((?:Lyft\s + Pink|Lyft\s + Credits))\s * [^\$] *  - ?\$(\d + \.\d{2}) / gi;
      let creditMatch;
      while ((creditMatch = creditPattern.exec(body)) ! = = null) {
        receipt.credits.push({
          name: creditMatch[1].trim(),
          amount: - parseFloat(creditMatch[2])
        });
      } // Extract tip
      const tipMatch = body.match( / Tip\s + \$(\d + \.\d{2}) / i);
      if (tipMatch) receipt.tip_amount = parseFloat(tipMatch[1]);

    } else if (provider === 'Uber') { // Extract Uber - specific fields;
      const dateMatch = body.match(patterns.tripDate);
      if (dateMatch) receipt.trip_date = dateMatch[1].trim(); // Start and end times should already be set from location extraction;

      const mileageMatch = body.match(patterns.mileage);
      if (mileageMatch) receipt.mileage = parseFloat(mileageMatch[1]);

      const durationMatch = body.match(patterns.duration);
      if (durationMatch) receipt.trip_duration = durationMatch[1].trim(); // Total cost;
      const totalCostMatch = body.match( / Total\s + \$(\d + \.\d{2}) / i);
      if (totalCostMatch) receipt.total_cost = parseFloat(totalCostMatch[1]); // Base fare;
      const baseFareMatch = body.match( / Trip\s + fare\s + \$(\d + \.\d{2}) / i);
      if (baseFareMatch) receipt.base_fare = parseFloat(baseFareMatch[1]); // Extract payment method;
      const paymentPattern = / (?:Payments|American Express|Visa|Mastercard|Discover|Payment Method)\s + ([A - Za - z\s] + (?:ending\s * \d{4})?) / i;
      const paymentMatch = body.match(paymentPattern);
      if (paymentMatch) receipt.payment_method = paymentMatch[1].trim(); // Extract driver name;
      const driverMatch = body.match(patterns.driver);
      if (driverMatch) receipt.driver_name = driverMatch[1].trim(); // Extract driver rating;
      const ratingMatch = body.match(patterns.rating);
      if (ratingMatch) receipt.driver_rating = parseFloat(ratingMatch[1]); // Extract fees;
      const feePattern = / ((?:Booking\s + Fee|CA\s + Driver\s + Benefits|Access\s + for\s + All\s + Fee|Clean\s + Miles\s + Standard\s + Regulatory\s + Fee|UberX\s + Priority|Wait\s + Time))\s + \$(\d + \.\d{2}) / gi;
      let feeMatch;
      while ((feeMatch = feePattern.exec(body)) ! = = null) {
        receipt.additional_fees.push({
          name: feeMatch[1].trim(),
          amount: parseFloat(feeMatch[2])
        });
      } // Extract discounts and credits
      const creditPattern = / ((?:Uber\s + One\s + Credits|Promotion))\s +  - \$(\d + \.\d{2}) / gi;
      let creditMatch;
      while ((creditMatch = creditPattern.exec(body)) ! = = null) {
        if (creditMatch[1].includes('Credit')) {
          receipt.credits.push({
            name: creditMatch[1].trim(),
            amount: - parseFloat(creditMatch[2])
          });
        } else {
          receipt.discounts.push({
            name: creditMatch[1].trim(),
            amount: - parseFloat(creditMatch[2])
          });
        }
      } // Extract tip
      const tipMatch = body.match( / Tip\s + \$(\d + \.\d{2}) / i);
      if (tipMatch) receipt.tip_amount = parseFloat(tipMatch[1]);
    } // Calculate trip duration if both start and end times are available
    if (receipt.trip_start_time ! = = 'N / A' && receipt.trip_end_time ! = = 'N / A' && receipt.trip_duration === 'N / A') {
      try {
        const start = parseTime(receipt.trip_start_time);
        const end = parseTime(receipt.trip_end_time);
        if (start && end) {
          let minutes = (end - start) / (1000 * 60);
          if (minutes < 0) minutes += 24 * 60; // Handle overnight rides;
          receipt.trip_duration = `${Math.floor(minutes)} minutes`;
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
 * @param
 * @param {number} maxThreads - The maxThreads parameter
 * @returns {any} The result

 */

function extractReceiptsFromGmail(maxThreads) {
  const receipts = [];
  const labels = ['MTBI / Lyft', 'MTBI / Uber'];
  for (const label of labels) {
    try {
      const query = `label:${label}`;
      const threads = GmailApp.search(query, 0, maxThreads);
      Logger.log(`Query: ${query}`);
      Logger.log(`Found ${threads.length} threads for ${label}`);
      if (threads.length === 0) {
        Logger.log(`No threads found for label ${label}. Check if the label contains emails. Try searching 'label:${label}' in Gmail.`);
        const fallbackQuery = `from:${label === 'MTBI / Uber' ? 'uber' : 'lyft'}`;
        const fallbackThreads = GmailApp.search(fallbackQuery, 0, maxThreads);
        Logger.log(`Fallback query: ${fallbackQuery}`);
        Logger.log(`Found ${fallbackThreads.length} threads in fallback for ${label}`);
        if (fallbackThreads.length > 0) {
          Logger.log(`Emails found without label. Apply '${label}' label to these emails in Gmail.`);
          fallbackThreads.forEach((thread, index) => {
            const firstMessage = thread.getMessages()[0];
            Logger.log(`Fallback Thread ${index + 1}: Subject=${thread.getFirstMessageSubject()}, From=${firstMessage.getFrom()}, Date=${firstMessage.getDate()}`);
          });
          for (const thread of fallbackThreads) {
            const messages = thread.getMessages();
            for (const message of messages) {
              try {
                const receipt = extractReceiptFromMessage(message, label);
                if (receipt) {
                  receipts.push(receipt);
                  Logger.log(`Extracted receipt (fallback): ${receipt.trip_date}, ${receipt.total_cost}`);
                } else {
                  Logger.log(`No valid receipt data in fallback message ${message.getId()}`);
                }
              } catch (e) {
                Logger.log(`Error processing fallback message ${message.getId()}: ${e.message}`);
              }
            }
            Utilities.sleep(100);
          }
        } else {
          Logger.log(`No ${label} emails found even without label. Check if receipt emails exist (e.g., search 'from:uber' or 'from:lyft' in Gmail).`);
        }
      } else {
        threads.forEach((thread, index) => {
          const firstMessage = thread.getMessages()[0];
          Logger.log(`Thread ${index + 1}: Subject=${thread.getFirstMessageSubject()}, From=${firstMessage.getFrom()}, Date=${firstMessage.getDate()}`);
        });
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
          }
          Utilities.sleep(100);
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
 * @returns {any} The result

 */

function processRideReceipts() {
  const maxThreads = 50;
  const startTime = Date.now();
  const labels = GmailApp.getUserLabels();
  Logger.log('Available Gmail labels: ' + labels.map(label => label.getName()).join(', '));
  const receipts = extractReceiptsFromGmail(maxThreads);
  const validatedReceipts = validateAndCleanReceipts(receipts);
  writeToSheet(validatedReceipts);
  Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds. Processed ${receipts.length} receipts.`);
}

/**

 * Writes to sheet to destination
 * @param
 * @param {any} receipts - The receipts parameter
 * @returns {any} The result

 */

function writeToSheet(receipts) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RideReceipts');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('RideReceipts');
    }
    sheet.clear();

    const headers = [;
      'Message Link', 'Provider', 'Trip Date', 'Trip Start Time', 'Trip End Time', 'Mileage', 'Trip Duration',
      'Start Location', 'End Location', 'Total Cost', 'Base Fare', 'Additional Fees', 'Discounts', 'Credits',
      'Tip Amount', 'Payment Method', 'Driver Name', 'Driver Rating', 'Validation Notes'
    ];

    const rows = receipts.map(receipt => {
      try { // Format fees, discounts, and credits for spreadsheet
        const fees = receipt.additional_fees.map(fee => `${fee.name}: $${fee.amount.toFixed(2)}`).join(', ');
        const discounts = receipt.discounts.map(discount => `${discount.name}: $${discount.amount.toFixed(2)}`).join(', ');
        const credits = receipt.credits.map(credit => `${credit.name}: $${credit.amount.toFixed(2)}`).join(', '); // Format date for spreadsheet (MM / DD / YYYY);
        let formattedDate = receipt.trip_date;
        const dateMatch = receipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2})(?:,|)\s * (\d{4}) / i);
        if (dateMatch) {
          const monthNames = [;
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const month = monthNames.findIndex(m => m.toLowerCase() === dateMatch[1].toLowerCase()) + 1;
          if (month > 0) { // Valid month name found
            formattedDate = `${month.toString().padStart(2, '0')} / ${dateMatch[2].padStart(2, '0')} / ${dateMatch[3]}`;
          }
        }

        return [;
          receipt.message_link,
          receipt.provider,
          formattedDate,
          receipt.trip_start_time,
          receipt.trip_end_time,
          receipt.mileage,
          receipt.trip_duration,
          receipt.start_location,
          receipt.end_location,
          receipt.total_cost,
          receipt.base_fare,
          fees,
          discounts,
          credits,
          receipt.tip_amount,
          receipt.payment_method,
          receipt.driver_name,
          receipt.driver_rating,
          receipt.validation_notes
        ];
      } catch (e) {
        Logger.log(`Error preparing row for receipt: ${e.message}`);
        return Array(headers.length).fill('Error');
      }
    }); // Write headers and data to sheet
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    } // Format the sheet
    sheet.autoResizeColumns(1, headers.length);
    Logger.log('Data written to RideReceipts sheet');
  } catch (e) {
    Logger.log(`Error writing to sheet: ${e.message}`);
  }
}

// Helper Functions

/**

 * Converts between formats
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {any} The result

 */

function convertTo24Hour(timeStr) {
  try {
    const match = timeStr.match( / (\d{1,2}):(\d{2})\s * (AM|PM) / i);
    if (!match) return 'N / A';
    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
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
 * @returns {any} The result

 */

function formatDate(date) { // Return date in "Month DD, YYYY" format
  const months = [;
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**

 * Sets parime or configuration values
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {any} The result

 */

function parseTime(timeStr) {
  const match = timeStr.match( / (\d{2}):(\d{2}) / );
  if (!match) return null;
  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  return date;
}

/**

 * Validates and clean receipts integrity
 * @param
 * @param {any} receipts - The receipts parameter
 * @returns {any} The result

 */

function validateAndCleanReceipts(receipts) {
  return receipts.map((receipt, index) => {
    try {
      const validatedReceipt = { ...receipt, validation_notes: '' }; // Validate provider;
      if (!['Uber', 'Lyft'].includes(validatedReceipt.provider)) {
        validatedReceipt.validation_notes += 'Invalid provider. ';
      } // Clean date format - more flexible approach
      const monthNames = [;
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const dateMatch = validatedReceipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2})(?:,|)\s * (\d{4}) / i);
      if (!dateMatch) { // If not in expected format, leave as is but note it
        validatedReceipt.validation_notes += 'Date format not standardized. ';
      } // Clean locations - remove ', US' and similar suffixes
      if (validatedReceipt.start_location ! = = 'N / A') {
        validatedReceipt.start_location = validatedReceipt.start_location;
          .replace( / ,?\s * US$ / , '');
          .replace( / ,\s * [A - Z]{2}\s * \d{5}(?: - \d{4})?$ / , '');
          .trim();
      }

      if (validatedReceipt.end_location ! = = 'N / A') {
        validatedReceipt.end_location = validatedReceipt.end_location;
          .replace( / ,?\s * US$ / , '');
          .replace( / ,\s * [A - Z]{2}\s * \d{5}(?: - \d{4})?$ / , '');
          .trim();
      } // Standardize trip duration format
      if (validatedReceipt.trip_duration ! = = 'N / A') {
        validatedReceipt.trip_duration = validatedReceipt.trip_duration;
          .replace( / mins / i, 'minutes');
          .replace( / min / i, 'minutes');
          .trim();
      } // Validate costs - check with a small epsilon for rounding errors
      let calculatedTotal = validatedReceipt.base_fare;
      validatedReceipt.additional_fees.forEach(fee => {
        calculatedTotal += fee.amount;
      });
      validatedReceipt.discounts.forEach(discount => {
        calculatedTotal += discount.amount;
      });
      validatedReceipt.credits.forEach(credit => {
        calculatedTotal += credit.amount;
      });
      calculatedTotal += validatedReceipt.tip_amount; // Use a small epsilon for floating point comparison;
      const epsilon = 0.05; // 5 cents;
      if (Math.abs(calculatedTotal - validatedReceipt.total_cost) > epsilon) {
        validatedReceipt.validation_notes += `Total cost mismatch: calculated ${calculatedTotal.toFixed(2)}, reported ${validatedReceipt.total_cost.toFixed(2)}. `;
      } // Add note for assumed zero tip
      if (validatedReceipt.tip_amount === 0) {
        validatedReceipt.validation_notes += 'Tip assumed as $0. ';
      } // Add success note if no issues
      if (!validatedReceipt.validation_notes) {
        validatedReceipt.validation_notes = 'Data validated successfully.';
      }

      return validatedReceipt;
    } catch (e) {
      Logger.log(`Error validating receipt ${index}: ${e.message}`);
      return { ...receipt, validation_notes: `Validation failed: ${e.message}` };
    }
  });
}