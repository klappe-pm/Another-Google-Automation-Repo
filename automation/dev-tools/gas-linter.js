#!/usr/bin/env node

/**
 * Google Apps Script Linter
 * Validates GAS files against the style guide
 * 
 * Usage: 
 *   node gas-linter.js [file-path]          # Lint single file
 *   node gas-linter.js --all                # Lint all files
 *   node gas-linter.js --staged             # Lint staged files
 *   node gas-linter.js --fix [file-path]    # Auto-fix issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Severity levels
const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Service mapping
const VALID_SERVICES = [
  'Gmail', 'Google Drive', 'Google Sheets', 'Google Docs',
  'Google Calendar', 'Google Tasks', 'Google Photos', 'Google Chat',
  'Utility/Multiple Services', 'Google Apps Script'
];

class GASLinter {
  constructor(options = {}) {
    this.options = {
      fix: options.fix || false,
      verbose: options.verbose || false,
      ...options
    };
    this.results = [];
    this.fileCount = 0;
    this.errorCount = 0;
    this.warningCount = 0;
  }

  /**
   * Lint a single file
   */
  lintFile(filePath) {
    this.fileCount++;
    const fileResults = {
      file: filePath,
      errors: [],
      warnings: [],
      info: []
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Run all validations
      this.validateHeader(content, fileResults);
      this.validateSummary(content, fileResults);
      this.validateFunctions(content, fileResults);
      this.validateFormatting(content, fileResults);
      this.validateNaming(content, fileResults);
      this.validatePerformance(content, fileResults);
      
      // Count issues
      this.errorCount += fileResults.errors.length;
      this.warningCount += fileResults.warnings.length;
      
      this.results.push(fileResults);
      
      // Apply fixes if requested
      if (this.options.fix && (fileResults.errors.length > 0 || fileResults.warnings.length > 0)) {
        this.applyFixes(filePath, content, fileResults);
      }
      
    } catch (error) {
      fileResults.errors.push({
        line: 0,
        message: `Failed to read file: ${error.message}`,
        rule: 'file-read'
      });
      this.results.push(fileResults);
    }
  }

  /**
   * Validate script header
   */
  validateHeader(content, results) {
    const headerRegex = /\/\*\*[\s\S]*?\*\//;
    const headerMatch = content.match(headerRegex);
    
    if (!headerMatch) {
      this.addIssue(results, SEVERITY.ERROR, 1, 'Missing script header', 'header-required');
      return;
    }
    
    const header = headerMatch[0];
    const requiredFields = [
      { field: 'Title:', rule: 'header-title' },
      { field: 'Service:', rule: 'header-service' },
      { field: 'Purpose:', rule: 'header-purpose' },
      { field: 'Created:', rule: 'header-created' },
      { field: 'Updated:', rule: 'header-updated' },
      { field: 'Author:', rule: 'header-author' },
      { field: 'Contact:', rule: 'header-contact' },
      { field: 'License:', rule: 'header-license' }
    ];
    
    requiredFields.forEach(({ field, rule }) => {
      if (!header.includes(field)) {
        this.addIssue(results, SEVERITY.ERROR, 1, `Missing ${field} in header`, rule);
      }
    });
    
    // Validate service value
    const serviceMatch = header.match(/\* Service:\s*(.+)/);
    if (serviceMatch && !VALID_SERVICES.includes(serviceMatch[1].trim())) {
      this.addIssue(results, SEVERITY.WARNING, 1, 
        `Invalid service: "${serviceMatch[1].trim()}". Valid services: ${VALID_SERVICES.join(', ')}`, 
        'header-service-invalid'
      );
    }
    
    // Validate date format
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const createdMatch = header.match(/\* Created:\s*(.+)/);
    if (createdMatch && !dateRegex.test(createdMatch[1].trim())) {
      this.addIssue(results, SEVERITY.ERROR, 1, 'Created date must be in YYYY-MM-DD format', 'header-date-format');
    }
    
    const updatedMatch = header.match(/\* Updated:\s*(.+)/);
    if (updatedMatch && !dateRegex.test(updatedMatch[1].trim())) {
      this.addIssue(results, SEVERITY.ERROR, 1, 'Updated date must be in YYYY-MM-DD format', 'header-date-format');
    }
  }

  /**
   * Validate script summary
   */
  validateSummary(content, results) {
    const summaryRegex = /\/\*[\s\S]*?Script Summary:[\s\S]*?\*\//;
    const summaryMatch = content.match(summaryRegex);
    
    if (!summaryMatch) {
      this.addIssue(results, SEVERITY.ERROR, 1, 'Missing Script Summary section', 'summary-required');
      return;
    }
    
    const summary = summaryMatch[0];
    const requiredSections = [
      { section: '- Purpose:', rule: 'summary-purpose' },
      { section: '- Description:', rule: 'summary-description' },
      { section: '- Problem Solved:', rule: 'summary-problem' },
      { section: '- Successful Execution:', rule: 'summary-success' },
      { section: '- Key Features:', rule: 'summary-features' },
      { section: '- Services Used:', rule: 'summary-services' },
      { section: '- Setup:', rule: 'summary-setup' }
    ];
    
    requiredSections.forEach(({ section, rule }) => {
      if (!summary.includes(section)) {
        this.addIssue(results, SEVERITY.ERROR, 1, `Missing ${section} in summary`, rule);
      }
    });
    
    // Check for minimum features
    const featuresMatch = summary.match(/- Key Features:([\s\S]*?)- Services Used:/);
    if (featuresMatch) {
      const features = featuresMatch[1].match(/^\s*-\s*.+$/gm);
      if (!features || features.length < 3) {
        this.addIssue(results, SEVERITY.WARNING, 1, 'Should have at least 3 key features listed', 'summary-features-count');
      }
    }
    
    // Check for setup steps
    const setupMatch = summary.match(/- Setup:([\s\S]*?)\*\//);
    if (setupMatch) {
      const steps = setupMatch[1].match(/^\s*\d+\.\s*.+$/gm);
      if (!steps || steps.length < 3) {
        this.addIssue(results, SEVERITY.ERROR, 1, 'Setup must have at least 3 steps', 'summary-setup-steps');
      }
    }
  }

  /**
   * Validate function documentation
   */
  validateFunctions(content, results) {
    const functionRegex = /^(\s*)function\s+(\w+)\s*\([^)]*\)\s*{/gm;
    const lines = content.split('\n');
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[2];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      // Check if function has JSDoc comment
      if (lineNum > 1) {
        const prevLine = lines[lineNum - 2];
        if (!prevLine.includes('*/')) {
          this.addIssue(results, SEVERITY.ERROR, lineNum, 
            `Function '${funcName}' is missing documentation`, 'function-docs-required');
        }
      }
      
      // Check function naming
      if (!this.isCamelCase(funcName)) {
        this.addIssue(results, SEVERITY.WARNING, lineNum, 
          `Function '${funcName}' should use camelCase naming`, 'function-naming');
      }
    }
  }

  /**
   * Validate code formatting
   */
  validateFormatting(content, results) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for var usage
      if (/\bvar\s+\w+/.test(line)) {
        this.addIssue(results, SEVERITY.ERROR, lineNum, 
          'Use const or let instead of var', 'no-var');
      }
      
      // Check line length
      if (line.length > 100) {
        this.addIssue(results, SEVERITY.WARNING, lineNum, 
          `Line exceeds 100 characters (${line.length})`, 'max-line-length');
      }
      
      // Check for trailing whitespace
      if (/\s+$/.test(line)) {
        this.addIssue(results, SEVERITY.WARNING, lineNum, 
          'Trailing whitespace', 'no-trailing-spaces');
      }
      
      // Check spacing around operators
      if (/[=!<>+\-*/%](?!\s)/.test(line) && !line.includes('++') && !line.includes('--')) {
        this.addIssue(results, SEVERITY.INFO, lineNum, 
          'Missing space after operator', 'operator-spacing');
      }
      
      // Check indentation (should be multiples of 2 spaces)
      const leadingSpaces = line.match(/^( *)/)[1].length;
      if (leadingSpaces % 2 !== 0) {
        this.addIssue(results, SEVERITY.WARNING, lineNum, 
          'Indentation should be multiples of 2 spaces', 'indent');
      }
    });
  }

  /**
   * Validate naming conventions
   */
  validateNaming(content, results) {
    // Check constants
    const constRegex = /const\s+([A-Za-z_]\w*)\s*=/g;
    let match;
    
    while ((match = constRegex.exec(content)) !== null) {
      const constName = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      // Check if it looks like a config object or constant
      if (constName === constName.toUpperCase() || constName === 'CONFIG') {
        // Valid constant naming
        continue;
      }
      
      // Check camelCase for regular variables
      if (!this.isCamelCase(constName)) {
        this.addIssue(results, SEVERITY.INFO, lineNum, 
          `Variable '${constName}' should use camelCase or UPPER_CASE for constants`, 'variable-naming');
      }
    }
  }

  /**
   * Validate performance patterns
   */
  validatePerformance(content, results) {
    const lines = content.split('\n');
    
    // Check for API calls in loops
    const loopPatterns = [/for\s*\(/, /while\s*\(/, /\.forEach\(/];
    const apiPatterns = [
      /\.getRange\(/, /\.getValue\(/, /\.setValue\(/,
      /\.getValues\(/, /\.setValues\(/,
      /Gmail\./, /Drive\./, /Sheets\./
    ];
    
    let inLoop = false;
    let loopStart = 0;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check if entering a loop
      if (loopPatterns.some(pattern => pattern.test(line))) {
        inLoop = true;
        loopStart = lineNum;
      }
      
      // Check for API calls in loops
      if (inLoop) {
        apiPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            this.addIssue(results, SEVERITY.WARNING, lineNum, 
              `API call inside loop (started at line ${loopStart}). Consider batch operations`, 
              'performance-api-in-loop');
          }
        });
      }
      
      // Simple check for loop end (not perfect but reasonable)
      if (line.includes('}') && inLoop) {
        const openBraces = content.substring(0, index).split('{').length;
        const closeBraces = content.substring(0, index + 1).split('}').length;
        if (openBraces === closeBraces) {
          inLoop = false;
        }
      }
    });
  }

  /**
   * Check if string is camelCase
   */
  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * Add issue to results
   */
  addIssue(results, severity, line, message, rule) {
    const issue = { line, message, rule };
    
    switch (severity) {
      case SEVERITY.ERROR:
        results.errors.push(issue);
        break;
      case SEVERITY.WARNING:
        results.warnings.push(issue);
        break;
      case SEVERITY.INFO:
        results.info.push(issue);
        break;
    }
  }

  /**
   * Apply automatic fixes
   */
  applyFixes(filePath, content, results) {
    let fixed = content;
    
    // Fix var declarations
    if (results.errors.some(e => e.rule === 'no-var')) {
      fixed = fixed.replace(/\bvar\s+/g, 'let ');
    }
    
    // Fix trailing whitespace
    if (results.warnings.some(w => w.rule === 'no-trailing-spaces')) {
      fixed = fixed.replace(/ +$/gm, '');
    }
    
    // Fix operator spacing
    if (results.info.some(i => i.rule === 'operator-spacing')) {
      fixed = fixed.replace(/([=!<>+\-*/%])(?!\s)/g, '$1 ');
    }
    
    // Write fixed content
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ Fixed issues in ${path.basename(filePath)}`);
    }
  }

  /**
   * Lint all files in the project
   */
  lintAll() {
    const appsDir = path.join(process.cwd(), 'apps');
    this.findAndLintFiles(appsDir);
  }

  /**
   * Lint staged files
   */
  lintStaged() {
    try {
      const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.endsWith('.gs'));
      
      staged.forEach(file => {
        if (fs.existsSync(file)) {
          this.lintFile(file);
        }
      });
    } catch (error) {
      console.error('Failed to get staged files:', error.message);
    }
  }

  /**
   * Find and lint all .gs files
   */
  findAndLintFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        this.findAndLintFiles(fullPath);
      } else if (file.endsWith('.gs')) {
        this.lintFile(fullPath);
      }
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n📊 GAS Linter Report');
    console.log('===================\n');
    
    this.results.forEach(result => {
      if (result.errors.length === 0 && result.warnings.length === 0 && result.info.length === 0) {
        if (this.options.verbose) {
          console.log(`✅ ${path.relative(process.cwd(), result.file)}`);
        }
        return;
      }
      
      console.log(`\n📄 ${path.relative(process.cwd(), result.file)}`);
      
      // Show errors
      result.errors.forEach(error => {
        console.log(`  ❌ ${error.line}:0 error   ${error.message} (${error.rule})`);
      });
      
      // Show warnings
      result.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.line}:0 warning ${warning.message} (${warning.rule})`);
      });
      
      // Show info
      if (this.options.verbose) {
        result.info.forEach(info => {
          console.log(`  ℹ️  ${info.line}:0 info    ${info.message} (${info.rule})`);
        });
      }
    });
    
    // Summary
    console.log('\n📈 Summary');
    console.log(`Files linted: ${this.fileCount}`);
    console.log(`Errors: ${this.errorCount}`);
    console.log(`Warnings: ${this.warningCount}`);
    
    // Exit code
    if (this.errorCount > 0) {
      console.log('\n❌ Linting failed with errors');
      process.exit(1);
    } else if (this.warningCount > 0) {
      console.log('\n⚠️  Linting passed with warnings');
    } else {
      console.log('\n✅ All files passed linting!');
    }
  }
}

// Main execution
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  verbose: args.includes('--verbose') || args.includes('-v')
};

const linter = new GASLinter(options);

if (args.length === 0 || args.includes('--help')) {
  console.log('Usage: node gas-linter.js [options] [file-path]');
  console.log('\nOptions:');
  console.log('  --all        Lint all .gs files');
  console.log('  --staged     Lint staged files');
  console.log('  --fix        Auto-fix issues');
  console.log('  --verbose    Show all issues including info');
  console.log('\nExamples:');
  console.log('  node gas-linter.js apps/gmail/src/example.gs');
  console.log('  node gas-linter.js --all');
  console.log('  node gas-linter.js --staged --fix');
  process.exit(0);
}

if (args.includes('--all')) {
  linter.lintAll();
} else if (args.includes('--staged')) {
  linter.lintStaged();
} else {
  const filePath = args.find(arg => !arg.startsWith('--'));
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`File not found: ${resolvedPath}`);
      process.exit(1);
    }
    linter.lintFile(resolvedPath);
  }
}

linter.generateReport();