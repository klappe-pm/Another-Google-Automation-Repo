#!/usr/bin/env node

/**
 * Master fix script
 * Automatically fixes all common issues in the repository
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

class MasterFixer {
  constructor() {
    this.repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
    this.fixedCount = 0;
  }

  fixGASFiles() {
    console.log('\n🔧 Fixing Google Apps Script files...');
    
    const files = glob.sync('**/*.gs', {
      cwd: this.repoRoot,
      ignore: ['node_modules/**', '.git/**']
    });

    if (files.length > 0) {
      console.log(`Found ${files.length} .gs files`);
      
      // Fix headers and formatting
      const headerFixerPath = path.join(__dirname, 'fix-gas-headers.js');
      const formatterPath = path.join(__dirname, 'fix-gas-formatting.js');
      
      try {
        execSync(`node ${headerFixerPath}`, { cwd: this.repoRoot, stdio: 'inherit' });
        execSync(`node ${formatterPath}`, { cwd: this.repoRoot, stdio: 'inherit' });
        this.fixedCount += files.length;
      } catch (error) {
        console.error('Error fixing GAS files:', error.message);
      }
    }
  }

  fixREADMEFiles() {
    console.log('\n📄 Fixing README files...');
    
    const files = glob.sync('**/README*.md', {
      cwd: this.repoRoot,
      ignore: ['node_modules/**', '.git/**']
    });

    if (files.length > 0) {
      console.log(`Found ${files.length} README files`);
      
      const readmeFixerPath = path.join(__dirname, 'fix-readme.js');
      
      try {
        execSync(`node ${readmeFixerPath}`, { cwd: this.repoRoot, stdio: 'inherit' });
        this.fixedCount += files.length;
      } catch (error) {
        console.error('Error fixing README files:', error.message);
      }
    }
  }

  fixFilenames() {
    console.log('\n📝 Standardizing filenames...');
    
    const filenameFixerPath = path.join(__dirname, 'fix-filenames.js');
    
    try {
      execSync(`node ${filenameFixerPath}`, { cwd: this.repoRoot, stdio: 'inherit' });
    } catch (error) {
      console.error('Error fixing filenames:', error.message);
    }
  }

  removeObsoleteFiles() {
    console.log('\n🗑️  Removing obsolete files...');
    
    const obsoletePatterns = [
      '**/~$*',           // Temporary files
      '**/*.tmp',         // Temp files
      '**/.DS_Store',     // Mac files
      '**/Thumbs.db',     // Windows files
      '**/*.bak',         // Backup files
      '**/*-old.*',       // Old versions
      '**/*-backup.*'     // Backup versions
    ];

    let removedCount = 0;
    obsoletePatterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        cwd: this.repoRoot,
        ignore: ['node_modules/**', '.git/**']
      });
      
      files.forEach(file => {
        const fullPath = path.join(this.repoRoot, file);
        fs.unlinkSync(fullPath);
        console.log(`  Removed: ${file}`);
        removedCount++;
      });
    });

    if (removedCount > 0) {
      console.log(`  Removed ${removedCount} obsolete files`);
    }
  }

  run() {
    console.log('🚀 Running master fixer...\n');
    console.log(`Repository root: ${this.repoRoot}`);

    // Run all fixers
    this.fixGASFiles();
    this.fixREADMEFiles();
    this.fixFilenames();
    this.removeObsoleteFiles();

    // Report results
    console.log('\n' + '='.repeat(50));
    console.log('✅ Master fixer completed!');
    console.log(`Fixed ${this.fixedCount} files`);
    console.log('='.repeat(50));
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new MasterFixer();
  fixer.run();
}

module.exports = MasterFixer;