/**
 * Script Name: extract- lyft- and- uber- data
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
 * /

/ / Main Functions

/**

 * Extracts specific information
 * @param
 * @param {string} message - The message content
 * @param {string} defaultProvider - The defaultProvider parameter
 * @returns {any} The result

 * /

function extractReceiptFromMessage(message, defaultProvider) {
  const body = message.getPlainBody().replace( / \r\n / g, '\n').replace( / \n +  / g, '\n').trim();
  const date = message.getDate();
  const messageId = message.getId();
  Logger.log(`Email body for ${messageId}: ${body.substring(0, 1000)}`);
  let provider = defaultProvider.includes('Uber') ? 'Uber' : 'Lyft';
  if ( / uber / i.test(body)) provider = 'Uber';
  else if ( / lyft / i.test(body)) provider = 'Lyft';
  const receipt = {
    message_link: `https: / / mail.google.com / mail / u / 0 / #inbox / ${messageId}`,
    provider: provider,
    trip_date: Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMMM dd, yyyy'),
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
    driver_rating: provider = = = 'Lyft' ? 'N / A' : 'N / A';
  };
  const patterns = {
    tripDate: provider = = = 'Lyft' ? / (?:[A - Z] + \s + \d{1,2},\s * \d{4})\s + AT / i : / (?:[A - Za - z] + \s + \d{1,2}(?:,\s * |\s + )\d{4}) / i,
    startTime: provider = = = 'Lyft' ? / Pickup\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))\n[A - Za - z0 - 9\s, - ] +  / i,
    endTime: provider = = = 'Lyft' ? / Drop - off\s + (\d{1,2}:\d{2}\s * (?:AM|PM)) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))\n[A - Za - z0 - 9\s, - ] + $ / im,
    mileage: provider = = = 'Lyft' ? / \((\d + \.\d{1,2})mi, / i : / (\d + \.\d{1,2})\s * miles / i,
    duration: provider = = = 'Lyft' ? / \(\d + \.\d{1,2}mi,\s * (\d + m\s * (?:\d + s)?)\) / i : / \|\s * (\d + \s * min) / i,
    startLocation: provider = = = 'Lyft' ? / Pickup\s + \d{1,2}:\d{2}\s * (?:AM|PM)\n([A - Za - z0 - 9\s, - ] + (?:,\s * [A - Z]{2}(?:\s * \d{5})?)?) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))\n([A - Za - z0 - 9\s, - ] + (?:,\s * [A - Z]{2}(?:\s * \d{5})?)?) / i,
    endLocation: provider = = = 'Lyft' ? / Drop - off\s + \d{1,2}:\d{2}\s * (?:AM|PM)\n([A - Za - z0 - 9\s, - ] + (?:,\s * [A - Z]{2}(?:\s * \d{5})?)?) / i : / (\d{1,2}:\d{2}\s * (?:AM|PM))\n([A - Za - z0 - 9\s, - ] + (?:,\s * [A - Z]{2}(?:\s * \d{5})?)?)$ / im,
    totalCost: provider = = = 'Lyft' ? / Pay\s + [^\$] * \$(\d + \.\d{2}) / i : / Total\s + \$(\d + \.\d{2}) / i,
    baseFare: provider = = = 'Lyft' ? / Lyft\s + fare\s + [^\$] * \$(\d + \.\d{2}) / i : / Trip\s + fare\s + \$(\d + \.\d{2}) / i,
    fee: / ((?:Service\s + Fee|Priority\s + Pickup\s + Upgrade|Wait\s + [tT]ime\s * [fF]ee|Booking\s + Fee|Regulatory\s * Fee|CA\s + Driver\s * Benefits?|Access\s + for\s + All\s + Fee|Airport\s * Fee|Clean\s + Miles\s + Standard\s + Regulatory\s + Fee))\s * [^\$] * \$(\d + \.\d{2}) / gi,
    discount: / ((?:Membership|Promotion))\s * [^\$] * \$(\d + \.\d{2}) / gi,
    credit: / ((?:Lyft\s + Pink|Uber\s + One\s + Credits))\s * [^\$] * \$(\d + \.\d{2}) / gi,
    tip: provider = = = 'Lyft' ? null : / Tip\s + \$(\d + \.\d{2}) / i,
    payment: provider = = = 'Lyft' ? / Pay\s + ([A - Za - z\s\(\)] + (?:ending\s * \d{4})?)\s + \$\d + \.\d{2} / i : / Payments\s + ([A - Za - z\s] + (?:ending\s * \d{4})?) / i,
    driver: provider = = = 'Lyft' ? / Thanks\s + for\s + riding\s + with\s + ([A - Za - z\s] + ) / i : / You\s + rode\s + with\s + ([A - Za - z\s] + ) / i,
    rating: provider = = = 'Lyft' ? null : / (\d + \.\d{1,2})\s * ★\s * Rating / i;
  };
  try {
    if (provider = = = 'Lyft' && / missed\s + ride / i.test(body)) {
      const cancelFeeMatch = body.match( / Lyft\s + cancel\s + fee\s + \$(\d + \.\d{2}) / i);
      if (cancelFeeMatch) {
        receipt.total_cost = parseFloat(cancelFeeMatch[1]);
        receipt.base_fare = 0;
        receipt.validation_notes = 'Missed ride cancel fee.';
        return receipt;
      }
    }
    const matches = {};
    for (const [key, pattern] of Object.entries(patterns)) {
      if (! pattern) continue;
      if (key = = = 'fee' || key = = = 'discount' || key = = = 'credit') {
        const items = [];
        let match;
        while ((match = pattern.exec(body)) ! = = null) {
          items.push(match[1] + ': $' + match[2]);
        }
        matches[key] = items;
      } else {
        const match = body.match(pattern);
        matches[key] = match ? match[1] : null;
      }
    }
    Logger.log(`Regex matches for ${messageId}: ${JSON.stringify(matches, null, 2)}`);
    if (patterns.tripDate.test(body)) {
      receipt.trip_date = body.match(patterns.tripDate)[1].trim();
    }
    if (patterns.startTime && patterns.startTime.test(body)) {
      receipt.trip_start_time = convertTo24Hour(body.match(patterns.startTime)[1]);
    }
    if (patterns.endTime && patterns.endTime.test(body)) {
      receipt.trip_end_time = convertTo24Hour(body.match(patterns.endTime)[1]);
    }
    if (receipt.trip_start_time ! = = 'N / A' && receipt.trip_end_time ! = = 'N / A') {
      const start = parseTime(receipt.trip_start_time);
      const end = parseTime(receipt.trip_end_time);
      if (start && end) {
        let minutes = (end - start) / (1000 * 60);
        if (minutes < 0) minutes + = 24 * 60;
        receipt.trip_duration = `${Math.floor(minutes)} minutes`;
      }
    } else if (patterns.duration && patterns.duration.test(body)) {
      receipt.trip_duration = body.match(patterns.duration)[1].trim();
    }
    if (patterns.mileage && patterns.mileage.test(body)) {
      receipt.mileage = parseFloat(body.match(patterns.mileage)[1]);
    }
    if (patterns.startLocation && patterns.startLocation.test(body)) {
      receipt.start_location = body.match(patterns.startLocation)[1].trim();
    }
    if (patterns.endLocation && patterns.endLocation.test(body)) {
      receipt.end_location = body.match(patterns.endLocation)[1].trim();
    }
    if (patterns.totalCost && patterns.totalCost.test(body)) {
      receipt.total_cost = parseFloat(body.match(patterns.totalCost)[1]);
    }
    if (patterns.baseFare && patterns.baseFare.test(body)) {
      receipt.base_fare = parseFloat(body.match(patterns.baseFare)[1]);
    }
    let feeMatch;
    while ((feeMatch = patterns.fee.exec(body)) ! = = null) {
      receipt.additional_fees.push({ name: feeMatch[1].trim(), amount: parseFloat(feeMatch[2]) });
    }
    let discountMatch;
    while ((discountMatch = patterns.discount.exec(body)) ! = = null) {
      receipt.discounts.push({ name: discountMatch[1].trim(), amount: - parseFloat(discountMatch[2]) });
    }
    let creditMatch;
    while ((creditMatch = patterns.credit.exec(body)) ! = = null) {
      receipt.credits.push({ name: creditMatch[1].trim(), amount: - parseFloat(creditMatch[2]) });
    }
    if (patterns.tip && patterns.tip.test(body)) {
      receipt.tip_amount = parseFloat(body.match(patterns.tip)[1]);
    }
    if (patterns.payment && patterns.payment.test(body)) {
      receipt.payment_method = body.match(patterns.payment)[1].trim();
    }
    if (patterns.driver && patterns.driver.test(body)) {
      receipt.driver_name = body.match(patterns.driver)[1].trim();
    }
    if (patterns.rating && patterns.rating.test(body)) {
      receipt.driver_rating = parseFloat(body.match(patterns.rating)[1]);
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

 * /

function extractReceiptsFromGmail(maxThreads) {
  const receipts = [];
  const labels = ['MTBI / Lyft', 'MTBI / Uber'];
  for (const label of labels) {
    try {
      const query = `label:${label}`;
      const threads = GmailApp.search(query, 0, maxThreads);
      Logger.log(`Query: ${query}`);
      Logger.log(`Found ${threads.length} threads for ${label}`);
      if (threads.length = = = 0) {
        Logger.log(`No threads found for label ${label}. Check if the label contains emails. Try searching 'label:${label}' in Gmail.`);
        const fallbackQuery = `from:${label = = = 'MTBI / Uber' ? 'uber' : 'lyft'}`;
        const fallbackThreads = GmailApp.search(fallbackQuery, 0, maxThreads);
        Logger.log(`Fallback query: ${fallbackQuery}`);
        Logger.log(`Found ${fallbackThreads.length} threads in fallback for ${label}`);
        if (fallbackThreads.length > 0) {
          Logger.log(`Emails found without label. Apply '${label}' label to these emails in Gmail.`);
          fallbackThreads.forEach((thread, index) = > {
            const firstMessage = thread.getMessages()[0];
            Logger.log(`Fallback Thread ${index + 1}: Subject= ${thread.getFirstMessageSubject()}, From= ${firstMessage.getFrom()}, Date= ${firstMessage.getDate()}`);
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
        threads.forEach((thread, index) = > {
          const firstMessage = thread.getMessages()[0];
          Logger.log(`Thread ${index + 1}: Subject= ${thread.getFirstMessageSubject()}, From= ${firstMessage.getFrom()}, Date= ${firstMessage.getDate()}`);
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

 * /

function processRideReceipts() {
  const maxThreads = 50;
  const startTime = Date.now();
  const labels = GmailApp.getUserLabels();
  Logger.log('Available Gmail labels: ' + labels.map(label = > label.getName()).join(', '));
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

 * /

function writeToSheet(receipts) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('RideReceipts');
    if (! sheet) {
      sheet = spreadsheet.insertSheet('RideReceipts');
    }
    sheet.clear();
    const headers = [;
      'Message Link', 'Provider', 'Trip Date', 'Trip Start Time', 'Trip End Time', 'Mileage', 'Trip Duration',
      'Start Location', 'End Location', 'Total Cost', 'Base Fare', 'Additional Fees', 'Discounts', 'Credits',
      'Tip Amount', 'Payment Method', 'Driver Name', 'Driver Rating', 'Validation Notes'
    ];
    const rows = receipts.map(receipt = > {
      try {
        const fees = receipt.additional_fees.map(fee = > `${fee.name}: $${fee.amount.toFixed(2)}`).join(', ');
        const discounts = receipt.discounts.map(discount = > `${discount.name}: $${discount.amount.toFixed(2)}`).join(', ');
        const credits = receipt.credits.map(credit = > `${credit.name}: $${credit.amount.toFixed(2)}`).join(', ');
        let formattedDate = receipt.trip_date;
        const dateMatch = receipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2}),\s * (\d{4}) / );
        if (dateMatch) {
          const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(dateMatch[1]) + 1;
          formattedDate = `${month.toString().padStart(2, '0')} / ${dateMatch[2].padStart(2, '0')} / ${dateMatch[3]}`;
        } else {
          formattedDate = 'N / A';
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
    });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    sheet.autoResizeColumns(1, headers.length);
    Logger.log('Data written to RideReceipts sheet');
  } catch (e) {
    Logger.log(`Error writing to sheet: ${e.message}`);
  }
}

/ / Helper Functions

/**

 * Converts between formats
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {any} The result

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

 * Sets parime or configuration values
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {any} The result

 * /

function parseTime(timeStr) {
  const match = timeStr.match( / (\d{2}):(\d{2}) / );
  if (! match) return null;
  const date = new Date();
  date.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
  return date;
}

/**

 * Validates and clean receipts integrity
 * @param
 * @param {any} receipts - The receipts parameter
 * @returns {any} The result

 * /

function validateAndCleanReceipts(receipts) {
  return receipts.map((receipt, index) = > {
    try {
      const validatedReceipt = { ...receipt, validation_notes: '' };
      if (! ['Uber', 'Lyft'].includes(validatedReceipt.provider)) {
        validatedReceipt.validation_notes + = 'Invalid provider. ';
      }
      const dateMatch = validatedReceipt.trip_date.match( / ([A - Za - z] + )\s + (\d{1,2}),\s * (\d{4}) / );
      if (! dateMatch) {
        validatedReceipt.trip_date = 'N / A';
        validatedReceipt.validation_notes + = 'Invalid trip date. ';
      }
      const timePattern = / ^\d{2}:\d{2}$ / ; if (! timePattern.test(validatedReceipt.trip_start_time)) {
        validatedReceipt.trip_start_time = 'N / A';
        validatedReceipt.validation_notes + = 'Invalid start time. ';
      }
      if (! timePattern.test(validatedReceipt.trip_end_time)) {
        validatedReceipt.trip_end_time = 'N / A';
        validatedReceipt.validation_notes + = 'Invalid end time. ';
      }
      if (typeof validatedReceipt.mileage ! = = 'number' || validatedReceipt.mileage < = 0) {
        validatedReceipt.mileage = 0;
        validatedReceipt.validation_notes + = 'Invalid mileage. ';
      }
      let calculatedTotal = validatedReceipt.base_fare;
      validatedReceipt.additional_fees.forEach(fee = > calculatedTotal + = fee.amount);
      validatedReceipt.discounts.forEach(discount = > calculatedTotal + = discount.amount);
      validatedReceipt.credits.forEach(credit = > calculatedTotal + = credit.amount);
      calculatedTotal + = validatedReceipt.tip_amount;
      if (Math.abs(calculatedTotal - validatedReceipt.total_cost) > 0.01) {
        validatedReceipt.validation_notes + = `Total cost mismatch: expected ${calculatedTotal}, got ${validatedReceipt.total_cost}. `;
      }
      validatedReceipt.start_location = validatedReceipt.start_location.replace( / ,?\s * US$ / , '').trim();
      validatedReceipt.end_location = validatedReceipt.end_location.replace( / ,?\s * US$ / , '').trim();
      if (validatedReceipt.trip_duration ! = = 'N / A') {
        validatedReceipt.trip_duration = validatedReceipt.trip_duration.replace('mins', 'minutes').trim();
      }
      if (! validatedReceipt.validation_notes) {
        validatedReceipt.validation_notes = 'Data validated successfully.';
      }
      if (validatedReceipt.tip_amount = = = 0) {
        validatedReceipt.validation_notes + = ' Tip assumed as $0.';
      }
      return validatedReceipt;
    } catch (e) {
      Logger.log(`Error validating receipt ${index}: ${e.message}`);
      return { ...receipt, validation_notes: `Validation failed: ${e.message}` };
    }
  });
}