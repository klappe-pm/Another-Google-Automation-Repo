#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CommentHeaderFixer {
  constructor() {
    this.filesFixed = 0;
    this.totalChanges = 0;
  }

  fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let changes = 0;

    const fixedLines = lines.map((line, index) => {
      // Match lines that start with "/ * *" (with spaces)
      if (line.match(/^\/\s+\*\s+\*/)) {
        modified = true;
        changes++;
        // Replace with proper "/**"
        return line.replace(/^\/\s+\*\s+\*/, '/**');
      }
      return line;
    });

    if (modified) {
      fs.writeFileSync(filePath, fixedLines.join('\n'));
      this.filesFixed++;
      this.totalChanges += changes;
      console.log(`Fixed ${changes} headers in: ${path.relative(process.cwd(), filePath)}`);
    }

    return modified;
  }

  run() {
    console.log('Fixing malformed comment headers in .gs files...\n');

    // Find all .gs files
    const files = glob.sync('**/*.gs', {
      ignore: ['node_modules/**', '.git/**']
    });

    console.log(`Found ${files.length} .gs files to check\n`);

    files.forEach(file => {
      this.fixFile(file);
    });

    console.log('\n=== Summary ===');
    console.log(`Files fixed: ${this.filesFixed}`);
    console.log(`Total headers fixed: ${this.totalChanges}`);
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new CommentHeaderFixer();
  fixer.run();
}

module.exports = CommentHeaderFixer;