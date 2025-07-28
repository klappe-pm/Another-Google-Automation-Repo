/**
 * FeatureFlags - Helper for feature toggling and experimentation
 */
(function(Core) {
  'use strict';

  class FeatureFlags {
    constructor() {
      if (FeatureFlags.instance) {
        return FeatureFlags.instance;
      }

      this.config = Core.ConfigurationManager.getInstance();
      this.logger = Core.Logger.getInstance();
      this.flags = this.loadFeatureFlags();
      
      FeatureFlags.instance = this;
    }

    /**
     * Load feature flags from configuration
     */
    loadFeatureFlags() {
      const defaultFlags = {
        // Core features
        'enhanced-logging': false,
        'debug-mode': false,
        'experimental-features': false,
        
        // Service features
        'gmail-advanced-parsing': false,
        'drive-bulk-operations': false,
        'calendar-smart-scheduling': false,
        'sheets-auto-formatting': false,
        
        // UI features
        'new-dashboard': false,
        'mobile-optimizations': false,
        
        // Performance features
        'batch-processing': true,
        'caching-enabled': true,
        'async-operations': false,
        
        // Security features
        'enhanced-security': true,
        'audit-logging': false
      };

      // Get flags from configuration
      const configFlags = this.config.get('features', {});
      const environmentFlags = this.getEnvironmentFlags();
      
      // Merge flags (environment > config > defaults)
      return Object.assign({}, defaultFlags, configFlags, environmentFlags);
    }

    /**
     * Get environment-specific feature flags
     */
    getEnvironmentFlags() {
      const environment = this.config.getEnvironment();
      
      const environmentFlags = {
        'development': {
          'debug-mode': true,
          'experimental-features': true,
          'enhanced-logging': true,
          'audit-logging': true
        },
        'staging': {
          'debug-mode': false,
          'experimental-features': true,
          'enhanced-logging': true,
          'audit-logging': true
        },
        'production': {
          'debug-mode': false,
          'experimental-features': false,
          'enhanced-logging': false,
          'audit-logging': true
        }
      };

      return environmentFlags[environment] || {};
    }

    /**
     * Check if a feature flag is enabled
     */
    isEnabled(flagName) {
      const isEnabled = this.flags[flagName] || false;
      
      this.logger.debug(`Feature flag check: ${flagName} = ${isEnabled}`);
      
      return isEnabled;
    }

    /**
     * Enable a feature flag at runtime
     */
    enable(flagName) {
      this.flags[flagName] = true;
      this.logger.info(`Feature flag enabled: ${flagName}`);
    }

    /**
     * Disable a feature flag at runtime
     */
    disable(flagName) {
      this.flags[flagName] = false;
      this.logger.info(`Feature flag disabled: ${flagName}`);
    }

    /**
     * Toggle a feature flag
     */
    toggle(flagName) {
      this.flags[flagName] = !this.flags[flagName];
      this.logger.info(`Feature flag toggled: ${flagName} = ${this.flags[flagName]}`);
      return this.flags[flagName];
    }

    /**
     * Set feature flag value
     */
    set(flagName, value) {
      const oldValue = this.flags[flagName];
      this.flags[flagName] = Boolean(value);
      
      if (oldValue !== this.flags[flagName]) {
        this.logger.info(`Feature flag changed: ${flagName} = ${this.flags[flagName]} (was: ${oldValue})`);
      }
    }

    /**
     * Get all feature flags
     */
    getAll() {
      return Object.assign({}, this.flags);
    }

    /**
     * Get enabled feature flags only
     */
    getEnabled() {
      const enabled = {};
      for (const [flag, value] of Object.entries(this.flags)) {
        if (value) {
          enabled[flag] = value;
        }
      }
      return enabled;
    }

    /**
     * Check multiple flags at once
     */
    areEnabled(flagNames) {
      const results = {};
      for (const flagName of flagNames) {
        results[flagName] = this.isEnabled(flagName);
      }
      return results;
    }

    /**
     * Conditional execution based on feature flag
     */
    ifEnabled(flagName, callback) {
      if (this.isEnabled(flagName)) {
        try {
          return callback();
        } catch (error) {
          this.logger.error(`Error in feature flag callback for ${flagName}`, { error: error.message });
          throw error;
        }
      }
      return null;
    }

    /**
     * Execute different callbacks based on feature flag state
     */
    branch(flagName, enabledCallback, disabledCallback) {
      if (this.isEnabled(flagName)) {
        return enabledCallback ? enabledCallback() : null;
      } else {
        return disabledCallback ? disabledCallback() : null;
      }
    }

    /**
     * A/B test helper - randomly enable feature for percentage of users
     */
    enableForPercentage(flagName, percentage) {
      if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
      }
      
      const random = Math.random() * 100;
      const enabled = random < percentage;
      
      this.set(flagName, enabled);
      this.logger.info(`A/B test: ${flagName} = ${enabled} (${percentage}% rollout)`);
      
      return enabled;
    }

    /**
     * Get feature flag status report
     */
    getStatusReport() {
      const all = this.getAll();
      const enabled = this.getEnabled();
      
      return {
        environment: this.config.getEnvironment(),
        totalFlags: Object.keys(all).length,
        enabledFlags: Object.keys(enabled).length,
        disabledFlags: Object.keys(all).length - Object.keys(enabled).length,
        flags: all,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * Reload feature flags from configuration
     */
    reload() {
      const oldFlags = Object.assign({}, this.flags);
      this.flags = this.loadFeatureFlags();
      
      // Log changes
      for (const [flag, newValue] of Object.entries(this.flags)) {
        if (oldFlags[flag] !== newValue) {
          this.logger.info(`Feature flag reloaded: ${flag} = ${newValue} (was: ${oldFlags[flag]})`);
        }
      }
      
      this.logger.info('Feature flags reloaded');
    }
  }

  FeatureFlags.getInstance = function() {
    return new FeatureFlags();
  };

  Core.FeatureFlags = FeatureFlags;

})(WorkspaceAutomation.Core);
