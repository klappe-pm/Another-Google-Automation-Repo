/**
 * Logger - Centralized logger for the application
 */
(function(Core) {
  'use strict';

  var Logger = function() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logs = [];
    this.logLevel = 'info'; // Default log level
    Logger.instance = this;
  };

  Logger.prototype = {
    /**
     * Set the logging level
     */
    setLogLevel: function(level) {
      this.logLevel = level;
    },

    /**
     * Check if a log level should be output
     */
    shouldLog: function(level) {
      var levels = { 'debug': 0, 'info': 1, 'warn': 2, 'error': 3 };
      var currentLevel = levels[this.logLevel] || 1;
      var messageLevel = levels[level] || 1;
      return messageLevel >= currentLevel;
    },

    /**
     * Core logging method
     */
    log: function(level, message, meta) {
      if (!this.shouldLog(level)) {
        return;
      }

      meta = meta || {};
      var logEntry = { 
        level: level, 
        message: message, 
        meta: meta, 
        timestamp: new Date() 
      };
      
      this.logs.push(logEntry);
      
      // Keep only the last 1000 logs to prevent memory issues
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-1000);
      }
      
      // Output to console with appropriate method
      try {
        if (console[level]) {
          console[level]('[' + level.toUpperCase() + ']', message, meta);
        } else {
          console.log('[' + level.toUpperCase() + ']', message, meta);
        }
      } catch (error) {
        // Fallback if console method doesn't exist
        console.log('[' + level.toUpperCase() + ']', message, meta);
      }
    },

    /**
     * Log info level messages
     */
    info: function(message, meta) {
      this.log('info', message, meta);
    },

    /**
     * Log error level messages
     */
    error: function(message, meta) {
      this.log('error', message, meta);
    },

    /**
     * Log debug level messages
     */
    debug: function(message, meta) {
      this.log('debug', message, meta);
    },

    /**
     * Log warning level messages
     */
    warn: function(message, meta) {
      this.log('warn', message, meta);
    },

    /**
     * Get all logs
     */
    getLogs: function() {
      return this.logs.slice(); // Return copy
    },

    /**
     * Clear all logs
     */
    clearLogs: function() {
      this.logs = [];
    },

    /**
     * Get logs by level
     */
    getLogsByLevel: function(level) {
      return this.logs.filter(function(log) {
        return log.level === level;
      });
    }
  };

  Logger.getInstance = function() {
    return new Logger();
  };

  // Static instance reference
  Logger.instance = null;

  Core.Logger = Logger;

})(WorkspaceAutomation.Core);

