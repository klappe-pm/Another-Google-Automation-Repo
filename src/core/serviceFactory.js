/**
 * ServiceFactory - Factory for creating and managing service instances
 */
(function(Core) {
  'use strict';

  class ServiceFactory {
    constructor() {
      if (ServiceFactory.instance) {
        return ServiceFactory.instance;
      }

      this.services = new Map();
      this.serviceRegistry = new Map();
      this.logger = Core.Logger.getInstance();
      this.config = Core.ConfigurationManager.getInstance();
      
      // Register built-in service types
      this.registerBuiltInServices();
      
      ServiceFactory.instance = this;
    }

    /**
     * Register built-in service types
     */
    registerBuiltInServices() {
      // Register core services that extend BaseService
      this.registerService('base', Core.BaseService);
      
      // Additional services can be registered here as they're created
      // this.registerService('gmail', WorkspaceAutomation.Services.GmailService);
      // this.registerService('drive', WorkspaceAutomation.Services.DriveService);
    }

    /**
     * Register a service constructor with the factory
     */
    registerService(serviceName, serviceConstructor) {
      if (typeof serviceConstructor !== 'function') {
        throw new Error(`Service constructor for '${serviceName}' must be a function`);
      }
      
      this.serviceRegistry.set(serviceName, serviceConstructor);
      this.logger.info(`Service registered: ${serviceName}`);
    }

    /**
     * Create a service instance
     */
    createService(serviceName, options = {}) {
      const serviceKey = `${serviceName}_${JSON.stringify(options)}`;
      
      // Return existing instance if singleton pattern is enabled
      if (options.singleton !== false && this.services.has(serviceKey)) {
        return this.services.get(serviceKey);
      }

      const ServiceConstructor = this.serviceRegistry.get(serviceName);
      if (!ServiceConstructor) {
        throw new Error(`Service '${serviceName}' is not registered`);
      }

      try {
        // Check if service is enabled in configuration
        const serviceConfig = this.config.get(`services.${serviceName}`, { enabled: true });
        if (!serviceConfig.enabled) {
          throw new Error(`Service '${serviceName}' is disabled in configuration`);
        }

        // Merge service-specific config with provided options
        const mergedOptions = Object.assign({}, serviceConfig, options);
        
        const serviceInstance = new ServiceConstructor(serviceName, mergedOptions);
        
        // Store instance if singleton
        if (options.singleton !== false) {
          this.services.set(serviceKey, serviceInstance);
        }

        this.logger.info(`Service created: ${serviceName}`, { options: mergedOptions });
        return serviceInstance;
        
      } catch (error) {
        this.logger.error(`Failed to create service: ${serviceName}`, { error: error.message });
        throw error;
      }
    }

    /**
     * Get an existing service instance
     */
    getService(serviceName, options = {}) {
      const serviceKey = `${serviceName}_${JSON.stringify(options)}`;
      return this.services.get(serviceKey) || null;
    }

    /**
     * Check if a service is registered
     */
    isServiceRegistered(serviceName) {
      return this.serviceRegistry.has(serviceName);
    }

    /**
     * Get list of registered services
     */
    getRegisteredServices() {
      return Array.from(this.serviceRegistry.keys());
    }

    /**
     * Get list of active service instances
     */
    getActiveServices() {
      const activeServices = [];
      for (const [key, service] of this.services) {
        activeServices.push({
          key: key,
          name: service.name,
          status: service.getHealthStatus()
        });
      }
      return activeServices;
    }

    /**
     * Cleanup all service instances
     */
    cleanup() {
      this.logger.info('Cleaning up all services');
      
      for (const [key, service] of this.services) {
        try {
          if (typeof service.cleanup === 'function') {
            service.cleanup();
          }
        } catch (error) {
          this.logger.error(`Error cleaning up service: ${key}`, { error: error.message });
        }
      }
      
      this.services.clear();
    }

    /**
     * Get factory health status
     */
    getHealthStatus() {
      const activeServices = this.getActiveServices();
      const registeredServices = this.getRegisteredServices();
      
      return {
        registeredServices: registeredServices.length,
        activeServices: activeServices.length,
        services: activeServices,
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    }
  }

  ServiceFactory.getInstance = function() {
    return new ServiceFactory();
  };

  Core.ServiceFactory = ServiceFactory;

})(WorkspaceAutomation.Core);
