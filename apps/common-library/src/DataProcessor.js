/**
 * Common Library - Data Processor Module
 * 
 * Purpose: Batch processing with timeout protection
 * Service: Shared Library
 * Created: 2025-08-06
 * 
 * This module provides:
 * - Batch processing for large datasets
 * - Timeout protection (Google's 6-minute limit)
 * - Progress tracking and checkpointing
 * - Parallel processing capabilities
 * - Rate limiting for API calls
 */

/**
 * Default configuration for batch processing
 */
const ProcessorConfig = {
  defaultBatchSize: 100,
  defaultMaxMinutes: 5,
  defaultSafetyBuffer: 30000,  // 30 seconds safety buffer
  maxExecutionTime: 360000,    // 6 minutes in milliseconds
  defaultRateLimit: 10,         // Requests per second
  enableCheckpointing: true
};

/**
 * Process large dataset with batch processing and timeout protection
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each batch
 * @param {Object} options - Processing options
 * @return {Object} Processing result with status
 */
function processBatches(items, processor, options = {}) {
  const config = {
    batchSize: options.batchSize || ProcessorConfig.defaultBatchSize,
    maxMinutes: options.maxMinutes || ProcessorConfig.defaultMaxMinutes,
    safetyBuffer: options.safetyBuffer || ProcessorConfig.defaultSafetyBuffer,
    onProgress: options.onProgress || null,
    continueFrom: options.continueFrom || 0,
    context: options.context || {}
  };
  
  const startTime = new Date().getTime();
  const maxTime = Math.min(config.maxMinutes * 60 * 1000, ProcessorConfig.maxExecutionTime);
  const results = [];
  const errors = [];
  let processedCount = config.continueFrom;
  
  // Log start
  logInfo('Starting batch processing', {
    totalItems: items.length,
    batchSize: config.batchSize,
    continueFrom: config.continueFrom,
    maxMinutes: config.maxMinutes
  });
  
  // Process items in batches
  for (let i = config.continueFrom; i < items.length; i += config.batchSize) {
    // Check timeout
    if (isTimeoutApproaching(startTime, maxTime, config.safetyBuffer)) {
      return createProcessingResult({
        complete: false,
        results: results,
        errors: errors,
        processedCount: processedCount,
        totalCount: items.length,
        lastIndex: i,
        reason: 'Timeout approaching',
        checkpoint: createCheckpoint(i, results, errors)
      });
    }
    
    // Get batch
    const batch = items.slice(i, Math.min(i + config.batchSize, items.length));
    const batchNumber = Math.floor(i / config.batchSize) + 1;
    
    try {
      // Process batch
      const batchResult = processor(batch, batchNumber, config.context);
      
      // Handle results
      if (Array.isArray(batchResult)) {
        results.push(...batchResult);
      } else if (batchResult !== undefined) {
        results.push(batchResult);
      }
      
      processedCount += batch.length;
      
      // Report progress
      if (config.onProgress) {
        config.onProgress({
          processed: processedCount,
          total: items.length,
          percentage: Math.round((processedCount / items.length) * 100),
          batchNumber: batchNumber
        });
      }
      
    } catch (error) {
      errors.push({
        batch: batchNumber,
        startIndex: i,
        error: error.toString(),
        items: batch.length
      });
      
      // Log error but continue
      logError(`Batch ${batchNumber} failed`, {
        error: error.toString(),
        startIndex: i,
        batchSize: batch.length
      });
      
      // Optionally stop on error
      if (options.stopOnError) {
        return createProcessingResult({
          complete: false,
          results: results,
          errors: errors,
          processedCount: processedCount,
          totalCount: items.length,
          lastIndex: i,
          reason: 'Error occurred',
          checkpoint: createCheckpoint(i, results, errors)
        });
      }
    }
  }
  
  // All items processed
  return createProcessingResult({
    complete: true,
    results: results,
    errors: errors,
    processedCount: processedCount,
    totalCount: items.length,
    lastIndex: items.length,
    reason: 'All items processed'
  });
}

