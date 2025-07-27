#!/usr/bin/env node

/**
 * README Linter
 * Validates README files for compliance with project standards
 */

const fs = require('fs');
const path = require('path');

class READMELinter {
  constructor(options = {}) {
    this.errors = [];
    this.warnings = [];
    this.fixMode = options.fix || false;
  }

  checkFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`\nChecking: ${fileName}`);
    
    let fixed = false;

    // Check for emojis
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiPattern);
    if (emojis) {
      this.errors.push({
        file: fileName,
        message: `Found ${emojis.length} emojis that must be removed`
      });
      
      if (this.fixMode) {
        content = content.replace(emojiPattern, '');
        fixed = true;
      }
    }

    // Check for AI tool references
    const aiReferences = /(claude|anthropic|ai[- ]generated|generated with|co-authored-by: claude)/gi;
    if (aiReferences.test(content)) {
      this.errors.push({
        file: fileName,
        message: 'Found AI tool references that must be removed'
      });
      
      if (this.fixMode) {
        content = content.replace(aiReferences, '');
        fixed = true;
      }
    }

    // Check for weasel words
    const weaselWords = /\b(simply|easily|just|basically|actually|really|very|quite|rather|somewhat)\b/gi;
    const matches = content.match(weaselWords);
    if (matches) {
      this.warnings.push({
        file: fileName,
        message: `Found ${matches.length} weasel words`
      });
    }

    // Check for proper structure
    if (!content.includes('# ')) {
      this.errors.push({
        file: fileName,
        message: 'Missing main heading'
      });
    }

    // Check for trailing whitespace
    const lines = content.split('\n');
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
      content = lines.join('\n');
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed issues in ${fileName}`);
    }

    return {
      errors: this.errors.filter(e => e.file === fileName),
      warnings: this.warnings.filter(w => w.file === fileName)
    };
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
    console.log('README Linter Summary');
    console.log('='.repeat(50));
    console.log(`Files checked: ${files.length}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);

    if (totalErrors > 0) {
      console.log('\nLinting failed with errors');
      this.errors.forEach(err => {
        console.log(`  ${err.file} - ${err.message}`);
      });
      return false;
    }

    if (totalWarnings > 0) {
      console.log('\nLinting completed with warnings');
    } else {
      console.log('\nAll files passed linting!');
    }

    return true;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');
  const files = args.filter(arg => !arg.startsWith('--')).map(f => f.replace(/^"|"$/g, ''));

  if (files.length === 0) {
    console.log('No README files to check');
    process.exit(0);
  }

  const linter = new READMELinter({ fix: fixMode });
  const success = linter.lintFiles(files);
  process.exit(success ? 0 : 1);
}

module.exports = READMELinter;