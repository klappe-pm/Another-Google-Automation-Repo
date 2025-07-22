module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "browser": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "script"
  },
  "globals": {
    "PropertiesService": "readonly",
    "DriveApp": "readonly",
    "SpreadsheetApp": "readonly",
    "DocumentApp": "readonly",
    "GmailApp": "readonly",
    "CalendarApp": "readonly",
    "Utilities": "readonly",
    "Logger": "readonly",
    "console": "readonly",
    "Session": "readonly",
    "Browser": "readonly",
    "HtmlService": "readonly",
    "ScriptApp": "readonly",
    "ContentService": "readonly",
    "XmlService": "readonly",
    "UrlFetchApp": "readonly",
    "LockService": "readonly",
    "CacheService": "readonly",
    "Blob": "readonly"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": "warn",
    "no-undef": "warn"
  }
};