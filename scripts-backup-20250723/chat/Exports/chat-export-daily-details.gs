/**
 * Title: Google Chat Daily Usage Analytics
 * Service: Google Chat
 * Purpose: Analyze chat usage patterns and export weekly statistics
 * Created: 2024-01-15
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Analyzes Google Chat usage data for the previous work week
- Description: Fetches chat data from Google Chat API, processes communication metrics, and exports statistics to Google Sheets
- Problem Solved: Provides insights into team communication patterns, response times, and engagement metrics
- Successful Execution: Creates comprehensive weekly analytics in Google Sheets with message counts, emoji usage, wait times, and text statistics

Key Features:
1. Fetches chat data for each day of the previous work week
2. Analyzes communication metrics (message counts, emoji usage, wait times)
3. Writes detailed analysis results to Google Sheets spreadsheet
4. Handles API pagination for large datasets
5. Includes comprehensive error handling and debug logging
6. Calculates per-person statistics and communication patterns
*/

// Global variable for logging
var DEBUG = true;

// Function for debug logging
function debugLog(message) {
  if (DEBUG) {
    Logger.log(message);
  }
}

// Main function to analyze chat usage
function analyzeChatUsage() {
  debugLog("Starting analyzeChatUsage function");
  
  // Set up spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Chat facts');
  var sheet = ss.getSheetByName('Chat facts') || ss.insertSheet('Chat facts');
  debugLog("Spreadsheet and sheet set up");
  
  // Set up headers
  var headers = [
    "date", "typeChat", "nameChat", "totalPeople", "avgSentencesPerson", "avgWordsPerson", 
    "avgCharactersPerson", "avgEmojisPerson", "maxSentencesPerson", "maxWordsPerson", 
    "maxCharactersPerson", "maxEmojisPerson", "totalMessages", "totalWaitTime", "averageWaitTime",
    "medianWaitTime", "totalSentences", "totalWords", "totalCharacters", "totalLinks", 
    "totalEmojis", "totalThreads", "totalQuotes", "totalEmojisPeople", "totalUniqueEmojis",
    "totalExclamations", "totalPeriods", "totalQuestions", "totalCommas", "totalDash", 
    "totalEmDash", "totalLists"
  ];
  
  for (var i = 1; i <= 11; i++) {
    headers.push("emoji-" + i);
  }
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  debugLog("Headers set up in sheet");
  
  // Get date range for previous work week
  var today = new Date();
  var lastFriday = new Date(today.getTime() - (today.getDay() + 2) * 24 * 60 * 60 * 1000);
  var lastMonday = new Date(lastFriday.getTime() - 4 * 24 * 60 * 60 * 1000);
  debugLog("Date range set: " + lastMonday.toISOString() + " to " + lastFriday.toISOString());
  
  // Loop through each day of the previous work week
  for (var date = new Date(lastMonday); date <= lastFriday; date.setDate(date.getDate() + 1)) {
    let currentDate = new Date(date);  // New date instance for each iteration
    debugLog("Processing data for " + currentDate.toISOString().split('T')[0]);
    
    try {
      // Fetch chat data for this date
      var chatData = getChatData(currentDate);
      
      // Only analyze if we have data
      if (chatData && chatData.messages && chatData.messages.length > 0) {
        debugLog("Chat data fetched successfully. Analyzing...");
        var analysis = analyzeChat(chatData);
        debugLog("Analysis complete. Writing to sheet...");
        writeAnalysisToSheet(sheet, currentDate, analysis);
      } else {
        debugLog("No chat data available for " + currentDate.toISOString().split('T')[0]);
      }
    } catch (error) {
      debugLog("Error processing data for " + currentDate.toISOString().split('T')[0] + ": " + error.stack);
    }
  }
  
  debugLog("Analysis complete for all dates");
}

