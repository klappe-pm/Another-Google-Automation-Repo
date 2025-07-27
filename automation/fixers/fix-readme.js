#!/usr/bin/env node

/**
 * README Fixer
 * Fixes common issues in README files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class READMEFixer {
  constructor() {
    this.fixedCount = 0;
  }

  fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let modified = false;

    // Remove emojis
    const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    if (emojiPattern.test(content)) {
      content = content.replace(emojiPattern, '');
      modified = true;
    }

    // Remove AI references
    const aiPatterns = [
      /claude|anthropic/gi,
      /ai[- ]generated|generated with/gi,
      /co-authored-by:\s*claude/gi,
      /made with claude/gi,
      /created by claude/gi
    ];

    aiPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    });

    // Fix trailing whitespace
    const lines = content.split('\n');
    const fixedLines = lines.map(line => line.trimEnd());
    if (fixedLines.join('\n') !== content) {
      content = fixedLines.join('\n');
      modified = true;
    }

    // Remove duplicate blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Save if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixedCount++;
      console.log(`Fixed: ${fileName}`);
    }

    return modified;
  }

  run() {
    console.log('Fixing README files...\n');

    const files = glob.sync('**/README*.md', {
      ignore: ['node_modules/**', '.git/**']
    });

    console.log(`Found ${files.length} README files\n`);

    files.forEach(file => {
      this.fixFile(file);
    });

    console.log(`\nFixed ${this.fixedCount} files`);
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new READMEFixer();
  fixer.run();
}

module.exports = READMEFixer;