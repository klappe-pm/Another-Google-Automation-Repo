/**
 * ConfigurationManager - Environment-aware configuration loader
 * Supports loading JSON/YAML configs from config/environments directory
 */
(function(Core) {
  'use strict';

  var ConfigurationManager = function() {
    if (ConfigurationManager.instance) {
      return ConfigurationManager.instance;
    }

    this.configs = {};
    this.environment = this.detectEnvironment();
    this.loadConfigurations();
    
    ConfigurationManager.instance = this;
  };

  ConfigurationManager.prototype = {
    /**
     * Detect current environment
     */
    detectEnvironment: function() {
      // In Google Apps Script, we can use PropertiesService or default to 'production'
      try {
        var env = PropertiesService.getScriptProperties().getProperty('ENVIRONMENT');
        return env || 'production';
      } catch (error) {
        // Fallback for non-GAS environments
        return 'development';
      }
    },

    /**
     * Load configurations from environment-specific files
     */
    loadConfigurations: function() {
      try {
        // Load default configuration
        this.loadConfig('default');
        
        // Load environment-specific configuration
        if (this.environment !== 'default') {
          this.loadConfig(this.environment);
        }
        
        console.log('Configuration loaded for environment: ' + this.environment);
      } catch (error) {
        console.error('Failed to load configurations:', error);
        // Load minimal fallback configuration
        this.configs = this.getFallbackConfig();
      }
    },

    /**
     * Load a specific configuration file
     */
    loadConfig: function(configName) {
      // In a real implementation, this would read from DriveApp or use clasp to bundle configs
      // For now, we'll use inline configurations
      var configData = this.getInlineConfig(configName);
      
      if (configData) {
        // Merge configurations (environment configs override defaults)
        this.configs = this.mergeConfigs(this.configs, configData);
      }
    },

    /**
     * Get inline configuration data
     * In production, this would read from actual config files
     */
    getInlineConfig: function(configName) {
      var configs = {
        'default': {
          app: {
            name: 'Workspace Automation',
            version: '2.0.0',
            timeout: 30000
          },
          logging: {
            level: 'info',
            maxLogs: 1000
          },
          services: {
            gmail: { enabled: true },
            drive: { enabled: true },
            calendar: { enabled: true },
            sheets: { enabled: true }
          },
          features: {
            experimental: false,
            debugMode: false
          }
        },
        'development': {
          logging: {
            level: 'debug'
          },
          features: {
            experimental: true,
            debugMode: true
          }
        },
        'production': {
          logging: {
            level: 'error'
          },
          features: {
            experimental: false,
            debugMode: false
          }
        }
      };

      return configs[configName];
    },

    /**
     * Merge two configuration objects
     */
    mergeConfigs: function(target, source) {
      var result = JSON.parse(JSON.stringify(target)); // Deep clone
      
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            result[key] = this.mergeConfigs(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
      }
      
      return result;
    },

    /**
     * Get fallback configuration when loading fails
     */
    getFallbackConfig: function() {
      return {
        app: {
          name: 'Workspace Automation',
          version: '2.0.0'
        },
        logging: {
          level: 'info'
        }
      };
    },

    /**
     * Get configuration value by key path
     */
    get: function(keyPath, defaultValue) {
      defaultValue = defaultValue || null;
      var keys = keyPath.split('.');
      var current = this.configs;
      
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (current && current.hasOwnProperty(key)) {
          current = current[key];
        } else {
          return defaultValue;
        }
      }
      
      return current;
    },

    /**
     * Set configuration value by key path
     */
    set: function(keyPath, value) {
      var keys = keyPath.split('.');
      var current = this.configs;
      
      for (var i = 0; i < keys.length - 1; i++) {
        var key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
    },

    /**
     * Get current environment
     */
    getEnvironment: function() {
      return this.environment;
    },

    /**
     * Get all configurations
     */
    getAll: function() {
      return JSON.parse(JSON.stringify(this.configs)); // Return deep clone
    }
  };

  ConfigurationManager.getInstance = function() {
    return new ConfigurationManager();
  };

  // Static instance reference
  ConfigurationManager.instance = null;

  Core.ConfigurationManager = ConfigurationManager;

})(WorkspaceAutomation.Core);
