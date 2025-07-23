/**
 * Standard Header Template for Google Apps Scripts
 * Use this template for all new scripts and updates
 */

/**
 * Title: [Descriptive Script Name]
 * Service: [Gmail|Calendar|Drive|Docs|Sheets|Tasks|Chat|Photos|Slides]
 * Purpose: [Brief description of the script's main functionality]
 * Created: YYYY-MM-DD
 * Updated: YYYY-MM-DD
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/[service]/[script-name].md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache results for 1 hour
 * Security: Implements API key rotation and rate limiting
 * Performance: Optimized for batch processing and caching
 */

/*
Script Summary:
- Purpose: [Detailed purpose and goals]
- Description: [What the script does and how it works]
- Problem Solved: [What problem this solves for users]
- Successful Execution: [What success looks like]
- Dependencies: [Required APIs and permissions]
- Key Features:
  1. [Feature 1]
  2. [Feature 2]
  3. [Feature 3]
*/

// ========================================
// Configuration Settings
// ========================================

const CONFIG = {
  BATCH_SIZE: 100,
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600, // 1 hour
  MAX_RETRIES: 3
};

// ========================================
// Error Handling Utilities
// ========================================

function logError(error, context = {}) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    scriptName: '[SCRIPT_NAME]'
  };
  
  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}

function handlePartialFailure(error, batch) {
  logError(error, { batch: batch.length });
  // Return partial results or empty array based on use case
  return [];
}

// ========================================
// Batch Processing Utilities
// ========================================

function processInBatches(items, processFunction) {
  const batchSize = CONFIG.BATCH_SIZE;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchResults = processBatch(batch, processFunction);
      results.push(...batchResults);
    } catch (error) {
      logError(error, { batchIndex: Math.floor(i / batchSize) });
      const partialResults = handlePartialFailure(error, batch);
      if (partialResults) {
        results.push(...partialResults);
      }
    }
  }
  
  return results;
}

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

// ========================================
// Cache Management
// ========================================

function getCachedData(cacheKey, fetchFunction) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      logError(error, { cacheKey });
    }
  }
  
  const data = fetchFunction();
  try {
    cache.put(cacheKey, JSON.stringify(data), CONFIG.CACHE_DURATION);
  } catch (error) {
    logError(error, { cacheKey, operation: 'cache_put' });
  }
  
  return data;
}

// ========================================
// Main Script Functions
// ========================================

// [Your main script functions go here]
