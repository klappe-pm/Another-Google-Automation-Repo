/**
 * Services module for Google Apps Script
 * Contains all Google Workspace service integrations
 */

// Ensure namespace exists
var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Services = WorkspaceAutomation.Services || {};

/**
 * Services module initialization
 * Contains all Google Workspace service wrappers
 * 
 * Load order for services:
 * 1. GmailService.js
 * 2. DriveService.js  
 * 3. SheetsService.js
 * 4. DocsService.js
 * 5. index.js (this file)
 */
(function(Services) {
  'use strict';
  
  /**
   * Service factory for creating service instances
   */
  Services.ServiceFactory = {
    /**
     * Create Gmail service instance
     */
    createGmailService: function(options) {
      return new Services.GmailService('GmailService', options);
    },
    
    /**
     * Create Drive service instance
     */
    createDriveService: function(options) {
      return new Services.DriveService('DriveService', options);
    },
    
    /**
     * Create Sheets service instance
     */
    createSheetsService: function(options) {
      return new Services.SheetsService('SheetsService', options);
    },
    
    /**
     * Create Docs service instance
     */
    createDocsService: function(options) {
      return new Services.DocsService('DocsService', options);
    },
    
    /**
     * Create all services at once
     */
    createAllServices: function(options) {
      return {
        gmail: this.createGmailService(options),
        drive: this.createDriveService(options),
        sheets: this.createSheetsService(options),
        docs: this.createDocsService(options)
      };
    }
  };
  
  /**
   * Convenience methods for quick service access
   */
  Services.getGmailService = function(options) {
    return Services.ServiceFactory.createGmailService(options);
  };
  
  Services.getDriveService = function(options) {
    return Services.ServiceFactory.createDriveService(options);
  };
  
  Services.getSheetsService = function(options) {
    return Services.ServiceFactory.createSheetsService(options);
  };
  
  Services.getDocsService = function(options) {
    return Services.ServiceFactory.createDocsService(options);
  };
  
  // Future service wrappers (placeholder for planned services)
  // Services.Calendar = function() { ... };
  // Services.Slides = function() { ... };
  // Services.Tasks = function() { ... };
  // Services.Chat = function() { ... };
  // Services.Photos = function() { ... };
  // Services.Utility = function() { ... };
  
})(WorkspaceAutomation.Services);
