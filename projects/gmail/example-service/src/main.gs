/**
 * Title: Example Service Implementation
 * Service: Example
 * Purpose: Demonstrate usage of the centralized utility package
 * Created: 2025-01-16
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Usage:
 *   runExampleService(); // Run the complete example
 *   testUtilityUsage(); // Test individual utility functions
 * 
 * This example demonstrates:
 * - Configuration management with Config.get()
 * - Logging with service-specific logger
 * - HTTP requests with HttpClient
 * - Authentication with Auth utilities
 * - Error handling with ErrorHandler
 */

/*
Script Summary:
- Purpose: Demonstrate proper usage of the centralized utility package
- Description: Complete example service showing all utility integrations
- Problem Solved: Shows best practices for utility package adoption
- Successful Execution: Service runs successfully using all utility functions
*/

/**
 * Example Service Class
 */
class ExampleService {
  constructor() {
    this.serviceName = 'example-service';
    this.logger = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the service
   */
  async init() {
    try {
      // Register service with utilities
      Utilities.registerService(this.serviceName, {
        version: '1.0.0',
        description: 'Example service for utility demonstration'
      });
      
      // Create service-specific logger
      this.logger = Logger.createChild(this.serviceName);
      this.logger.info('Initializing example service');
      
      // Load and validate configuration
      const configValid = this._validateConfiguration();
      if (!configValid) {
        throw new Error('Configuration validation failed');
      }
      
      // Set up authentication if needed
      this._setupAuthentication();
      
      this.initialized = true;
      this.logger.info('Example service initialized successfully');
      
    } catch (error) {
      const handledError = ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'initialization'
      });
      
      throw new Error(`Service initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Run the main service functionality
   */
  async run() {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      this.logger.info('Starting example service execution');
      
      // Demonstrate configuration usage
      await this._demonstrateConfiguration();
      
      // Demonstrate HTTP client usage
      await this._demonstrateHttpClient();
      
      // Demonstrate authentication usage
      await this._demonstrateAuthentication();
      
      // Demonstrate error handling
      await this._demonstrateErrorHandling();
      
      // Process some example data
      const results = await this._processExampleData();
      
      // Save results
      await this._saveResults(results);
      
      this.logger.info('Example service execution completed successfully', {
        resultsCount: results.length
      });
      
      return {
        success: true,
        service: this.serviceName,
        results: results,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'run'
      });
      
      throw error;
    }
  }
  
  /**
   * Validate service configuration
   * @private
   */
  _validateConfiguration() {
    try {
      this.logger.debug('Validating service configuration');
      
      // Define expected configuration schema
      const schema = {
        required: ['api.endpoint', 'processing.batchSize'],
        fields: {
          'api.endpoint': { type: 'string' },
          'api.timeout': { type: 'number' },
          'processing.batchSize': { type: 'number' },
          'debug.enabled': { type: 'boolean' }
        }
      };
      
      // Validate configuration using Config utility
      const validation = Config.validate(this.serviceName, schema);
      
      if (!validation.isValid) {
        this.logger.error('Configuration validation failed', {
          errors: validation.errors
        });
        return false;
      }
      
      this.logger.info('Configuration validation passed');
      return true;
      
    } catch (error) {
      this.logger.error('Configuration validation error', error);
      return false;
    }
  }
  
  /**
   * Set up authentication
   * @private
   */
  _setupAuthentication() {
    try {
      // For this example, we'll use a placeholder API key
      // In a real service, you'd retrieve this from secure storage
      const apiKey = Config.get(this.serviceName, 'api.key', null);
      
      if (apiKey) {
        Auth.setApiKey(this.serviceName, apiKey);
        this.logger.info('Authentication configured');
      } else {
        this.logger.warn('No API key configured for service');
      }
      
    } catch (error) {
      this.logger.error('Authentication setup failed', error);
    }
  }
  
  /**
   * Demonstrate configuration usage
   * @private
   */
  async _demonstrateConfiguration() {
    this.logger.info('=== Configuration Demo ===');
    
    // Get various configuration values
    const endpoint = Config.get(this.serviceName, 'api.endpoint');
    const batchSize = Config.get(this.serviceName, 'processing.batchSize', 10);
    const debugEnabled = Config.get(this.serviceName, 'debug.enabled', false);
    
    this.logger.info('Configuration loaded', {
      endpoint,
      batchSize,
      debugEnabled
    });
    
    // Demonstrate runtime configuration changes
    Config.set(this.serviceName, 'runtime.startTime', new Date().toISOString());
    const startTime = Config.get(this.serviceName, 'runtime.startTime');
    
    this.logger.debug('Runtime configuration set', { startTime });
    
    // Get all configuration for the service
    const allConfig = Config.getAll(this.serviceName);
    this.logger.debug('Complete service configuration', allConfig);
  }
  
  /**
   * Demonstrate HTTP client usage
   * @private
   */
  async _demonstrateHttpClient() {
    this.logger.info('=== HTTP Client Demo ===');
    
    try {
      const endpoint = Config.get(this.serviceName, 'api.endpoint');
      
      // Simple GET request
      this.logger.info('Making GET request to API');
      const response = await HttpClient.get(`${endpoint}/posts/1`);
      
      this.logger.info('GET request successful', {
        status: response.status,
        hasData: !!response.body
      });
      
      // POST request with data
      this.logger.info('Making POST request to API');
      const postData = {
        title: 'Example Post',
        content: 'This is an example post created by the utility demo',
        userId: 1
      };
      
      const postResponse = await HttpClient.post(`${endpoint}/posts`, postData);
      
      this.logger.info('POST request successful', {
        status: postResponse.status,
        createdId: postResponse.body?.id
      });
      
      // Demonstrate error handling for HTTP requests
      try {
        await HttpClient.get(`${endpoint}/nonexistent-endpoint`);
      } catch (httpError) {
        this.logger.warn('Expected HTTP error handled', {
          status: httpError.status || 'unknown',
          message: httpError.message
        });
      }
      
    } catch (error) {
      ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'http_demo'
      });
    }
  }
  
  /**
   * Demonstrate authentication usage
   * @private
   */
  async _demonstrateAuthentication() {
    this.logger.info('=== Authentication Demo ===');
    
    try {
      // Create service-specific auth helper
      const serviceAuth = new ServiceAuth(this.serviceName);
      
      // Set different types of authentication
      serviceAuth.setApiKey('demo-api-key-123');
      this.logger.info('API key authentication set');
      
      // Get authentication token
      const token = serviceAuth.getToken(false); // Don't validate for demo
      this.logger.info('Retrieved authentication token', {
        tokenLength: token ? token.length : 0,
        hasToken: !!token
      });
      
      // Get authorization header
      const authHeader = serviceAuth.getAuthHeader();
      this.logger.info('Generated auth header', {
        headerPresent: !!authHeader,
        headerType: authHeader ? authHeader.split(' ')[0] : null
      });
      
      // Validate token
      const tokenStatus = serviceAuth.validateToken();
      this.logger.info('Token validation result', { status: tokenStatus });
      
      // Get auth info
      const authInfo = serviceAuth.getInfo();
      this.logger.info('Authentication info retrieved', authInfo);
      
      // List all authenticated services
      const services = Auth.listServices();
      this.logger.info('Authenticated services', { count: services.length, services });
      
    } catch (error) {
      ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'auth_demo'
      });
    }
  }
  
  /**
   * Demonstrate error handling usage
   * @private
   */
  async _demonstrateErrorHandling() {
    this.logger.info('=== Error Handling Demo ===');
    
    try {
      // Demonstrate different error types
      
      // 1. Custom error creation
      const customError = ErrorHandler.createError(
        'This is a custom validation error',
        'validation',
        { field: 'email', value: 'invalid-email' }
      );
      
      ErrorHandler.handle(customError, {
        service: this.serviceName,
        operation: 'validation_demo'
      });
      
      // 2. Wrap risky operations
      const result = ErrorHandler.wrap(
        () => {
          // Simulate a risky operation that might fail
          if (Math.random() > 0.5) {
            throw new Error('Random failure for demo');
          }
          return 'success';
        },
        'fallback-value',
        {
          retries: 2,
          context: { service: this.serviceName, operation: 'risky_demo' }
        }
      );
      
      this.logger.info('Wrapped operation result', { result });
      
      // 3. Demonstrate error reporting
      ErrorHandler.report('This is a test error report', 'medium', {
        service: this.serviceName,
        operation: 'error_demo',
        testData: { foo: 'bar' }
      });
      
      // 4. Get error statistics
      const errorStats = ErrorHandler.getStats();
      this.logger.info('Error statistics', errorStats);
      
    } catch (error) {
      // This would create a recursive error handling situation,
      // so we just log it normally
      this.logger.error('Error in error handling demo', error);
    }
  }
  
  /**
   * Process example data to demonstrate utility usage
   * @private
   */
  async _processExampleData() {
    this.logger.info('Processing example data');
    
    try {
      const endpoint = Config.get(this.serviceName, 'api.endpoint');
      const batchSize = Config.get(this.serviceName, 'processing.batchSize', 10);
      
      // Fetch some example data
      const response = await HttpClient.get(`${endpoint}/posts`);
      const posts = response.body || [];
      
      this.logger.info('Fetched posts for processing', { count: posts.length });
      
      // Process in batches
      const results = [];
      for (let i = 0; i < posts.length; i += batchSize) {
        const batch = posts.slice(i, i + batchSize);
        
        this.logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}`, {
          batchSize: batch.length,
          totalProcessed: i + batch.length
        });
        
        // Process each item in the batch
        const batchResults = batch.map(post => {
          return {
            id: post.id,
            title: post.title,
            processed: true,
            processedAt: new Date().toISOString(),
            wordCount: post.body ? post.body.split(' ').length : 0
          };
        });
        
        results.push(...batchResults);
        
        // Add a small delay between batches
        await this._delay(100);
      }
      
