const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  REQUIRED_HEADERS: [
    'Title',
    'Service',
    'Purpose',
    'Created',
    'Updated',
    'Author',
    'Contact',
    'License',
    'Usage',
    'Timeout Strategy',
    'Batch Processing',
    'Cache Strategy',
    'Security',
    'Performance'
  ],
  
  REQUIRED_SECTIONS: [
    'Features',
    'Requirements'
  ],
  
  REQUIRED_UTILITIES: [
    'CONFIG',
    'logError',
    'handlePartialFailure',
    'processInBatches',
    'processBatch',
    'getCachedData'
  ]
};

/**
 * Validate a Google Apps Script file update
 * 
 * @param {string} filePath - Path to the script file
 * @returns {Object} Validation results
 */
function validateUpdate(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const results = {
    file: path.basename(filePath),
    errors: [],
    warnings: []
  };

  // Check headers
  CONFIG.REQUIRED_HEADERS.forEach(header => {
    if (!content.includes(`* ${header}:`)) {
      results.errors.push(`Missing required header: ${header}`);
    }
  });

  // Check sections
  CONFIG.REQUIRED_SECTIONS.forEach(section => {
    if (!content.includes(`* ${section}:`)) {
      results.errors.push(`Missing required section: ${section}`);
    }
  });

  // Check utilities
  CONFIG.REQUIRED_UTILITIES.forEach(utility => {
    if (!content.includes(utility)) {
      results.errors.push(`Missing required utility: ${utility}`);
    }
  });

  // Check configuration section
  if (!content.includes('const CONFIG = {')) {
    results.errors.push('Missing configuration section');
  }

  // Check for proper error handling
  if (!content.includes('try {') || !content.includes('catch (error)')) {
    results.warnings.push('Missing proper error handling blocks');
  }

  // Check for batch processing implementation
  if (!content.includes('processInBatches')) {
    results.warnings.push('Missing batch processing implementation');
  }

  // Check for caching implementation
  if (!content.includes('CacheService')) {
    results.warnings.push('Missing caching implementation');
  }

  return results;
}

/**
 * Validate all updated Google Apps Script samples
 * 
 * @param {string} samplesDir - Directory containing samples
 * @returns {Array} Validation results for all files
 */
function validateUpdates(samplesDir) {
  const results = [];
  
  function processDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.gs')) {
        const validation = validateUpdate(fullPath);
        results.push(validation);
      }
    });
  }
  
  processDirectory(samplesDir);
  return results;
}

/**
 * Generate validation report
 * 
 * @param {Array} validationResults - Array of validation results
 * @returns {string} Report as markdown
 */
function generateReport(validationResults) {
  let report = '# Google Apps Script Samples Validation Report\n\n';
  
  // Summary statistics
  const totalFiles = validationResults.length;
  const filesWithErrors = validationResults.filter(r => r.errors.length > 0).length;
  const filesWithWarnings = validationResults.filter(r => r.warnings.length > 0).length;
  
  report += `## Summary\n\n`;
  report += `Total files: ${totalFiles}\n`;
  report += `Files with errors: ${filesWithErrors}\n`;
  report += `Files with warnings: ${filesWithWarnings}\n\n`;
  
  // Detailed results
  validationResults.forEach(result => {
    report += `## ${result.file}\n\n`;
    
    if (result.errors.length > 0) {
      report += '### Errors\n\n';
      result.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    if (result.warnings.length > 0) {
      report += '### Warnings\n\n';
      result.warnings.forEach(warning => {
        report += `- ${warning}\n`;
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

  const results = validateUpdates(samplesDir);
  const report = generateReport(results);
  
  // Write report to file
  fs.writeFileSync('samples-validation-report-final.md', report);
  console.log('Validation complete. Report written to samples-validation-report-final.md');
}

module.exports = {
  validateUpdate,
  validateUpdates,
  generateReport
};
