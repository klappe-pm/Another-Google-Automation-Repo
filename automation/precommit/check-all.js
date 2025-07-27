#!/usr/bin/env node

/**
 * Master pre-commit check script
 * Runs all validation checks on staged files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PreCommitChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
  }

  getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only --diff-filter=ACM').toString();
      return output.trim().split('\n').filter(f => f);
    } catch (error) {
      return [];
    }
  }

  checkGASFiles(files) {
    const gasFiles = files.filter(f => f.endsWith('.gs'));
    if (gasFiles.length === 0) return;

    console.log(`\nChecking ${gasFiles.length} Google Apps Script files...`);
    
    try {
      const linterPath = path.join(this.repoRoot, 'automation/precommit/lint-gas.js');
      const quotedFiles = gasFiles.map(f => `"${f}"`).join(' ');
      execSync(`node "${linterPath}" ${quotedFiles}`, { stdio: 'inherit' });
    } catch (error) {
      this.errors.push('GAS linting failed');
    }
  }

  checkREADMEFiles(files) {
    const readmeFiles = files.filter(f => f.toLowerCase().includes('readme') && f.endsWith('.md'));
    if (readmeFiles.length === 0) return;

    console.log(`\nChecking ${readmeFiles.length} README files...`);
    
    try {
      const linterPath = path.join(this.repoRoot, 'automation/precommit/lint-readme.js');
      const quotedFiles = readmeFiles.map(f => `"${f}"`).join(' ');
      execSync(`node "${linterPath}" ${quotedFiles}`, { stdio: 'inherit' });
    } catch (error) {
      this.errors.push('README linting failed');
    }
  }

  checkProjectStructure(files) {
    console.log('\nValidating project structure...');
    
    try {
      const validatorPath = path.join(this.repoRoot, 'automation/precommit/validate-structure.js');
      if (fs.existsSync(validatorPath)) {
        execSync(`node "${validatorPath}"`, { stdio: 'inherit' });
      }
    } catch (error) {
      this.warnings.push('Project structure validation failed');
    }
  }

  checkSecurity(files) {
    console.log('\nRunning security scan...');
    
    try {
      const scannerPath = path.join(this.repoRoot, 'automation/precommit/security-scan.js');
      if (fs.existsSync(scannerPath)) {
        const quotedFiles = files.map(f => `"${f}"`).join(' ');
        execSync(`node "${scannerPath}" ${quotedFiles}`, { stdio: 'inherit' });
      }
    } catch (error) {
      this.warnings.push('Security scan found issues');
    }
  }

  run() {
    console.log('Running pre-commit checks...\n');

    const stagedFiles = this.getStagedFiles();
    if (stagedFiles.length === 0) {
      console.log('No staged files to check');
      return 0;
    }

    console.log(`Found ${stagedFiles.length} staged files`);

    // Run all checks
    this.checkGASFiles(stagedFiles);
    this.checkREADMEFiles(stagedFiles);
    this.checkProjectStructure(stagedFiles);
    this.checkSecurity(stagedFiles);

    // Report results
    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length > 0) {
      console.log('\nPre-commit checks failed with errors:');
      this.errors.forEach(err => console.log(`  - ${err}`));
      return 1;
    }

    if (this.warnings.length > 0) {
      console.log('\nPre-commit checks completed with warnings:');
      this.warnings.forEach(warn => console.log(`  - ${warn}`));
    }

    console.log('\nAll pre-commit checks passed!');
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new PreCommitChecker();
  process.exit(checker.run());
}

module.exports = PreCommitChecker;