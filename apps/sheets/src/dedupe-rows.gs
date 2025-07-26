/**
 * Script Name: dedupe-rows
 * 
 * Script Summary:
 * Imports spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Validate input data
 * 4. Sort data by relevant fields
 * 
 * Script Functions:
 * - calculateMetrics(): Performs calculations on metrics
 * - createDashboard(): Creates new dashboard or resources
 * - createEnhancedSheet(): Creates new enhanced sheet or resources
 * - deduplicateRideData(): Works with spreadsheet data
 * - extractHour(): Extracts specific information
 * - getTimeCategory(): Gets specific time category or configuration
 * - onOpen(): Performs specialized operations
 * 
 * Script Helper Functions:
 * - getDayOfWeek(): Gets specific day of week or configuration
 * - parseCost(): Parses and extracts cost
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

/**
 * Helper function to get day of week
 *//**
 * Helper function to extract hour from time string
 *//**
 * Helper function to determine time category based on hour
 *//**
 * Helper function to parse cost from string
 *//**
 * Creates a summary dashboard sheet with key metrics
 *//**
 * Calculate metrics for the dashboard
 *//**
 * Add menu to trigger the functions
 */// Main Functions

// Main Functions

/**

 * Performs calculations on metrics
 * @param
 * @param {Object} data - The data object to process
 * @param {string} providerColIdx - The providerColIdx parameter
 * @param {string} totalCostColIdx - The totalCostColIdx parameter
 * @param {string} dayOfWeekColIdx - The dayOfWeekColIdx parameter
 * @param {string} timeCategoryColIdx - The timeCategoryColIdx parameter
 * @param {string} costPerMileColIdx - The costPerMileColIdx parameter
 * @returns {any} The result

 */

function calculateMetrics(data, providerColIdx, totalCostColIdx, dayOfWeekColIdx, timeCategoryColIdx, costPerMileColIdx) {
  var metrics = {
    totalRides: data.length,
    totalSpent: 0,
    averageRideCost: 0,
    averageCostPerMile: 0,
    ridesByProvider: {},
    ridesByDayOfWeek: {},
    ridesByTimeCategory: {}
  };
  
  var totalCostPerMile = 0;
  var costPerMileCount = 0;
  
  // Process each row
  data.forEach(function(row) {
    // Total cost
    var cost = parseCost(row[totalCostColIdx]);
    metrics.totalSpent += cost;
    
    // Provider counts
    var provider = row[providerColIdx];
    metrics.ridesByProvider[provider] = (metrics.ridesByProvider[provider] || 0) + 1;
    
    // Day of week counts
    var dayOfWeek = row[dayOfWeekColIdx];
    if (dayOfWeek) {
      metrics.ridesByDayOfWeek[dayOfWeek] = (metrics.ridesByDayOfWeek[dayOfWeek] || 0) + 1;
    }
    
    // Time category counts
    var timeCategory = row[timeCategoryColIdx];
    if (timeCategory) {
      metrics.ridesByTimeCategory[timeCategory] = (metrics.ridesByTimeCategory[timeCategory] || 0) + 1;
    }
    
    // Cost per mile average
    var costPerMile = row[costPerMileColIdx];
    if (costPerMile && costPerMile !== '') {
      totalCostPerMile += parseFloat(costPerMile);
      costPerMileCount++;
    }
  });
  
  // Calculate averages
  metrics.averageRideCost = metrics.totalSpent / metrics.totalRides;
  metrics.averageCostPerMile = costPerMileCount > 0 ? totalCostPerMile / costPerMileCount : 0;
  
  return metrics;
}

/**

 * Creates new dashboard or resources
 * @returns {any} The newly created any

 */

