/**
 * MetricsCollector - Singleton for capturing application metrics
 */
(function(Core) {
  'use strict';

  var MetricsCollector = function() {
    if (MetricsCollector.instance) {
      return MetricsCollector.instance;
    }

    this.metrics = {};
    this.timings = {};
    this.enabled = true;
    MetricsCollector.instance = this;
  };

  MetricsCollector.prototype = {
    /**
     * Enable or disable metrics collection
     */
    setEnabled: function(enabled) {
      this.enabled = enabled;
    },

    /**
     * Increment a counter metric
     */
    increment: function(metricName, value) {
      if (!this.enabled) return;
      
      value = value || 1;
      if (!this.metrics[metricName]) {
        this.metrics[metricName] = 0;
      }
      this.metrics[metricName] += value;
      
      try {
        console.log('Metric incremented: ' + metricName + ' -> ' + this.metrics[metricName]);
      } catch (error) {
        // Fail silently if console is not available
      }
    },

    /**
     * Record a timing metric
     */
    timing: function(metricName, duration) {
      if (!this.enabled) return;
      
      if (!this.timings[metricName]) {
        this.timings[metricName] = [];
      }
      
      this.timings[metricName].push({
        duration: duration,
        timestamp: new Date()
      });
      
      // Keep only the last 100 timing entries per metric
      if (this.timings[metricName].length > 100) {
        this.timings[metricName] = this.timings[metricName].slice(-100);
      }
      
      try {
        console.log('Timing metric: ' + metricName + ' - Duration: ' + duration + 'ms');
      } catch (error) {
        // Fail silently if console is not available
      }
    },

    /**
     * Set a gauge metric (current value)
     */
    gauge: function(metricName, value) {
      if (!this.enabled) return;
      
      this.metrics[metricName + '_gauge'] = {
        value: value,
        timestamp: new Date()
      };
    },

    /**
     * Get a specific metric value
     */
    getMetric: function(metricName) {
      return this.metrics[metricName] || 0;
    },

    /**
     * Get all metrics
     */
    getAllMetrics: function() {
      return {
        counters: JSON.parse(JSON.stringify(this.metrics)),
        timings: JSON.parse(JSON.stringify(this.timings))
      };
    },

    /**
     * Get timing statistics for a metric
     */
    getTimingStats: function(metricName) {
      var timings = this.timings[metricName];
      if (!timings || timings.length === 0) {
        return null;
      }

      var durations = timings.map(function(t) { return t.duration; });
      var sum = durations.reduce(function(a, b) { return a + b; }, 0);
      var avg = sum / durations.length;
      var min = Math.min.apply(Math, durations);
      var max = Math.max.apply(Math, durations);

      return {
        count: durations.length,
        average: avg,
        min: min,
        max: max,
        total: sum
      };
    },

    /**
     * Reset all metrics
     */
    reset: function() {
      this.metrics = {};
      this.timings = {};
    },

    /**
     * Reset a specific metric
     */
    resetMetric: function(metricName) {
      delete this.metrics[metricName];
      delete this.timings[metricName];
    },

    /**
     * Get a summary report of all metrics
     */
    getSummary: function() {
      var summary = {
        timestamp: new Date().toISOString(),
        counters: Object.keys(this.metrics).length,
        timings: Object.keys(this.timings).length,
        enabled: this.enabled,
        topCounters: [],
        topTimings: []
      };

      // Get top 5 counters
      var sortedCounters = Object.entries(this.metrics)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 5);
      
      summary.topCounters = sortedCounters.map(function(entry) {
        return { name: entry[0], value: entry[1] };
      });

      // Get timing summaries
      var timingNames = Object.keys(this.timings).slice(0, 5);
      for (var i = 0; i < timingNames.length; i++) {
        var stats = this.getTimingStats(timingNames[i]);
        if (stats) {
          summary.topTimings.push({
            name: timingNames[i],
            stats: stats
          });
        }
      }

      return summary;
    }
  };

  MetricsCollector.getInstance = function() {
    return new MetricsCollector();
  };

  // Static instance reference
  MetricsCollector.instance = null;

  Core.MetricsCollector = MetricsCollector;

})(WorkspaceAutomation.Core);

