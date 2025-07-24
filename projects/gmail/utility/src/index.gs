/**
 * Title: Utility Package Main Entry Point
 * Service: Utility
 * Purpose: Main entry point for the centralized utility package
 * Created: 2025-01-16
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Usage:
 *   Utilities.init(); // Initialize all utilities
 *   const config = Utilities.Config.get('service', 'key');
 *   Utilities.Logger.info('Message');
 *   const response = Utilities.Http.get('https://api.example.com');
 * 
 * Timeout Strategy: Individual utilities handle their own timeouts
 * Batch Processing: Coordinated batch processing across utilities
 * Cache Strategy: Unified cache management across all utilities
 * Security: Centralized security policies and validation
 * Performance: Optimized initialization and resource sharing
 */

/*
Script Summary:
- Purpose: Provide unified access to all utility functions across Apps Script services
- Description: Main entry point that initializes and exposes all utility classes
- Problem Solved: Fragmented utility access and inconsistent initialization
- Successful Execution: All services use Utilities namespace for consistent access
*/

/**
 * Main Utilities Namespace
 * Provides centralized access to all utility functions
 */
class Utilities {
  // Version information
  static VERSION = '1.0.0';
  static BUILD_DATE = '2025-01-16';
  
  // Initialization state
  static _initialized = false;
  static _initializationTime = null;
  static _services = new Set();
  