function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var enhancedSheet = ss.getSheetByName('Enhanced Rides Data');
  
  if (!enhancedSheet) {
    Browser.msgBox('Please run the deduplication function first to create the Enhanced Rides Data sheet.');
    return;
  }
  
  // Create a new dashboard sheet
  var dashboardSheet = ss.insertSheet('Ride Data Dashboard');
  
  // Get all data from the enhanced sheet
  var data = enhancedSheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indexes
  var providerColIdx = headers.indexOf('Provider');
  var totalCostColIdx = headers.indexOf('Total Cost');
  var dayOfWeekColIdx = headers.indexOf('Day of Week');
  var timeCategoryColIdx = headers.indexOf('Time Category');
  var costPerMileColIdx = headers.indexOf('Cost per Mile');
  
  // Calculate metrics
  var metrics = calculateMetrics(data.slice(1), providerColIdx, totalCostColIdx, dayOfWeekColIdx, timeCategoryColIdx, costPerMileColIdx);
  
  // Create dashboard layout
  var dashboardData = [
    ['Rides Data Dashboard', '', ''],
    ['', '', ''],
    ['Total Rides', metrics.totalRides, ''],
    ['Total Spent', '$' + metrics.totalSpent.toFixed(2), ''],
    ['Average Ride Cost', '$' + metrics.averageRideCost.toFixed(2), ''],
    ['Average Cost Per Mile', '$' + metrics.averageCostPerMile.toFixed(2), ''],
    ['', '', ''],
    ['Rides by Provider', '', ''],
  ];
  
  // Add provider breakdown
  Object.keys(metrics.ridesByProvider).forEach(function(provider) {
    dashboardData.push([provider, metrics.ridesByProvider[provider], '']);
  });
  
  dashboardData.push(['', '', '']);
  dashboardData.push(['Rides by Day of Week', '', '']);
  
  // Add day of week breakdown
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.forEach(function(day) {
    dashboardData.push([day, metrics.ridesByDayOfWeek[day] || 0, '']);
  });
  
  dashboardData.push(['', '', '']);
  dashboardData.push(['Rides by Time of Day', '', '']);
  
  // Add time category breakdown
  var timeCategories = ['Morning', 'Afternoon', 'Evening', 'Night', 'Unknown'];
  timeCategories.forEach(function(category) {
    dashboardData.push([category, metrics.ridesByTimeCategory[category] || 0, '']);
  });
  
  // Write data to dashboard
  dashboardSheet.getRange(1, 1, dashboardData.length, 3).setValues(dashboardData);
  
  // Format dashboard
  dashboardSheet.getRange(1, 1, 1, 3).setFontSize(14).setFontWeight('bold');
  dashboardSheet.getRange(3, 1, 5, 1).setFontWeight('bold');
  dashboardSheet.getRange(8, 1, 1, 1).setFontWeight('bold');
  dashboardSheet.getRange(8 + Object.keys(metrics.ridesByProvider).length + 1, 1, 1, 1).setFontWeight('bold');
  dashboardSheet.getRange(8 + Object.keys(metrics.ridesByProvider).length + days.length + 2, 1, 1, 1).setFontWeight('bold');
  
  dashboardSheet.autoResizeColumns(1, 3);
  
  Browser.msgBox('Dashboard created successfully!');
}

/**

 * Creates new enhanced sheet or resources
 * @param
 * @param {any} ss - The ss for creation
 * @param {Array} deduplicatedRows - The deduplicatedRows for creation
 * @param {any} headers - The headers for creation
 * @returns {any} The newly created any

 */

function createEnhancedSheet(ss, deduplicatedRows, headers) {
  var enhancedSheet = ss.insertSheet('Enhanced Rides Data');
  
  // Create enhanced headers with additional columns
  var enhancedHeaders = headers.slice();
  enhancedHeaders.push('Day of Week', 'Hour', 'Time Category', 'Cost per Mile', 'Cost per Minute');
  
  // Find column indices
  var tripDateColIdx = headers.indexOf('Trip Date');
  var tripStartTimeColIdx = headers.indexOf('Trip Start Time');
  var totalCostColIdx = headers.indexOf('Total Cost');
  var mileageColIdx = headers.indexOf('Mileage');
  var tripDurationColIdx = headers.indexOf('Trip Duration (min)');
  
  // Process each row to add enhanced data
  var enhancedRows = deduplicatedRows.map(function(row) {
    var enhancedRow = row.slice();
    
    // Add Day of Week
    var tripDate = new Date(row[tripDateColIdx]);
    var dayOfWeek = getDayOfWeek(tripDate);
    enhancedRow.push(dayOfWeek);
    
    // Extract hour and add Time Category
    var hour = extractHour(row[tripStartTimeColIdx]);
    enhancedRow.push(hour);
    enhancedRow.push(getTimeCategory(hour));
    
    // Calculate Cost per Mile
    var costValue = parseCost(row[totalCostColIdx]);
    var mileage = row[mileageColIdx] || 0;
    var costPerMile = mileage > 0 ? costValue / mileage : '';
    enhancedRow.push(costPerMile !== '' ? costPerMile : '');
    
    // Calculate Cost per Minute
    var duration = row[tripDurationColIdx] || 0;
    var costPerMinute = duration > 0 ? costValue / duration : '';
    enhancedRow.push(costPerMinute !== '' ? costPerMinute : '');
    
    return enhancedRow;
  });
  
  // Write headers and data to the enhanced sheet
  enhancedSheet.getRange(1, 1, 1, enhancedHeaders.length).setValues([enhancedHeaders]);
  enhancedSheet.getRange(2, 1, enhancedRows.length, enhancedHeaders.length).setValues(enhancedRows);
  
  // Format the sheet
  enhancedSheet.getRange(1, 1, 1, enhancedHeaders.length).setFontWeight('bold');
  enhancedSheet.autoResizeColumns(1, enhancedHeaders.length);
  
  // Format the cost columns as currency
  var totalCostColPos = totalCostColIdx + 1; // +1 because sheets are 1-indexed
  enhancedSheet.getRange(2, totalCostColPos, enhancedRows.length, 1).setNumberFormat('$0.00');
  
  // Format the calculated columns
  var costPerMileColPos = enhancedHeaders.indexOf('Cost per Mile') + 1;
  var costPerMinuteColPos = enhancedHeaders.indexOf('Cost per Minute') + 1;
  
  enhancedSheet.getRange(2, costPerMileColPos, enhancedRows.length, 1).setNumberFormat('$0.00');
  enhancedSheet.getRange(2, costPerMinuteColPos, enhancedRows.length, 1).setNumberFormat('$0.00');
}

