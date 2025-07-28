const fs = require('fs');
const path = require('path');

/**
 * Auto-fix script for Google Apps Script syntax errors
 * Performs surgical, line-specific replacements using regex patterns
 */

// Define target files - get all .gs files
const targetFiles = [
  'apps/calendar/src/assist-calendar-events.gs',
  'apps/gmail/src/mark-all-read.gs', 
  'apps/drive/src/markdown-generate-yaml-categories.gs',
  'apps/utility/src/update-obsidian-vault-config.gs',
  // Add more specific files as needed
];

// Define patterns for specific syntax fixes
const fixPatterns = [
  {
    name: 'Malformed comment endings in assist-calendar-events.gs',
    regex: /\/\*\s*\*\s*$/,
    replacement: '/* */',
    targetFiles: ['apps/calendar/src/assist-calendar-events.gs']
  },
  {
    name: 'Fix i++ and j++ spacing',
    regex: /(\b[ij])\s+\+\s+\+\s*\)/g,
    replacement: '$1++)'
  },
  {
    name: 'Fix arrow function syntax (line =>)',
    regex: /(\w+)\s+=\s*>/g,
    replacement: '$1 =>'
  },
  {
    name: 'Fix strict equality operator',
    regex: /=\s*=\s*=/g,
    replacement: '==='
  },
  {
    name: 'Fix strict inequality operator', 
    regex: /!\s*=\s*=/g,
    replacement: '!=='
  },
  {
    name: 'Convert leading dashes to comments',
    regex: /^\s*-\s*-\s*/,
    replacement: '// '
  },
  {
    name: 'Fix method chaining with proper indentation',
    regex: /^\s*\.(\w+)/,
    replacement: '    .$1'
  }
];

/**
 * Validate JavaScript syntax using vm.Script
 * @param {string} content - Content to validate
 * @returns {boolean} - True if syntax is valid
 */
function validateSyntax(content) {
  const vm = require('vm');
  
  try {
    // Create a new script to check for syntax errors
    new vm.Script(content);
    return true;
  } catch (error) {
    console.error(`Syntax error detected: ${error.message}`);
    return false;
  }
}

/**
 * Log changes made to a file
 * @param {string} filePath - Path to the file
 * @param {Array} changes - Array of change objects
 */
function logChanges(filePath, changes) {
  console.log(`\n📝 Changes made to ${filePath}:`);
  changes.forEach(change => {
    console.log(`  Line ${change.line}: ${change.pattern}`);
    console.log(`    Before: ${change.original.trim()}`);
    console.log(`    After:  ${change.fixed.trim()}`);
  });
  console.log(`  Total changes: ${changes.length}`);
}

/**
 * Process a single file with all fix patterns
 * @param {string} filePath - Path to the file to process
 */
function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    console.log(`\n🔍 Processing: ${filePath}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const originalLines = fileContent.split('\n');
    let modifiedLines = [...originalLines];
    const changes = [];
    
    // Apply each pattern
    fixPatterns.forEach(pattern => {
      modifiedLines.forEach((line, index) => {
        const originalLine = line;
        const modifiedLine = line.replace(pattern.regex, pattern.replacement);
        
        if (modifiedLine !== originalLine) {
          changes.push({
            line: index + 1,
            pattern: pattern.name,
            original: originalLine,
            fixed: modifiedLine
          });
          modifiedLines[index] = modifiedLine;
        }
      });
    });

    // Write the file if changes were made
    if (changes.length > 0) {
      const fixedContent = modifiedLines.join('\n');
      if (validateSyntax(fixedContent)) {
        // Preserve original encoding
        fs.writeFileSync(filePath, fixedContent, 'utf-8');
        logChanges(filePath, changes);
        console.log(`✅ Successfully updated ${filePath}`);
      } else {
        console.error(`❌ Syntax validation failed for ${filePath}. Changes not applied.`);
      }
    } else {
      console.log(`✨ No changes needed for ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting Google Apps Script syntax auto-fix...');
  console.log(`📁 Processing ${targetFiles.length} target files...`);
  
  let totalFilesProcessed = 0;
  let totalChanges = 0;
  
  targetFiles.forEach(filePath => {
    const changes = processFile(filePath);
    totalFilesProcessed++;
  });
  
  console.log('\n🎉 Auto-fix completed!');
  console.log(`📊 Files processed: ${totalFilesProcessed}`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, fixPatterns };