// Function to fetch chat data for a specific date
function getChatData(date) {
  debugLog("Starting getChatData for " + date.toISOString().split('T')[0]);
  
  var startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  var endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  var chatData = { spaces: [], messages: [] };
  
  try {
    chatData.spaces = fetchSpaces();
    chatData.spaces.forEach(function(space, index) {
      var spaceMessages = fetchMessagesForSpace(space.name, startOfDay, endOfDay);
      chatData.messages = chatData.messages.concat(spaceMessages);
    });
    
    debugLog("Successfully fetched all chat data. Total spaces: " + chatData.spaces.length + ", Total messages: " + chatData.messages.length);
    return chatData;
  } catch (error) {
    debugLog("Error in getChatData: " + error.stack);
    return {};
  }
}

// Function to fetch all chat spaces
function fetchSpaces() {
  var spaces = [];
  var pageToken;
  var pageCount = 0;
  
  do {
    pageCount++;
    var url = 'https://chat.googleapis.com/v1/spaces';
    if (pageToken) url += '?pageToken=' + pageToken;
    
    var options = {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(url, options);
      var result = JSON.parse(response.getContentText());
      spaces = spaces.concat(result.spaces || []);
      pageToken = result.nextPageToken;
    } catch (error) {
      debugLog("Error fetching spaces: " + error.stack);
      pageToken = null;
    }
  } while (pageToken);
  
  return spaces;
}

// Function to fetch messages for a specific space and time range
function fetchMessagesForSpace(spaceName, startTime, endTime) {
  var messages = [];
  var pageToken;
  var pageCount = 0;
  
  do {
    pageCount++;
    var url = 'https://chat.googleapis.com/v1/' + spaceName + '/messages' +
              '?filter=createTime>="' + startTime.toISOString() + '" AND createTime<="' + endTime.toISOString() + '"';
    if (pageToken) url += '&pageToken=' + pageToken;
    
    var options = {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(url, options);
      var result = JSON.parse(response.getContentText());
      messages = messages.concat(result.messages || []);
      pageToken = result.nextPageToken;
    } catch (error) {
      debugLog("Error fetching messages for space " + spaceName + ": " + error.stack);
      pageToken = null;
    }
  } while (pageToken);
  
  return messages;
}