/**

 * Works with spreadsheet data
 * @returns {any} The result

 */

function deduplicateRideData() {
  // Get the active spreadsheet and the sheet with the raw data
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getActiveSheet();
  
  // Create a new sheet for the deduplicated data
  var destinationSheet = ss.insertSheet('Deduplicated Rides');
  
  // Get all the data from the source sheet including headers
  var data = sourceSheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find indices of important columns
  var providerColIdx = headers.indexOf('Provider');
  var tripDateColIdx = headers.indexOf('Trip Date');
  var tripStartTimeColIdx = headers.indexOf('Trip Start Time');
  var startLocationColIdx = headers.indexOf('Start Location');
  var endLocationColIdx = headers.indexOf('End Location');
  var dateReceivedColIdx = headers.indexOf('Date Received');
  var timeReceivedColIdx = headers.indexOf('Time Received-1');
  var totalCostColIdx = headers.indexOf('Total Cost');
  var mileageColIdx = headers.indexOf('Mileage');
  var tripDurationColIdx = headers.indexOf('Trip Duration (min)');
  
  if (providerColIdx === -1 || tripDateColIdx === -1 || tripStartTimeColIdx === -1 ||
      startLocationColIdx === -1 || endLocationColIdx === -1 || dateReceivedColIdx === -1 ||
      timeReceivedColIdx === -1 || totalCostColIdx === -1) {
    Browser.msgBox('Error: Required columns not found. Please check your data.');
    return;
  }
  
  // Create a map to store the latest entry for each unique trip
  var tripMap = {};
  
  // Process data (skip header row)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    
    // Skip rows with N/A trip start times (likely cancelled rides)
    if (row[tripStartTimeColIdx] === 'N/A') {
      continue;
    }
    
    // Create a unique key for each trip
    var tripKey = [
      row[providerColIdx],
      row[tripDateColIdx],
      row[tripStartTimeColIdx],
      row[startLocationColIdx],
      row[endLocationColIdx]
    ].join('_');
    
    // Create a date object for sorting (to keep the latest entry)
    var receivedDate = new Date(row[dateReceivedColIdx] + ' ' + row[timeReceivedColIdx]);
    
    // If this trip is not in our map or has a more recent timestamp, store it
    if (!tripMap[tripKey] || receivedDate > tripMap[tripKey].date) {
      tripMap[tripKey] = {
        date: receivedDate,
        rowData: row
      };
    }
  }
  
  // Extract the deduplicated rows
  var deduplicatedRows = Object.values(tripMap).map(function(entry) {
    return entry.rowData;
  });
  
  // Write the headers and deduplicated data to the new sheet
  destinationSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  destinationSheet.getRange(2, 1, deduplicatedRows.length, headers.length).setValues(deduplicatedRows);
  
  // Format the sheet
  destinationSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  destinationSheet.autoResizeColumns(1, headers.length);
  
  // Create an enhanced sheet with additional calculations
  createEnhancedSheet(ss, deduplicatedRows, headers);
  
  // Show completion message with statistics
  Browser.msgBox('Deduplication completed successfully!\\n' +
                'Original row count: ' + (data.length - 1) + '\\n' +
                'Deduplicated row count: ' + deduplicatedRows.length + '\\n' +
                'Removed ' + (data.length - 1 - deduplicatedRows.length) + ' duplicate entries');
}

/**

 * Extracts specific information
 * @param
 * @param {any} timeStr - The timeStr parameter
 * @returns {any} The result

 */

function extractHour(timeStr) {
  if (!timeStr || timeStr === 'N/A') {
    return '';
  }
  
  if (timeStr.indexOf(':') !== -1) {
    return parseInt(timeStr.split(':')[0], 10);
  } else {
    return '';
  }
}

/**

 * Gets specific time category or configuration
 * @param
 * @param {any} hour - The hour to retrieve
 * @returns {any} The requested any

 */

function getTimeCategory(hour) {
  if (hour === '') {
    return 'Unknown';
  } else if (hour >= 5 && hour < 12) {
    return 'Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Evening';
  } else {
    return 'Night';
  }
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Ride Data Tools')
    .addItem('Deduplicate Ride Data', 'deduplicateRideData')
    .addItem('Create Dashboard', 'createDashboard')
    .addToUi();
}

// Helper Functions

/**

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getDayOfWeek(date) {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**

 * Parses and extracts cost
 * @param
 * @param {any} costStr - The costStr parameter
 * @returns {any} The result

 */

function parseCost(costStr) {
  if (!costStr) return 0;
  return parseFloat(costStr.replace('$', '').replace(',', '')) || 0;
}