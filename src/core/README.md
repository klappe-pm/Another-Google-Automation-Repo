# Core Infrastructure - Phase 2 Implementation

This directory contains the core infrastructure components for the Workspace Automation system. All components are implemented using ES5 function constructors for optimal Google Apps Script compatibility.

## Components Implemented

### 1. BaseService (`index.js`)
Abstract base class that provides common functionality for all services:
- **Logging**: Integrated logger for consistent logging across services
- **Metrics**: Automatic metrics collection for operations and errors
- **Configuration**: Access to environment-aware configuration
- **Error Handling**: Consistent error handling and reporting
- **Health Monitoring**: Health status reporting for monitoring
- **Lifecycle Management**: Initialize and cleanup methods

**Usage:**
```javascript
// Extend BaseService for your custom services
var MyService = function(name, options) {
  WorkspaceAutomation.Core.BaseService.call(this, name, options);
};

MyService.prototype = Object.create(WorkspaceAutomation.Core.BaseService.prototype);
MyService.prototype.constructor = MyService;

MyService.prototype.performOperation = function(operation, params) {
  // Implement your service-specific operations
};
```

### 2. Logger (`logger.js`)
Centralized logging system with level-based filtering:
- **Log Levels**: debug, info, warn, error
- **Memory Management**: Automatic log rotation (keeps last 1000 entries)
- **Console Integration**: Outputs to appropriate console methods
- **Singleton Pattern**: Single instance across the application

**Usage:**
```javascript
var logger = WorkspaceAutomation.Core.Logger.getInstance();
logger.info('Service started', { service: 'MyService' });
logger.error('Operation failed', { error: errorDetails });
logger.debug('Debug information', { data: debugData });
```

### 3. MetricsCollector (`metricsCollector.js`)
Performance and usage metrics collection:
- **Counters**: Increment-based metrics for events
- **Timings**: Duration tracking for operations
- **Gauges**: Point-in-time value metrics
- **Statistics**: Automatic calculation of timing statistics
- **Memory Management**: Automatic cleanup of old timing data

**Usage:**
```javascript
var metrics = WorkspaceAutomation.Core.MetricsCollector.getInstance();
metrics.increment('email.processed');
metrics.timing('operation.duration', 1250);
metrics.gauge('memory.usage', 0.75);
```

### 4. ConfigurationManager (`configurationManager.js`)
Environment-aware configuration management:
- **Environment Detection**: Automatically detects current environment
- **Hierarchical Config**: Merges default and environment-specific configurations
- **Key Path Access**: Dot-notation access to nested configuration values
- **Fallback Support**: Graceful fallback when configuration loading fails
- **Runtime Updates**: Ability to update configuration at runtime

**Usage:**
```javascript
var config = WorkspaceAutomation.Core.ConfigurationManager.getInstance();
var timeout = config.get('services.gmail.timeout', 15000);
var environment = config.getEnvironment();
config.set('features.newFeature', true);
```

### 5. FeatureFlags (`featureFlags.js`)
Feature toggle system for controlled feature rollouts:
- **Environment-Based**: Different flags per environment
- **Runtime Control**: Enable/disable features at runtime
- **A/B Testing**: Percentage-based feature rollouts
- **Conditional Execution**: Helper methods for feature-gated code
- **Reporting**: Status reports of all feature flags

**Usage:**
```javascript
var flags = WorkspaceAutomation.Core.FeatureFlags.getInstance();

// Check if feature is enabled
if (flags.isEnabled('new-dashboard')) {
  // Execute new dashboard code
}

// Conditional execution
flags.ifEnabled('experimental-features', function() {
  // Execute experimental code
});

// A/B testing
flags.enableForPercentage('beta-feature', 25); // 25% rollout
```

### 6. ServiceFactory (`serviceFactory.js`)
Factory pattern for service creation and management:
- **Service Registration**: Register service constructors
- **Instance Management**: Singleton and multi-instance support
- **Configuration Integration**: Automatic configuration injection
- **Lifecycle Management**: Cleanup and health monitoring
- **Dependency Management**: Service dependency resolution

