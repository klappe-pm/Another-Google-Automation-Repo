#!/usr/bin/env node

/**
 * Google Apps Script Linter
 * Validates GAS files for compliance with project standards
 */

const fs = require('fs');
const path = require('path');

class GASLinter {
  constructor(options = {}) {
    this.errors = [];
    this.warnings = [];
    this.fixMode = options.fix || false;
  }

  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    
    console.log(`\nChecking: ${fileName}`);
    
    let fixed = false;
    let fixedContent = content;

    // Check for proper header format
    if (!content.startsWith('/**')) {
      this.errors.push({
        file: fileName,
        line: 1,
        message: 'Missing proper JSDoc header (should start with /**)'
      });
      
      if (this.fixMode) {
        fixedContent = this.addHeader(fixedContent, fileName);
        fixed = true;
      }
    }

    // Check for malformed comment blocks
    const malformedPattern = /^\/\s+\*\s+\*/gm;
    if (malformedPattern.test(content)) {
      this.errors.push({
        file: fileName,
        line: 0,
        message: 'Malformed comment blocks found'
      });
      
      if (this.fixMode) {
        fixedContent = fixedContent.replace(malformedPattern, '/**');
        fixed = true;
      }
    }

    // Check indentation
    lines.forEach((line, index) => {
      if (line.length > 0 && !line.match(/^( {2})*[^ ]/)) {
        this.warnings.push({
          file: fileName,
          line: index + 1,
          message: 'Incorrect indentation (should be multiples of 2 spaces)'
        });
      }
    });

    // Check line length
    lines.forEach((line, index) => {
      if (line.length > 100) {
        this.warnings.push({
          file: fileName,
          line: index + 1,
          message: `Line exceeds 100 characters (${line.length})`
        });
      }
    });

    // Check for trailing whitespace
    lines.forEach((line, index) => {
      if (line.endsWith(' ') || line.endsWith('\t')) {
        this.warnings.push({
          file: fileName,
          line: index + 1,
          message: 'Trailing whitespace'
        });
        
        if (this.fixMode) {
          lines[index] = line.trimEnd();
          fixed = true;
        }
      }
    });

    // Save fixes if needed
    if (fixed && this.fixMode) {
      fixedContent = lines.join('\n');
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  ✅ Fixed issues in ${fileName}`);
    }

    return {
      errors: this.errors.filter(e => e.file === fileName),
      warnings: this.warnings.filter(w => w.file === fileName)
    };
  }

  addHeader(content, fileName) {
    const scriptName = fileName.replace('.gs', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const header = `/**
 * @fileoverview ${scriptName}
 * @description Google Apps Script for workspace automation
 * @version 1.0.0
 * @license MIT
 */

`;
    
    return header + content;
  }

  lintFiles(files) {
    let totalErrors = 0;
    let totalWarnings = 0;

    files.forEach(file => {
      const result = this.checkFile(file);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    });

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 GAS Linter Summary');
    console.log('='.repeat(50));
    console.log(`Files checked: ${files.length}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);

    if (totalErrors > 0) {
      console.log('\n❌ Linting failed with errors');
      this.errors.forEach(err => {
        console.log(`  ${err.file}:${err.line} - ${err.message}`);
      });
      return false;
    }

    if (totalWarnings > 0) {
      console.log('\n⚠️  Linting completed with warnings');
    } else {
      console.log('\n✅ All files passed linting!');
    }

    return true;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');
  const files = args.filter(arg => !arg.startsWith('--') && arg.endsWith('.gs'));

  if (files.length === 0) {
    console.log('Usage: lint-gas.js [--fix] <file1.gs> <file2.gs> ...');
    process.exit(1);
  }

  const linter = new GASLinter({ fix: fixMode });
  const success = linter.lintFiles(files);
  process.exit(success ? 0 : 1);
}

module.exports = GASLinter;