  /**
   * Initialize all utilities with optional configuration
   * @param {Object} config - Global configuration options
   */
  static init(config = {}) {
    if (this._initialized) {
      Logger.warn('Utilities already initialized');
      return;
    }
    
    const startTime = Date.now();
    
    try {
      console.log('Initializing Utilities package...');
      
      // Initialize individual utilities
      this._initializeUtilities(config);
      
      // Set up global error handling
      this._setupGlobalErrorHandling();
      
      // Register cleanup handlers
      this._setupCleanupHandlers();
      
      this._initialized = true;
      this._initializationTime = Date.now() - startTime;
      
      Logger.info('Utilities package initialized successfully', {
        version: this.VERSION,
        initTime: this._initializationTime,
        services: Array.from(this._services)
      });
      
    } catch (error) {
      console.error('Utilities initialization failed:', error);
      throw new Error(`Utilities initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Register a service with the utilities package
   * @param {string} serviceName - Name of the service
   * @param {Object} serviceConfig - Service-specific configuration
   */
  static registerService(serviceName, serviceConfig = {}) {
    try {
      this._services.add(serviceName);
      
      // Store service configuration
      if (typeof Config !== 'undefined') {
        Object.entries(serviceConfig).forEach(([key, value]) => {
          Config.set(serviceName, key, value);
        });
      }
      
      Logger.info('Service registered', { service: serviceName });
    } catch (error) {
      Logger.error('Failed to register service', { service: serviceName, error });
    }
  }
  
  /**
   * Get initialization status
   * @returns {Object} Initialization status information
   */
  static getStatus() {
    return {
      initialized: this._initialized,
      version: this.VERSION,
      buildDate: this.BUILD_DATE,
      initializationTime: this._initializationTime,
      services: Array.from(this._services),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Shutdown utilities and cleanup resources
   */
  static shutdown() {
    try {
      Logger.info('Shutting down Utilities package');
      
      // Flush pending operations
      if (typeof Logger !== 'undefined') {
        Logger.flush();
      }
      
      if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.flush();
      }
      
      // Clear caches
      if (typeof Config !== 'undefined') {
        Config.clearCache();
      }
      
      if (typeof HttpClient !== 'undefined') {
        HttpClient.clearCache();
      }
      
      this._initialized = false;
      this._services.clear();
      
      Logger.info('Utilities package shutdown complete');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
  
  /**
   * Get utility configuration
   * @returns {Object} Current utility configuration
   */
  static getConfig() {
    const config = {
      version: this.VERSION,
      initialized: this._initialized,
      services: Array.from(this._services)
    };
    
    // Add individual utility configs
    if (typeof Config !== 'undefined') {
      config.Config = Config.getConfig ? Config.getConfig() : {};
    }
    
    if (typeof Logger !== 'undefined') {
      config.Logger = Logger.getConfig();
    }
    
    if (typeof HttpClient !== 'undefined') {
      config.HttpClient = HttpClient.getConfig();
    }
    
    if (typeof Auth !== 'undefined') {
      config.Auth = Auth.getConfig();
    }
    
    if (typeof ErrorHandler !== 'undefined') {
      config.ErrorHandler = ErrorHandler.getConfig();
    }
    
    return config;
  }
  
  /**
   * Run diagnostics on all utilities
   * @returns {Object} Diagnostic results
   */
  static diagnose() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      utilities: {},
      issues: []
    };
    
    try {
      // Test Config utility
      if (typeof Config !== 'undefined') {
        try {
          Config.get('test', 'key', 'default');
          results.utilities.Config = 'healthy';
        } catch (error) {
          results.utilities.Config = 'error';
          results.issues.push(`Config: ${error.message}`);
        }
      } else {
        results.utilities.Config = 'missing';
        results.issues.push('Config utility not loaded');
      }
      
      // Test Logger utility
      if (typeof Logger !== 'undefined') {
        try {
          Logger.debug('Diagnostic test message');
          results.utilities.Logger = 'healthy';
        } catch (error) {
          results.utilities.Logger = 'error';
          results.issues.push(`Logger: ${error.message}`);
        }
      } else {
        results.utilities.Logger = 'missing';
        results.issues.push('Logger utility not loaded');
      }
      
      // Test HttpClient utility
      if (typeof HttpClient !== 'undefined') {
        try {
          HttpClient.getConfig();
          results.utilities.HttpClient = 'healthy';
        } catch (error) {
          results.utilities.HttpClient = 'error';
          results.issues.push(`HttpClient: ${error.message}`);
        }
      } else {
        results.utilities.HttpClient = 'missing';
        results.issues.push('HttpClient utility not loaded');
      }
      
      // Test Auth utility
      if (typeof Auth !== 'undefined') {
        try {
          Auth.listServices();
          results.utilities.Auth = 'healthy';
        } catch (error) {
          results.utilities.Auth = 'error';
          results.issues.push(`Auth: ${error.message}`);
        }
      } else {
        results.utilities.Auth = 'missing';
        results.issues.push('Auth utility not loaded');
      }
      
      // Test ErrorHandler utility
      if (typeof ErrorHandler !== 'undefined') {
        try {
          ErrorHandler.getStats();
          results.utilities.ErrorHandler = 'healthy';
        } catch (error) {
          results.utilities.ErrorHandler = 'error';
          results.issues.push(`ErrorHandler: ${error.message}`);
        }
      } else {
        results.utilities.ErrorHandler = 'missing';
        results.issues.push('ErrorHandler utility not loaded');
      }
      
      // Determine overall health
      const errorCount = results.issues.length;
      if (errorCount === 0) {
        results.overall = 'healthy';
      } else if (errorCount <= 2) {
        results.overall = 'warning';
      } else {
        results.overall = 'critical';
      }
      
    } catch (error) {
      results.overall = 'critical';
      results.issues.push(`Diagnostic error: ${error.message}`);
    }
    
    return results;
  }
  
  /**
   * Initialize individual utilities
   * @private
   * @param {Object} config - Configuration options
   */
  static _initializeUtilities(config) {
    // Initialize Config first (others depend on it)
    if (typeof Config !== 'undefined') {
      Config.init ? Config.init(config.Config || {}) : null;
      console.log('✓ Config utility initialized');
    }
    
    // Initialize Logger
    if (typeof Logger !== 'undefined') {
      Logger.init(config.Logger || {});
      console.log('✓ Logger utility initialized');
    }
    
    // Initialize HttpClient
    if (typeof HttpClient !== 'undefined') {
      HttpClient.init(config.HttpClient || {});
      console.log('✓ HttpClient utility initialized');
    }
    
    // Initialize Auth
    if (typeof Auth !== 'undefined') {
      Auth.init(config.Auth || {});
      console.log('✓ Auth utility initialized');
    }
    
    // Initialize ErrorHandler
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.init(config.ErrorHandler || {});
      console.log('✓ ErrorHandler utility initialized');
    }
  }
  
  /**
   * Set up global error handling
   * @private
   */
  static _setupGlobalErrorHandling() {
    if (typeof ErrorHandler === 'undefined') {
      return;
    }
    
    // Catch unhandled errors (where possible in GAS)
    const originalErrorHandler = globalThis.onerror;
    
    globalThis.onerror = (message, source, lineno, colno, error) => {
      ErrorHandler.handle(error || message, {
        source: source,
        line: lineno,
        column: colno,
        type: 'unhandled'
      });
      
      // Call original handler if it exists
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      
      return false;
    };
  }
  
  /**
   * Set up cleanup handlers
   * @private
   */
  static _setupCleanupHandlers() {
    // Register cleanup function to be called before script ends
    // Note: GAS doesn't have standard event handlers, so this is a placeholder
    // for potential future implementation
  }
  
  // Static references to utility classes for easy access
  static Config = typeof Config !== 'undefined' ? Config : null;
  static Logger = typeof Logger !== 'undefined' ? Logger : null;
  static Http = typeof HttpClient !== 'undefined' ? HttpClient : null;
  static Auth = typeof Auth !== 'undefined' ? Auth : null;
  static ErrorHandler = typeof ErrorHandler !== 'undefined' ? ErrorHandler : null;
}

/**
 * Utility Helper Functions
 */

/**
 * Quick initialization function
 * @param {Object} config - Configuration options
 */
function initUtilities(config = {}) {
  return Utilities.init(config);
}

/**
 * Get utility status
 * @returns {Object} Status information
 */
function getUtilityStatus() {
  return Utilities.getStatus();
}

/**
 * Run utility diagnostics
 * @returns {Object} Diagnostic results
 */
function diagnoseUtilities() {
  return Utilities.diagnose();
}

/**
 * Shutdown utilities
 */
function shutdownUtilities() {
  return Utilities.shutdown();
}

/**
 * Legacy compatibility functions
 */

// Configuration helpers
function getUtilityConfig(service, key, defaultValue = null) {
  return Utilities.Config ? Utilities.Config.get(service, key, defaultValue) : defaultValue;
}

function setUtilityConfig(service, key, value) {
  return Utilities.Config ? Utilities.Config.set(service, key, value) : null;
}

// Logging helpers
function logUtility(level, message, data = null, service = null) {
  if (!Utilities.Logger) return;
  
  switch (level.toLowerCase()) {
    case 'debug':
      Utilities.Logger.debug(message, data, service);
      break;
    case 'info':
      Utilities.Logger.info(message, data, service);
      break;
    case 'warn':
      Utilities.Logger.warn(message, data, service);
      break;
    case 'error':
      Utilities.Logger.error(message, data, service);
      break;
    default:
      Utilities.Logger.info(message, data, service);
  }
}

// HTTP helpers
function makeUtilityRequest(url, options = {}) {
  return Utilities.Http ? Utilities.Http.request(url, options) : null;
}

// Error handling helpers
function handleUtilityError(error, context = {}) {
  return Utilities.ErrorHandler ? Utilities.ErrorHandler.handle(error, context) : null;
}

// Initialize utilities when this file is loaded
try {
  // Auto-initialize with basic configuration
  // Services can call init() again with specific config if needed
  if (!Utilities._initialized) {
    Utilities.init();
  }
} catch (error) {
  console.error('Auto-initialization failed:', error);
}