/**
 * Process items with rate limiting
 * @param {Array} items - Items to process
 * @param {Function} processor - Async function to process each item
 * @param {Object} options - Processing options
 * @return {Object} Processing result
 */
function processWithRateLimit(items, processor, options = {}) {
  const rateLimit = options.rateLimit || ProcessorConfig.defaultRateLimit;
  const delayMs = 1000 / rateLimit;  // Delay between requests
  
  const startTime = new Date().getTime();
  const maxTime = (options.maxMinutes || ProcessorConfig.defaultMaxMinutes) * 60 * 1000;
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i++) {
    // Check timeout
    if (isTimeoutApproaching(startTime, maxTime)) {
      return createProcessingResult({
        complete: false,
        results: results,
        errors: errors,
        processedCount: i,
        totalCount: items.length,
        lastIndex: i,
        reason: 'Timeout approaching'
      });
    }
    
    try {
      const result = processor(items[i], i);
      results.push(result);
      
      // Rate limit delay
      if (i < items.length - 1) {
        Utilities.sleep(delayMs);
      }
    } catch (error) {
      errors.push({
        index: i,
        item: items[i],
        error: error.toString()
      });
    }
  }
  
  return createProcessingResult({
    complete: true,
    results: results,
    errors: errors,
    processedCount: items.length,
    totalCount: items.length,
    reason: 'All items processed'
  });
}

/**
 * Process items in parallel chunks
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process items
 * @param {number} parallelism - Number of parallel workers
 * @return {Object} Processing result
 */
function processInParallel(items, processor, parallelism = 5) {
  const chunks = [];
  const chunkSize = Math.ceil(items.length / parallelism);
  
  // Create chunks
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  
  // Process chunks (Note: Not true parallelism in Apps Script)
  const results = [];
  const errors = [];
  
  chunks.forEach((chunk, index) => {
    try {
      const chunkResult = processor(chunk, index);
      results.push(...(Array.isArray(chunkResult) ? chunkResult : [chunkResult]));
    } catch (error) {
      errors.push({
        chunk: index,
        error: error.toString()
      });
    }
  });
  
  return createProcessingResult({
    complete: true,
    results: results,
    errors: errors,
    processedCount: items.length,
    totalCount: items.length,
    reason: 'All chunks processed'
  });
}

/**
 * Check if timeout is approaching
 * @param {number} startTime - Processing start time
 * @param {number} maxTime - Maximum allowed time
 * @param {number} buffer - Safety buffer
 * @return {boolean} True if timeout approaching
 */
function isTimeoutApproaching(startTime, maxTime, buffer = ProcessorConfig.defaultSafetyBuffer) {
  const elapsed = new Date().getTime() - startTime;
  return elapsed >= (maxTime - buffer);
}

/**
 * Create standardized processing result
 * @param {Object} data - Result data
 * @return {Object} Standardized result
 */
function createProcessingResult(data) {
  const result = {
    complete: data.complete,
    success: data.complete && (!data.errors || data.errors.length === 0),
    processedCount: data.processedCount || 0,
    totalCount: data.totalCount || 0,
    percentage: Math.round((data.processedCount / data.totalCount) * 100) || 0,
    results: data.results || [],
    errors: data.errors || [],
    hasErrors: data.errors && data.errors.length > 0,
    timestamp: new Date().toISOString()
  };
  
  if (!data.complete) {
    result.incomplete = true;
    result.lastIndex = data.lastIndex || 0;
    result.remaining = data.totalCount - data.processedCount;
    result.reason = data.reason || 'Unknown';
    
    if (data.checkpoint) {
      result.checkpoint = data.checkpoint;
    }
  }
  
  return result;
}

/**
 * Create checkpoint for resuming processing
 * @param {number} lastIndex - Last processed index
 * @param {Array} results - Current results
 * @param {Array} errors - Current errors
 * @return {Object} Checkpoint data
 */
