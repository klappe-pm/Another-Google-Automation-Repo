#!/usr/bin/env node

/**
 * GAS Formatting Fixer
 * Fixes formatting issues in Google Apps Script files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class GASFormattingFixer {
  constructor() {
    this.fixedCount = 0;
  }

  fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    let modified = false;

    // Fix trailing whitespace
    const fixedLines = lines.map(line => {
      const trimmed = line.trimEnd();
      if (trimmed !== line) {
        modified = true;
      }
      return trimmed;
    });

    // Fix indentation (ensure multiples of 2 spaces)
    for (let i = 0; i < fixedLines.length; i++) {
      const line = fixedLines[i];
      if (line.length > 0) {
        const leadingSpaces = line.match(/^( *)/)[1].length;
        if (leadingSpaces % 2 !== 0) {
          // Round to nearest even number
          const newSpaces = Math.round(leadingSpaces / 2) * 2;
          fixedLines[i] = ' '.repeat(newSpaces) + line.trim();
          modified = true;
        }
      }
    }

    // Fix multiple blank lines
    let previousBlank = false;
    const condensedLines = [];
    for (const line of fixedLines) {
      if (line.trim() === '') {
        if (!previousBlank) {
          condensedLines.push(line);
        }
        previousBlank = true;
      } else {
        condensedLines.push(line);
        previousBlank = false;
      }
    }

    if (condensedLines.length !== fixedLines.length) {
      modified = true;
    }

    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, condensedLines.join('\n'));
      this.fixedCount++;
      console.log(`Fixed: ${fileName}`);
    }

    return modified;
  }

  run() {
    console.log('Fixing GAS formatting...\n');

    const files = glob.sync('**/*.gs', {
      ignore: ['node_modules/**', '.git/**']
    });

    console.log(`Found ${files.length} .gs files\n`);

    files.forEach(file => {
      this.fixFile(file);
    });

    console.log(`\nFixed ${this.fixedCount} files`);
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new GASFormattingFixer();
  fixer.run();
}

module.exports = GASFormattingFixer;