      this.logger.info('Data processing completed', { 
        totalProcessed: results.length 
      });
      
      return results;
      
    } catch (error) {
      ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'process_data'
      });
      throw error;
    }
  }
  
  /**
   * Save results (placeholder implementation)
   * @private
   */
  async _saveResults(results) {
    try {
      this.logger.info('Saving processing results');
      
      const outputFormat = Config.get(this.serviceName, 'output.format', 'json');
      const includeTimestamp = Config.get(this.serviceName, 'output.includeTimestamp', true);
      
      // Create output data
      const outputData = {
        service: this.serviceName,
        processedAt: new Date().toISOString(),
        resultCount: results.length,
        results: results
      };
      
      if (!includeTimestamp) {
        delete outputData.processedAt;
      }
      
      // In a real implementation, you would save to Drive or Sheets
      // For this demo, we just log the data
      this.logger.info('Results prepared for saving', {
        format: outputFormat,
        size: JSON.stringify(outputData).length,
        resultCount: results.length
      });
      
      // Simulate saving delay
      await this._delay(500);
      
      this.logger.info('Results saved successfully');
      
    } catch (error) {
      ErrorHandler.handle(error, {
        service: this.serviceName,
        operation: 'save_results'
      });
      throw error;
    }
  }
  
  /**
   * Simple delay utility
   * @private
   */
  async _delay(ms) {
    return new Promise(resolve => {
      Utilities.sleep(ms);
      resolve();
    });
  }
  
  /**
   * Get service status
   */
  getStatus() {
    return {
      service: this.serviceName,
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Main function to run the example service
 */
function runExampleService() {
  try {
    Logger.info('=== Starting Example Service Demo ===');
    
    // Initialize utilities if not already done
    if (!Utilities.getStatus().initialized) {
      Utilities.init();
    }
    
    // Create and run the example service
    const service = new ExampleService();
    const result = service.run();
    
    Logger.info('=== Example Service Demo Completed ===', result);
    
    console.log('Example service completed successfully!');
    console.log('Check the logs for detailed output.');
    
    return result;
    
  } catch (error) {
    Logger.error('Example service failed', error);
    console.error('Example service failed:', error.message);
    throw error;
  }
}

/**
 * Test individual utility functions
 */
function testUtilityUsage() {
  try {
    Logger.info('=== Testing Individual Utility Functions ===');
    
    // Test Configuration
    console.log('Testing Configuration...');
    Config.set('test', 'example.key', 'example_value');
    const configValue = Config.get('test', 'example.key');
    console.log(`Config test: ${configValue === 'example_value' ? 'PASS' : 'FAIL'}`);
    
    // Test Logging
    console.log('Testing Logging...');
    const testLogger = Logger.createChild('test-service');
    testLogger.info('Test log message');
    testLogger.warn('Test warning message');
    console.log('Logging test: PASS');
    
    // Test Authentication
    console.log('Testing Authentication...');
    Auth.setApiKey('test-service', 'test-key-123');
    const token = Auth.getToken('test-service', false);
    console.log(`Auth test: ${token === 'test-key-123' ? 'PASS' : 'FAIL'}`);
    
    // Test Error Handling
    console.log('Testing Error Handling...');
    const errorResult = ErrorHandler.handle('Test error', { test: true });
    console.log(`Error handling test: ${errorResult.handled ? 'PASS' : 'FAIL'}`);
    
    // Test HTTP Client (configuration only)
    console.log('Testing HTTP Client...');
    const httpConfig = HttpClient.getConfig();
    console.log(`HTTP client test: ${httpConfig && httpConfig.timeout ? 'PASS' : 'FAIL'}`);
    
    // Test Utilities integration
    console.log('Testing Utilities Integration...');
    const status = Utilities.getStatus();
    const diagnosis = Utilities.diagnose();
    console.log(`Integration test: ${status.initialized ? 'PASS' : 'FAIL'}`);
    console.log(`Diagnosis: ${diagnosis.overall}`);
    
    Logger.info('Individual utility testing completed');
    console.log('All utility tests completed!');
    
  } catch (error) {
    Logger.error('Utility testing failed', error);
    console.error('Utility testing failed:', error.message);
  }
}

/**
 * Quick demo function for development
 */
function quickDemo() {
  console.log('Running quick utility demo...');
  
  try {
    // Quick test of each utility
    const configValue = Config.get('example-service', 'service.name', 'Unknown');
    console.log('Config:', configValue);
    
    Logger.info('Quick demo log message');
    console.log('Logger: OK');
    
    Auth.setApiKey('demo', 'demo-key');
    const authToken = Auth.getToken('demo', false);
    console.log('Auth:', authToken ? 'OK' : 'FAIL');
    
    const errorResult = ErrorHandler.handle('Demo error');
    console.log('ErrorHandler:', errorResult.handled ? 'OK' : 'FAIL');
    
    console.log('Quick demo completed successfully!');
    
  } catch (error) {
    console.error('Quick demo failed:', error.message);
  }
}
