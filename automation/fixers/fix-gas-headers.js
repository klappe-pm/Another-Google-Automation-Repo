#!/usr/bin/env node

/**
 * GAS Header Fixer
 * Fixes headers and comment blocks in Google Apps Script files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class GASHeaderFixer {
  constructor() {
    this.fixedCount = 0;
  }

  fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let modified = false;

    // Fix malformed comment blocks
    const malformedPattern = /^\/\s+\*\s+\*/gm;
    if (malformedPattern.test(content)) {
      content = content.replace(malformedPattern, '/**');
      modified = true;
    }

    // Add header if missing
    if (!content.startsWith('/**')) {
      content = this.generateHeader(fileName) + content;
      modified = true;
    }

    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedCount++;
      console.log(`Fixed: ${fileName}`);
    }

    return modified;
  }

  generateHeader(fileName) {
    const scriptName = fileName
      .replace('.gs', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return `/**
 * @fileoverview ${scriptName}
 * @description Google Apps Script automation
 * @version 1.0.0
 * @license MIT
 */

`;
  }

  run() {
    console.log('Fixing GAS headers...\n');

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
  const fixer = new GASHeaderFixer();
  fixer.run();
}

module.exports = GASHeaderFixer;