**Usage:**
```javascript
var factory = WorkspaceAutomation.Core.ServiceFactory.getInstance();

// Register a service
factory.registerService('myService', MyServiceConstructor);

// Create service instance
var service = factory.createService('myService', { timeout: 30000 });

// Get existing service
var existingService = factory.getService('myService');
```

## Environment Configuration

The system supports environment-specific configurations located in `config/environments/`:

- **`default.json`**: Base configuration for all environments
- **`development.json`**: Development-specific overrides
- **`production.json`**: Production-specific overrides  
- **`staging.json`**: Staging-specific overrides

### Configuration Structure
```json
{
  "app": {
    "name": "Workspace Automation",
    "version": "2.0.0",
    "timeout": 30000
  },
  "logging": {
    "level": "info",
    "maxLogs": 1000
  },
  "services": {
    "gmail": { "enabled": true, "timeout": 15000 },
    "drive": { "enabled": true, "timeout": 20000 }
  },
  "features": {
    "experimental": false,
    "debugMode": false
  }
}
```

## File Loading Order

For Google Apps Script deployment, ensure files are loaded in this order:

1. `logger.js`
2. `metricsCollector.js`
3. `configurationManager.js`
4. `featureFlags.js`
5. `serviceFactory.js`
6. `index.js` (BaseService)

## Usage Examples

### Complete Service Implementation
```javascript
// 1. Define your service
var EmailService = function(name, options) {
  WorkspaceAutomation.Core.BaseService.call(this, name, options);
};

EmailService.prototype = Object.create(WorkspaceAutomation.Core.BaseService.prototype);
EmailService.prototype.constructor = EmailService;

EmailService.prototype.performOperation = function(operation, params) {
  switch(operation) {
    case 'send':
      return this.sendEmail(params);
    case 'fetch':
      return this.fetchEmails(params);
    default:
      throw new Error('Unknown operation: ' + operation);
  }
};

EmailService.prototype.sendEmail = function(params) {
  // Implementation here
  this.logger.info('Email sent', params);
  this.metrics.increment('email.sent');
  return { success: true };
};

// 2. Register the service
var factory = WorkspaceAutomation.Core.ServiceFactory.getInstance();
factory.registerService('email', EmailService);

// 3. Use the service
var emailService = factory.createService('email');
var result = emailService.execute('send', { to: 'user@example.com' });
```

### Feature-Gated Functionality
```javascript
var flags = WorkspaceAutomation.Core.FeatureFlags.getInstance();

// Simple feature check
if (flags.isEnabled('new-email-parser')) {
  // Use new parser
  result = newEmailParser.parse(email);
} else {
  // Use legacy parser
  result = legacyEmailParser.parse(email);
}

// Branching execution
flags.branch('advanced-features',
  function() { return advancedProcessor.process(data); },
  function() { return basicProcessor.process(data); }
);
```

## Health Monitoring

All components provide health status information:

```javascript
// Get service health
var service = factory.getService('email');
var health = service.getHealthStatus();

// Get factory health
var factoryHealth = factory.getHealthStatus();

// Get metrics summary
var metrics = WorkspaceAutomation.Core.MetricsCollector.getInstance();
var summary = metrics.getSummary();

// Get feature flags status
var flags = WorkspaceAutomation.Core.FeatureFlags.getInstance();
var flagStatus = flags.getStatusReport();
```

## Error Handling

The system provides consistent error handling:

```javascript
try {
  var result = service.execute('operation', params);
} catch (error) {
  // Error is automatically logged and metrics are updated
  // Handle the error appropriately
  console.error('Service operation failed:', error.message);
}
```

This core infrastructure provides a solid foundation for building scalable, maintainable Google Apps Script applications with proper logging, metrics, configuration management, and feature controls.
