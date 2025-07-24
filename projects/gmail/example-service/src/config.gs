/**
 * Example Service Configuration
 * This configuration will be automatically loaded by the Config utility
 */

const EXAMPLE_SERVICE_CONFIG = {
  // Service information
  service: {
    name: 'Example Service',
    version: '1.0.0',
    description: 'Example service demonstrating utility package usage'
  },
  
  // API configuration
  api: {
    endpoint: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retries: 3
  },
  
  // Processing settings
  processing: {
    batchSize: 10,
    maxItems: 100,
    enableCache: true
  },
  
  // Output settings
  output: {
    format: 'json',
    folder: '', // Set to your Google Drive folder ID
    includeTimestamp: true
  },
  
  // Debug settings
  debug: {
    enabled: true,
    logLevel: 'INFO',
    logToSheet: false
  }
};
