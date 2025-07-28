#!/usr/bin/env node

/**
 * Filename standardization script
 * Fixes common filename issues across the repository
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

class FilenameFixer {
  constructor() {
    this.repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
    this.fixedCount = 0;
  }

  standardizeFilenames() {
    console.log('\nStandardizing filenames...');
    
    const files = glob.sync('**/*', {
      cwd: this.repoRoot,
      ignore: ['node_modules/**', '.git/**', '**/.*'],
      nodir: true
    });

    files.forEach(file => {
      const oldPath = path.join(this.repoRoot, file);
      const dir = path.dirname(file);
      const ext = path.extname(file);
      const basename = path.basename(file, ext);
      
      // Apply standardization rules
      let newBasename = basename
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/[()]/g, '')          // Remove parentheses
        .replace(/[_]{2,}/g, '_')      // Replace multiple underscores with single
        .replace(/[-]{2,}/g, '-')      // Replace multiple hyphens with single
        .replace(/^[-_]+|[-_]+$/g, '') // Remove leading/trailing hyphens and underscores
        .toLowerCase();                // Convert to lowercase

      if (newBasename !== basename) {
        const newFile = path.join(dir, newBasename + ext);
        const newPath = path.join(this.repoRoot, newFile);
        
        if (!fs.existsSync(newPath)) {
          try {
            fs.renameSync(oldPath, newPath);
            console.log(`  Renamed: ${file} -> ${newFile}`);
            this.fixedCount++;
          } catch (error) {
            console.error(`  Error renaming ${file}:`, error.message);
          }
        }
      }
    });

    console.log(`\nFixed ${this.fixedCount} filenames`);
  }

  run() {
    this.standardizeFilenames();
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new FilenameFixer();
  fixer.run();
}

module.exports = FilenameFixer;
