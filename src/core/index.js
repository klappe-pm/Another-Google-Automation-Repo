/**
 * Core functionality for Google Apps Script
 * Provides base classes and utilities
 */

// Ensure namespace exists
var WorkspaceAutomation = WorkspaceAutomation || {};
WorkspaceAutomation.Core = WorkspaceAutomation.Core || {};

// Load core components
// Note: In Google Apps Script, these would be loaded via clasp or script includes
// For development, ensure these files are included in the correct order:
// 1. logger.js
// 2. metricsCollector.js
// 3. configurationManager.js
// 4. featureFlags.js
// 5. serviceFactory.js
// 6. index.js (this file)

/**
 * Core module initialization
 * Add core functionality here as the system grows
 */
(function(Core) {
  'use strict';
  
  /**
   * BaseService - Abstract base class for all services
   * Provides common functionality like logging, error handling, and metrics
   * 
   * Note: Uses function constructor for Google Apps Script compatibility
   */
  Core.BaseService = function(name, options) {
    this.name = name || 'UnnamedService';
    this.options = options || {};
    
    // Initialize dependencies with fallbacks for loading order
    try {
      this.logger = Core.Logger ? Core.Logger.getInstance() : { info: console.log, error: console.error, debug: console.log };
      this.metrics = Core.MetricsCollector ? Core.MetricsCollector.getInstance() : { increment: function(){}, timing: function(){} };
      this.config = Core.ConfigurationManager ? Core.ConfigurationManager.getInstance() : { get: function(){ return {}; } };
    } catch (error) {
      console.error('Error initializing BaseService dependencies:', error);
      // Provide minimal fallbacks
      this.logger = { info: console.log, error: console.error, debug: console.log };
      this.metrics = { increment: function(){}, timing: function(){} };
      this.config = { get: function(){ return {}; } };
    }
    
    this.initialized = false;
    this.startTime = new Date();
    
    // Initialize service
    this.initialize();
  };
  
  Core.BaseService.prototype = {
    /**
     * Initialize the service - override in subclasses
     */
    initialize: function() {
      try {
        this.logger.info(`Initializing service: ${this.name}`);
        this.metrics.increment(`service.${this.name}.initialized`);
        this.initialized = true;
      } catch (error) {
        this.handleError('initialize', error);
        throw error;
      }
    },
    
    /**
     * Execute a service operation with error handling and metrics
     */
    execute: function(operation, params) {
      const operationStart = new Date();
      const operationName = `${this.name}.${operation}`;
      
      try {
        this.logger.debug(`Executing operation: ${operationName}`, params);
        this.metrics.increment(`operation.${operationName}.started`);
        
        const result = this.performOperation(operation, params);
        
        const duration = new Date() - operationStart;
        this.metrics.timing(`operation.${operationName}.duration`, duration);
        this.metrics.increment(`operation.${operationName}.success`);
        
        this.logger.debug(`Operation completed: ${operationName}`, { duration: `${duration}ms` });
        return result;
        
      } catch (error) {
        this.metrics.increment(`operation.${operationName}.error`);
        this.handleError(operationName, error);
        throw error;
      }
    },
    
    /**
     * Override this method in subclasses to implement specific operations
     */
    performOperation: function(operation, params) {
      throw new Error(`Operation '${operation}' not implemented in ${this.name}`);
    },
    
    /**
     * Handle errors consistently across all services
     */
    handleError: function(context, error) {
      const errorInfo = {
        service: this.name,
        context: context,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      
      this.logger.error(`Error in ${this.name}.${context}`, errorInfo);
      this.metrics.increment(`error.${this.name}.${context}`);
    },
    
    /**
     * Get service health status
     */
    getHealthStatus: function() {
      const uptime = new Date() - this.startTime;
      return {
        name: this.name,
        initialized: this.initialized,
        uptime: uptime,
        status: this.initialized ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      };
    },
    
    /**
     * Cleanup resources - override in subclasses if needed
     */
    cleanup: function() {
      this.logger.info(`Cleaning up service: ${this.name}`);
      this.metrics.increment(`service.${this.name}.cleanup`);
    }
  };
  
})(WorkspaceAutomation.Core);
