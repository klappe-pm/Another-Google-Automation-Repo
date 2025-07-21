
```javascript


const fs = require('fs');
const path = require('path');
const { JSDocParser } = require('jsdoc-to-markdown');

// Constants for validation rules
const RULES = {
  HEADER: {
    requiredFields: ['Title', 'Service', 'Purpose', 'Created', 'Updated', 'Author', 'Contact', 'License', 'Usage', 'Features', 'Requirements']
  },
  COMMENTS: {
    sectionHeaders: true,
    functionDocs: true,
    complexLogic: true,
    errorHandling: true,
    configuration: true
  },
  ERROR_HANDLING: {
    plainEnglish: true,
    debuggingSteps: true,
    comprehensiveLogging: true
  },
  BATCH_PROCESSING: {
    required: true,
    batchSize: 100,
    timeoutCheck: true
  }
};

class ScriptValidator {
  constructor() {
    this.jsdocParser = new JSDocParser();
    this.validationErrors = [];
    this.scriptMetrics = {};
  }

  // Validate script header
  validateHeader(content) {
    const headerMatch = content.match(/\/\*\*\s*\n(.*?)\*\//s);
    if (!headerMatch) {
      this.validationErrors.push('Missing script header');
      return false;
    }

    const header = headerMatch[1];
    const fields = header.split('\n * ');
    
    RULES.HEADER.requiredFields.forEach(field => {
      if (!fields.some(f => f.trim().startsWith(field))) {
        this.validationErrors.push(`Missing required header field: ${field}`);
      }
    });

    return true;
  }

  // Validate comments
  validateComments(content) {
    const hasSectionHeaders = content.includes('// ========================================');
    if (!hasSectionHeaders && RULES.COMMENTS.sectionHeaders) {
      this.validationErrors.push('Missing section headers');
    }

    // Check for JSDoc documentation
    const jsdocBlocks = content.match(/\/\*\*\s*\n(.*?)\*\//gs);
    if (!jsdocBlocks || jsdocBlocks.length === 0) {
      this.validationErrors.push('Missing JSDoc documentation');
    }

    // Check for complex logic comments
    const hasComplexLogic = content.includes('// ----------------------------------------------------------------------')
      && content.includes('Complex Logic');
    if (!hasComplexLogic && RULES.COMMENTS.complexLogic) {
      this.validationErrors.push('Missing complex logic documentation');
    }
  }

  // Validate error handling
  validateErrorHandling(content) {
    const errorPatterns = [
      /throw new Error\(['"](.*?)['"]\)/g,
      /Logger\.log\(['"]ERROR: (.*?)['"]\)/g
    ];

    errorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const errorMessage = match[1];
        if (!errorMessage.includes('Debugging steps:')) {
          this.validationErrors.push(`Error message lacks debugging steps: ${errorMessage}`);
        }
      }
    });
  }

  // Validate batch processing
  validateBatchProcessing(content) {
    const hasBatchProcessing = content.includes('processBatch')
      || content.includes('batchSize')
      || content.includes('processInBatches');

    if (!hasBatchProcessing && RULES.BATCH_PROCESSING.required) {
      this.validationErrors.push('Missing batch processing implementation');
    }

    const timeoutCheck = content.includes('checkTimeout')
      || content.includes('if (new Date() - startTime > timeout)');

    if (!timeoutCheck && RULES.BATCH_PROCESSING.timeoutCheck) {
      this.validationErrors.push('Missing timeout check in batch processing');
    }
  }

  // Validate logging
  validateLogging(content) {
    const debugCount = (content.match(/debug\(['"].*?['"]\)/g) || []).length;
    const errorCount = (content.match(/Logger\.log\(['"]ERROR:.*?['"]\)/g) || []).length;
    
    if (debugCount === 0) {
      this.validationErrors.push('Missing debug logging');
    }

    this.scriptMetrics = {
      debugCount,
      errorCount,
      totalLines: content.split('\n').length
    };
  }

  // Main validation function
  validateScript(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      this.validationErrors = [];
      
      this.validateHeader(content);
      this.validateComments(content);
      this.validateErrorHandling(content);
      this.validateBatchProcessing(content);
      this.validateLogging(content);

      return {
        valid: this.validationErrors.length === 0,
        errors: this.validationErrors,
        metrics: this.scriptMetrics
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        metrics: {}
      };
    }
  }

  // Validate all scripts in a directory
  static async validateDirectory(directoryPath) {
    const validator = new ScriptValidator();
    const results = [];
    
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isFile() && file.endsWith('.gs')) {
        results.push(validator.validateScript(filePath));
      }
    }

    return results;
  }
}

module.exports = ScriptValidator;

```