function createCheckpoint(lastIndex, results, errors) {
  const checkpoint = {
    lastIndex: lastIndex,
    resultCount: results.length,
    errorCount: errors.length,
    timestamp: new Date().toISOString(),
    id: generateCheckpointId()
  };
  
  // Store checkpoint if enabled
  if (ProcessorConfig.enableCheckpointing) {
    storeCheckpoint(checkpoint);
  }
  
  return checkpoint;
}

/**
 * Store checkpoint in Script Properties
 * @param {Object} checkpoint - Checkpoint data
 */
function storeCheckpoint(checkpoint) {
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('processing_checkpoint', JSON.stringify(checkpoint));
    props.setProperty('checkpoint_id', checkpoint.id);
  } catch (e) {
    logError('Failed to store checkpoint', { error: e.toString() });
  }
}

/**
 * Retrieve stored checkpoint
 * @return {Object|null} Checkpoint data or null
 */
function getCheckpoint() {
  try {
    const props = PropertiesService.getScriptProperties();
    const checkpointStr = props.getProperty('processing_checkpoint');
    return checkpointStr ? JSON.parse(checkpointStr) : null;
  } catch (e) {
    logError('Failed to retrieve checkpoint', { error: e.toString() });
    return null;
  }
}

/**
 * Clear stored checkpoint
 */
function clearCheckpoint() {
  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('processing_checkpoint');
    props.deleteProperty('checkpoint_id');
  } catch (e) {
    logError('Failed to clear checkpoint', { error: e.toString() });
  }
}

/**
 * Generate unique checkpoint ID
 * @return {string} Checkpoint ID
 */
function generateCheckpointId() {
  return 'CP_' + new Date().getTime().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Resume processing from checkpoint
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {Object} checkpoint - Checkpoint data
 * @param {Object} options - Processing options
 * @return {Object} Processing result
 */
function resumeFromCheckpoint(items, processor, checkpoint, options = {}) {
  logInfo('Resuming from checkpoint', {
    checkpointId: checkpoint.id,
    lastIndex: checkpoint.lastIndex,
    timestamp: checkpoint.timestamp
  });
  
  // Resume processing from last index
  return processBatches(items, processor, {
    ...options,
    continueFrom: checkpoint.lastIndex
  });
}

/**
 * Calculate optimal batch size based on processing time
 * @param {number} itemCount - Total number of items
 * @param {number} itemProcessingTime - Average time per item in ms
 * @param {number} maxMinutes - Maximum execution time
 * @return {number} Optimal batch size
 */
function calculateOptimalBatchSize(itemCount, itemProcessingTime, maxMinutes = 5) {
  const maxTime = maxMinutes * 60 * 1000;
  const safeTime = maxTime * 0.8;  // Use 80% of available time
  
  // Calculate how many items can be processed in safe time
  const maxItems = Math.floor(safeTime / itemProcessingTime);
  
  // Find a batch size that divides evenly if possible
  const idealBatch = Math.min(maxItems, itemCount);
  
  // Round to nearest 10 for cleaner batches
  return Math.max(10, Math.round(idealBatch / 10) * 10);
}

/**
 * Monitor processing performance
 * @param {Function} processor - Processing function
 * @return {Function} Wrapped processor with monitoring
 */
function withPerformanceMonitoring(processor) {
  return function(batch, batchNumber, context) {
    const startTime = new Date().getTime();
    
    try {
      const result = processor(batch, batchNumber, context);
      const duration = new Date().getTime() - startTime;
      
      logDebug('Batch processed', {
        batchNumber: batchNumber,
        itemCount: batch.length,
        duration: duration,
        avgPerItem: Math.round(duration / batch.length)
      });
      
      return result;
    } catch (error) {
      const duration = new Date().getTime() - startTime;
      
      logError('Batch processing failed', {
        batchNumber: batchNumber,
        itemCount: batch.length,
        duration: duration,
        error: error.toString()
      });
      
      throw error;
    }
  };
}