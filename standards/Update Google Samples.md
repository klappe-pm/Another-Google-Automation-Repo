
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  HEADER: {
    TITLE: 'Title: [Script Name]',
    SERVICE: 'Service: [Google Service Used]',
    PURPOSE: 'Purpose: [Brief description of the script\'s main functionality]',
    CREATED: 'Created: ' + new Date().toISOString().split('T')[0],
    UPDATED: 'Updated: ' + new Date().toISOString().split('T')[0],
    AUTHOR: 'Author: Kevin Lappe',
    CONTACT: 'Contact: kevin@averageintelligence.ai',
    LICENSE: 'License: MIT',
    USAGE: 'Usage: [Link to detailed usage guide]',
    TIMEOUT: 'Timeout Strategy: Batch processing with 100 items per batch',
    BATCH: 'Batch Processing: Standard batch size of 100 items',
    CACHE: 'Cache Strategy: Cache results for 1 hour',
    SECURITY: 'Security: Implements API key rotation and rate limiting',
    PERFORMANCE: 'Performance: Optimized for batch processing and caching'
  },
  
  FEATURES: [
    'Feature 1 description',
    'Feature 2 description',
    'Feature 3 description'
  ],
  
  REQUIREMENTS: [
    'Required permissions',
    'Required API access',
    'Required dependencies',
    'Required cache configuration',
    'Required security measures'
  ]
};

/**
 * Update a Google Apps Script file with our standards
 * 
 * @param {string} filePath - Path to the script file
 * @returns {Object} Update results
 */
function updateScript(filePath) {
  const results = {
    file: path.basename(filePath),
    changes: [],
    errors: []
  };

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add script header
    const header = `
/**
 * ${CONFIG.HEADER.TITLE}
 * ${CONFIG.HEADER.SERVICE}
 * ${CONFIG.HEADER.PURPOSE}
 * ${CONFIG.HEADER.CREATED}
 * ${CONFIG.HEADER.UPDATED}
 * ${CONFIG.HEADER.AUTHOR}
 * ${CONFIG.HEADER.CONTACT}
 * ${CONFIG.HEADER.LICENSE}
 * ${CONFIG.HEADER.USAGE}
 * ${CONFIG.HEADER.TIMEOUT}
 * ${CONFIG.HEADER.BATCH}
 * ${CONFIG.HEADER.CACHE}
 * ${CONFIG.HEADER.SECURITY}
 * ${CONFIG.HEADER.PERFORMANCE}
 * 
 * Features:
 * - ${CONFIG.FEATURES.join('\n * - ')}
 * 
 * Requirements:
 * - ${CONFIG.REQUIREMENTS.join('\n * - ')}
 */

`;

    // Add configuration section
    const configSection = `
// ========================================
// Configuration Settings
// ========================================

const CONFIG = {
  BATCH_SIZE: 100,
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600, // 1 hour
  SECURITY: {
    API_KEYS: {},
    RATE_LIMITS: {
      MAX_CALLS: 100,
      RESET_PERIOD: 60000 // 1 minute
    }
  }
};

`;

    // Add error handling utilities
    const errorUtils = `
// ========================================
// Error Handling
// ========================================

/**
 * Log error with comprehensive context
 * 
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(error, context = {}) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  };
  
  Logger.log(JSON.stringify(errorDetails, null, 2));
}

/**
 * Handle partial batch failure
 * 
 * @param {Error} error - Error object
 * @param {Array} batch - Batch items
 * @returns {Array} Partial results
 */
function handlePartialFailure(error, batch) {
  Logger.log('Handling partial failure:', error.message);
  return [];
}

`;

    // Add batch processing utilities
    const batchUtils = `
// ========================================
// Batch Processing
// ========================================

/**
 * Process items in batches
 * 
 * @param {Array} items - Items to process
 * @param {Function} processFunction - Function to process each item
 * @returns {Array} Results of processing
 */
function processInBatches(items, processFunction) {
  const batchSize = CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(items.length / batchSize);
  
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchResults = processBatch(batch, processFunction);
      results.push(...batchResults);
    } catch (error) {
      logError(error, { batch });
      const partialResults = handlePartialFailure(error, batch);
      if (partialResults) {
        results.push(...partialResults);
      }
    }
  }
  
  return results;
}

/**
 * Process a single batch
 * 
 * @param {Array} batch - Items in this batch
 * @param {Function} processFunction - Function to process each item
 * @returns {Array} Batch results
 */
function processBatch(batch, processFunction) {
  return batch.map(item => {
    try {
      return processFunction(item);
    } catch (error) {
      logError(error, { item });
      return null;
    }
  }).filter(result => result !== null);
}

`;

    // Add caching utilities
    const cacheUtils = `
// ========================================
// Cache Management
// ========================================

/**
 * Get cached data or fetch fresh data
 * 
 * @param {string} cacheKey - Unique key for cache entry
 * @param {Function} fetchFunction - Function to get fresh data
 * @returns {Object} Cached or fresh data
 */
function getCachedData(cacheKey, fetchFunction) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    Logger.log('Cache hit for:', cacheKey);
    return JSON.parse(cached);
  }
  
  const data = fetchFunction();
  cache.put(cacheKey, JSON.stringify(data), CONFIG.CACHE_DURATION);
  Logger.log('Cache miss for:', cacheKey);
  return data;
}

`;

    // Update content with new sections
    content = header + configSection + errorUtils + batchUtils + cacheUtils + content;

    // Write updated content
    fs.writeFileSync(filePath, content);
    
    results.changes.push('Added script header');
    results.changes.push('Added configuration section');
    results.changes.push('Added error handling utilities');
    results.changes.push('Added batch processing utilities');
    results.changes.push('Added caching utilities');

  } catch (error) {
    results.errors.push(`Error updating ${filePath}: ${error.message}`);
  }

  return results;
}

/**
 * Update all Google Apps Script samples
 * 
 * @param {string} samplesDir - Directory containing samples
 * @returns {Array} Update results for all files
 */
function updateSamples(samplesDir) {
  const results = [];
  
  function processDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.gs')) {
        const updateResult = updateScript(fullPath);
        results.push(updateResult);
      }
    });
  }
  
  processDirectory(samplesDir);
  return results;
}

/**
 * Generate update report
 * 
 * @param {Array} updateResults - Array of update results
 * @returns {string} Report as markdown
 */
function generateReport(updateResults) {
  let report = '# Google Apps Script Samples Update Report\n\n';
  
  // Summary statistics
  const totalFiles = updateResults.length;
  const filesWithError = updateResults.filter(r => r.errors.length > 0).length;
  
  report += `## Summary\n\n`;
  report += `Total files updated: ${totalFiles}\n`;
  report += `Files with errors: ${filesWithError}\n\n`;
  
  // Detailed results
  updateResults.forEach(result => {
    report += `## ${result.file}\n\n`;
    
    if (result.changes.length > 0) {
      report += '### Changes Made\n\n';
      result.changes.forEach(change => {
        report += `- ${change}\n`;
      });
      report += '\n';
    }
    
    if (result.errors.length > 0) {
      report += '### Errors\n\n';
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
  });
  
  return report;
}

// Main execution
if (require.main === module) {
  const samplesDir = process.argv[2];
  if (!samplesDir) {
    console.error('Please provide the path to the samples directory');
    process.exit(1);
  }

  const results = updateSamples(samplesDir);
  const report = generateReport(results);
  
  // Write report to file
  fs.writeFileSync('samples-update-report.md', report);
  console.log('Update complete. Report written to samples-update-report.md');
}

module.exports = {
  updateScript,
  updateSamples,
  generateReport
};
