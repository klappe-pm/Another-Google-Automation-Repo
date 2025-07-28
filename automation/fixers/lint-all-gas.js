#!/usr/bin/env node

/**
 * Lint all Google Apps Script files
 * Runs the GAS linter on all .gs files in the repository
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findGSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findGSFiles(fullPath, files);
    } else if (item.endsWith('.gs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log('🔍 Finding all .gs files...');
const repoRoot = path.resolve(__dirname, '../..');
const gsFiles = findGSFiles(path.join(repoRoot, 'apps'));

console.log(`Found ${gsFiles.length} .gs files\n`);

// Run linter on each file
let totalErrors = 0;
let totalWarnings = 0;

for (const file of gsFiles) {
  try {
    const result = execSync(
      `node "${path.join(repoRoot, 'automation/precommit/lint-gas.js')}" --fix "${file}"`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    // Parse results
    const lines = result.split('\n');
    const summaryLine = lines.find(line => line.includes('Errors:'));
    if (summaryLine) {
      const match = summaryLine.match(/Errors: (\d+).*Warnings: (\d+)/);
      if (match) {
        totalErrors += parseInt(match[1]);
        totalWarnings += parseInt(match[2]);
      }
    }
  } catch (error) {
    console.error(`Error linting ${path.basename(file)}: ${error.message}`);
  }
}

console.log('\n==================================================');
console.log('📊 Total Linting Summary');
console.log('==================================================');
console.log(`Files processed: ${gsFiles.length}`);
console.log(`Total errors: ${totalErrors}`);
console.log(`Total warnings: ${totalWarnings}`);
console.log();

if (totalErrors === 0) {
  console.log('✅ All files pass linting!');
} else {
  console.log('❌ Some files have errors that need manual fixing');
}