// Function to analyze chat data
function analyzeChat(chatData) {
  let analysis = {
    typeChat: "space",
    nameChat: chatData.spaces[0]?.displayName || "Unknown",
    totalPeople: new Set(chatData.messages.map(m => m.sender.name)).size,
    totalMessages: chatData.messages.length,
    totalSentences: 0,
    totalWords: 0,
    totalCharacters: 0,
    totalEmojis: 0,
    totalLinks: 0,
    totalThreads: 0,
    totalQuotes: 0,
    totalExclamations: 0,
    totalPeriods: 0,
    totalQuestions: 0,
    totalCommas: 0,
    totalDashes: 0,
    totalEmDashes: 0,
    totalLists: 0,
    totalWaitTime: 0,
    emojiCounts: {},
    personStats: {}
  };

  let prevMessageTime = null;
  chatData.messages.forEach((message, index) => {
    const text = message.text || "";
    const sentences = text.match(/[^.!?]+[.!?]+|\S+/g) || [];
    const words = text.split(/\s+/);
    
    analysis.totalSentences += sentences.length;
    analysis.totalWords += words.length;
    analysis.totalCharacters += text.length;
    analysis.totalEmojis += countEmojis(text);
    analysis.totalLinks += (text.match(/https?:\/\/[^\s]+/g) || []).length;
    analysis.totalThreads += message.thread ? 1 : 0;
    analysis.totalQuotes += (text.match(/^>/gm) || []).length;
    analysis.totalExclamations += (text.match(/!/g) || []).length;
    analysis.totalPeriods += (text.match(/\./g) || []).length;
    analysis.totalQuestions += (text.match(/\?/g) || []).length;
    analysis.totalCommas += (text.match(/,/g) || []).length;
    analysis.totalDashes += (text.match(/-/g) || []).length;
    analysis.totalEmDashes += (text.match(/—/g) || []).length;
    analysis.totalLists += (text.match(/^[-*]\s/gm) || []).length;

    if (prevMessageTime) {
      const waitTime = new Date(message.createTime) - prevMessageTime;
      analysis.totalWaitTime += waitTime;
    }
    prevMessageTime = new Date(message.createTime);

    const emojis = getUniqueEmojis(text);
    emojis.forEach(emoji => {
      analysis.emojiCounts[emoji] = (analysis.emojiCounts[emoji] || 0) + 1;
    });

    if (!analysis.personStats[message.sender.name]) {
      analysis.personStats[message.sender.name] = { sentences: 0, words: 0, characters: 0, emojis: 0 };
    }
    const personStats = analysis.personStats[message.sender.name];
    personStats.sentences += sentences.length;
    personStats.words += words.length;
    personStats.characters += text.length;
    personStats.emojis += countEmojis(text);
  });

  analysis.avgSentencesPerson = analysis.totalSentences / analysis.totalPeople;
  analysis.avgWordsPerson = analysis.totalWords / analysis.totalPeople;
  analysis.avgCharactersPerson = analysis.totalCharacters / analysis.totalPeople;
  analysis.avgEmojisPerson = analysis.totalEmojis / analysis.totalPeople;
  analysis.averageWaitTime = analysis.totalWaitTime / (analysis.totalMessages - 1);
  analysis.medianWaitTime = calculateMedianWaitTime(chatData.messages);

  let maxSentences = 0, maxWords = 0, maxCharacters = 0, maxEmojis = 0;
  Object.values(analysis.personStats).forEach(stats => {
    maxSentences = Math.max(maxSentences, stats.sentences);
    maxWords = Math.max(maxWords, stats.words);
    maxCharacters = Math.max(maxCharacters, stats.characters);
    maxEmojis = Math.max(maxEmojis, stats.emojis);
  });
  analysis.maxSentencesPerson = maxSentences;
  analysis.maxWordsPerson = maxWords;
  analysis.maxCharactersPerson = maxCharacters;
  analysis.maxEmojisPerson = maxEmojis;

  analysis.totalEmojisPeople = Object.keys(analysis.personStats).filter(person => analysis.personStats[person].emojis > 0).length;
  analysis.totalUniqueEmojis = Object.keys(analysis.emojiCounts).length;

  const sortedEmojis = Object.entries(analysis.emojiCounts).sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < 11 && i < sortedEmojis.length; i++) {
    analysis[`emoji-${i + 1}`] = sortedEmojis[i][0];
  }

  return analysis;
}

// Function to write analysis results to the spreadsheet
function writeAnalysisToSheet(sheet, date, analysis) {
  var row = [date.toISOString().split('T')[0]];
  
  for (var i = 0; i < sheet.getLastColumn(); i++) {
    var header = sheet.getRange(1, i + 1).getValue();
    row.push(analysis[header] || 0);
  }
  
  sheet.appendRow(row);
}

// Function to count emojis in a text
function countEmojis(text) {
  var emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return (text.match(emojiRegex) || []).length;
}

// Function to get unique emojis in a text
function getUniqueEmojis(text) {
  var emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  return [...new Set(text.match(emojiRegex) || [])];
}

// Function to calculate median wait time between messages
function calculateMedianWaitTime(messages) {
  const waitTimes = [];
  for (let i = 1; i < messages.length; i++) {
    waitTimes.push(new Date(messages[i].createTime) - new Date(messages[i - 1].createTime));
  }
  waitTimes.sort((a, b) => a - b);
  
  const middle = Math.floor(waitTimes.length / 2);
  return waitTimes.length % 2 === 0 ? (waitTimes[middle - 1] + waitTimes[middle]) / 2 : waitTimes[middle];
}
