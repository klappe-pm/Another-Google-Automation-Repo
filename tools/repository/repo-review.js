#!/usr/bin/env node

/**
 * Repository Review Script - AGAR Publication Readiness Checker
 * 
 * Title: Repository Publication Readiness Review Tool
 * Purpose: Comprehensive analysis for public repository publication
 * Created: 2025-07-19
 * Updated: 2025-07-19
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RepositoryReviewer {
  constructor() {
    this.rootDir = process.cwd();
    this.results = {
      security: { score: 0, issues: [], checks: [] },
      documentation: { score: 0, issues: [], checks: [] },
      organization: { score: 0, issues: [], checks: [] },
      codeQuality: { score: 0, issues: [], checks: [] },
      licensing: { score: 0, issues: [], checks: [] },
      overall: { score: 0, status: '', readyForPublication: false }
    };
    this.requiredFiles = [
      'README.md',
      'LICENSE.md',
      'package.json',
      '.gitignore'
    ];
    this.serviceDirectories = [
      'scripts/gmail',
      'scripts/drive', 
      'scripts/calendar',
      'scripts/docs',
      'scripts/sheets',
      'scripts/tasks',
      'scripts/chat',
      'scripts/slides'
    ];
  }

  async runFullReview() {
    console.log('🔍 Starting Repository Publication Readiness Review...\n');
    
    await this.checkSecurity();
    await this.checkDocumentation();
    await this.checkOrganization();
    await this.checkCodeQuality();
    await this.checkLicensing();
    
    this.calculateOverallScore();
    this.generateReport();
    
    return this.results;
  }

  async checkSecurity() {
    console.log('🔒 Checking Security...');
    let score = 10;
    const checks = [];
    const issues = [];

    // Check for security vulnerabilities using Snyk
    try {
      const snykResult = execSync('npm run security:scan 2>/dev/null || echo "scan-failed"', { 
        encoding: 'utf8',
        cwd: this.rootDir 
      });
      
      if (snykResult.includes('scan-failed')) {
        issues.push('Security scan tool not available - manual review required');
        score -= 2;
      } else if (snykResult.includes('vulnerabilities found')) {
        const criticalCount = (snykResult.match(/critical/g) || []).length;
        const highCount = (snykResult.match(/high/g) || []).length;
        
        if (criticalCount > 0) {
          issues.push(`${criticalCount} critical vulnerabilities found`);
          score -= 5;
        }
        if (highCount > 0) {
          issues.push(`${highCount} high vulnerabilities found`);
          score -= 3;
        }
      }
      checks.push('✅ Security vulnerability scan completed');
    } catch (error) {
      issues.push('Failed to run security scan');
      score -= 2;
    }

    // Check for sensitive files
    const sensitivePatterns = [
      '.env',
      '.env.local', 
      'credentials.json',
      'secrets.json',
      'private-key.json'
    ];

    sensitivePatterns.forEach(pattern => {
      if (this.findFiles(pattern).length > 0) {
        issues.push(`Sensitive file found: ${pattern}`);
        score -= 3;
      }
    });
    checks.push('✅ Sensitive file check completed');

    // Check .gitignore for sensitive patterns
    const gitignorePath = path.join(this.rootDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const requiredPatterns = ['*.env', '*.json', 'credentials', 'secrets'];
      const missingPatterns = requiredPatterns.filter(pattern => 
        !gitignoreContent.includes(pattern)
      );
      
      if (missingPatterns.length > 0) {
        issues.push(`Missing .gitignore patterns: ${missingPatterns.join(', ')}`);
        score -= 1;
      }
      checks.push('✅ .gitignore security patterns verified');
    }

    // Check for hardcoded secrets in code
    const codeFiles = this.findFiles('*.js').concat(this.findFiles('*.gs'));
    let secretsFound = 0;
    
    codeFiles.slice(0, 50).forEach(file => { // Limit to first 50 files for performance
      try {
        const content = fs.readFileSync(file, 'utf8').toLowerCase();
        const secretPatterns = [
          'api_key',
          'apikey', 
          'password',
          'secret',
          'token',
          'client_secret'
        ];
        
        secretPatterns.forEach(pattern => {
          if (content.includes(`"${pattern}"`) || content.includes(`'${pattern}'`)) {
            secretsFound++;
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    if (secretsFound > 0) {
      issues.push(`Potential hardcoded secrets found in ${secretsFound} files`);
      score -= 2;
    }
    checks.push('✅ Hardcoded secrets scan completed');

    this.results.security = { score: Math.max(0, score), issues, checks };
    console.log(`   Security Score: ${this.results.security.score}/10\n`);
  }

  async checkDocumentation() {
    console.log('📖 Checking Documentation...');
    let score = 10;
    const checks = [];
    const issues = [];

    // Check required files exist
    this.requiredFiles.forEach(file => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        checks.push(`✅ ${file} exists`);
      } else {
        issues.push(`Missing required file: ${file}`);
        score -= 3;
      }
    });

    // Check README quality
    const readmePath = path.join(this.rootDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
      // Check for merge conflicts
      if (readmeContent.includes('<<<<<<< HEAD') || readmeContent.includes('>>>>>>> ')) {
        issues.push('README contains unresolved merge conflicts');
        score -= 5;
      } else {
        checks.push('✅ README has no merge conflicts');
      }

      // Check README sections
      const requiredSections = [
        'installation',
        'usage', 
        'license',
        'contact'
      ];
      
      requiredSections.forEach(section => {
        if (readmeContent.toLowerCase().includes(section)) {
          checks.push(`✅ README includes ${section} section`);
        } else {
          issues.push(`README missing ${section} section`);
          score -= 1;
        }
      });

      // Check for badges
      if (readmeContent.includes('[![')) {
        checks.push('✅ README includes status badges');
      } else {
        issues.push('README lacks status badges');
        score -= 1;
      }
    }

    // Check service directory READMEs
    let serviceReadmeCount = 0;
    this.serviceDirectories.forEach(dir => {
      const readmePath = path.join(this.rootDir, dir, 'README.md');
      if (fs.existsSync(readmePath)) {
        serviceReadmeCount++;
      } else {
        issues.push(`Missing README in ${dir}`);
        score -= 1;
      }
    });
    
    checks.push(`✅ ${serviceReadmeCount}/${this.serviceDirectories.length} service directories have READMEs`);

    this.results.documentation = { score: Math.max(0, score), issues, checks };
    console.log(`   Documentation Score: ${this.results.documentation.score}/10\n`);
  }

  async checkOrganization() {
    console.log('🗂️ Checking Organization...');
    let score = 10;
    const checks = [];
    const issues = [];

    // Check directory structure
    const expectedDirs = [
      'scripts',
      'tools', 
      'templates',
      'config'
    ];

    expectedDirs.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        checks.push(`✅ ${dir} directory exists`);
      } else {
        issues.push(`Missing directory: ${dir}`);
        score -= 1;
      }
    });

    // Check service directories
    let serviceCount = 0;
    this.serviceDirectories.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        serviceCount++;
      }
    });
    
    checks.push(`✅ ${serviceCount}/${this.serviceDirectories.length} service directories exist`);
    if (serviceCount < this.serviceDirectories.length) {
      score -= (this.serviceDirectories.length - serviceCount) * 0.5;
    }

    // Check for consistent naming
    const scriptFiles = this.findFiles('*.gs');
    let consistentNaming = 0;
    let totalFiles = scriptFiles.length;

    scriptFiles.forEach(file => {
      const filename = path.basename(file);
      // Check for service-function-descriptor pattern
      if (filename.match(/^[a-z]+(-[a-z]+){2,}\.gs$/)) {
        consistentNaming++;
      }
    });

    const namingPercentage = totalFiles > 0 ? (consistentNaming / totalFiles) * 100 : 100;
    if (namingPercentage < 70) {
      issues.push(`Only ${namingPercentage.toFixed(1)}% of files follow naming convention`);
      score -= 2;
    } else {
      checks.push(`✅ ${namingPercentage.toFixed(1)}% of files follow naming convention`);
    }

    // Check for temporary/unnecessary files
    const unnecessaryFiles = this.findFiles('.DS_Store')
      .concat(this.findFiles('*.tmp'))
      .concat(this.findFiles('Thumbs.db'));

    if (unnecessaryFiles.length > 0) {
      issues.push(`${unnecessaryFiles.length} unnecessary files found (.DS_Store, *.tmp, etc.)`);
      score -= 1;
    } else {
      checks.push('✅ No unnecessary temporary files found');
    }

    this.results.organization = { score: Math.max(0, score), issues, checks };
    console.log(`   Organization Score: ${this.results.organization.score}/10\n`);
  }

  async checkCodeQuality() {
    console.log('⚡ Checking Code Quality...');
    let score = 10;
    const checks = [];
    const issues = [];

    // Check for ESLint issues
    try {
      const eslintResult = execSync('npx eslint . --format json 2>/dev/null || echo "[]"', {
        encoding: 'utf8',
        cwd: this.rootDir
      });
      
      const eslintData = JSON.parse(eslintResult);
      let errorCount = 0;
      let warningCount = 0;
      
      eslintData.forEach(file => {
        errorCount += file.errorCount || 0;
        warningCount += file.warningCount || 0;
      });

      if (errorCount > 0) {
        issues.push(`${errorCount} ESLint errors found`);
        score -= Math.min(3, errorCount * 0.1);
      }
      
      if (warningCount > 0) {
        issues.push(`${warningCount} ESLint warnings found`);
        score -= Math.min(2, warningCount * 0.05);
      }

      if (errorCount === 0 && warningCount === 0) {
        checks.push('✅ No ESLint issues found');
      } else {
        checks.push(`⚠️ ESLint found ${errorCount} errors, ${warningCount} warnings`);
      }
    } catch (error) {
      checks.push('⚠️ ESLint check skipped (not available)');
    }

    // Check script headers
    const scriptFiles = this.findFiles('*.gs');
    let scriptsWithHeaders = 0;
    
    scriptFiles.slice(0, 20).forEach(file => { // Sample first 20 files
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hasHeader = content.includes('/**') && 
                         content.includes('Title:') && 
                         content.includes('Author:');
        if (hasHeader) scriptsWithHeaders++;
      } catch (error) {
        // Skip files that can't be read
      }
    });

    const headerPercentage = scriptFiles.length > 0 ? 
      (scriptsWithHeaders / Math.min(20, scriptFiles.length)) * 100 : 100;
    
    if (headerPercentage < 80) {
      issues.push(`Only ${headerPercentage.toFixed(1)}% of scripts have proper headers`);
      score -= 2;
    } else {
      checks.push(`✅ ${headerPercentage.toFixed(1)}% of scripts have proper headers`);
    }

    // Check for shell script quality
    const shellScripts = this.findFiles('*.sh');
    if (shellScripts.length > 0) {
      try {
        const shellcheckResult = execSync('shellcheck *.sh 2>&1 || echo "shellcheck-failed"', {
          encoding: 'utf8',
          cwd: this.rootDir
        });
        
        if (shellcheckResult.includes('shellcheck-failed')) {
          checks.push('⚠️ Shellcheck not available for shell script quality check');
        } else {
          const issueCount = (shellcheckResult.match(/SC\d+/g) || []).length;
          if (issueCount > 0) {
            issues.push(`${issueCount} shell script quality issues found`);
            score -= Math.min(1, issueCount * 0.1);
          } else {
            checks.push('✅ Shell scripts pass quality checks');
          }
        }
      } catch (error) {
        checks.push('⚠️ Shell script quality check failed');
      }
    }

    this.results.codeQuality = { score: Math.max(0, score), issues, checks };
    console.log(`   Code Quality Score: ${this.results.codeQuality.score}/10\n`);
  }

  async checkLicensing() {
    console.log('⚖️ Checking Licensing...');
    let score = 10;
    const checks = [];
    const issues = [];

    // Check LICENSE file
    const licensePath = path.join(this.rootDir, 'LICENSE.md');
    if (fs.existsSync(licensePath)) {
      const licenseContent = fs.readFileSync(licensePath, 'utf8');
      
      if (licenseContent.includes('MIT License')) {
        checks.push('✅ MIT License detected');
      } else {
        issues.push('License type unclear or non-standard');
        score -= 2;
      }

      if (licenseContent.includes('2025')) {
        checks.push('✅ License has current year');
      } else {
        issues.push('License year may be outdated');
        score -= 1;
      }
    } else {
      issues.push('LICENSE.md file missing');
      score -= 5;
    }

    // Check package.json license field
    const packagePath = path.join(this.rootDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (packageContent.license === 'MIT') {
        checks.push('✅ package.json license field set to MIT');
      } else {
        issues.push('package.json license field missing or incorrect');
        score -= 1;
      }

      // Check repository URL
      if (packageContent.repository && packageContent.repository.url) {
        if (packageContent.repository.url.includes('kevinlappe/workspace-automation')) {
          checks.push('✅ Repository URL correctly configured');
        } else {
          issues.push('Repository URL may be incorrect');
          score -= 2;
        }
      } else {
        issues.push('Repository URL missing in package.json');
        score -= 1;
      }
    }

    // Check for copyright notices in scripts
    const scriptFiles = this.findFiles('*.gs').slice(0, 10); // Sample first 10 files
    let scriptsWithCopyright = 0;
    
    scriptFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('License: MIT') || content.includes('kevin@averageintelligence.ai')) {
          scriptsWithCopyright++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    });

    if (scriptFiles.length > 0) {
      const copyrightPercentage = (scriptsWithCopyright / scriptFiles.length) * 100;
      if (copyrightPercentage > 70) {
        checks.push(`✅ ${copyrightPercentage.toFixed(1)}% of scripts have proper attribution`);
      } else {
        issues.push(`Only ${copyrightPercentage.toFixed(1)}% of scripts have proper attribution`);
        score -= 1;
      }
    }

    this.results.licensing = { score: Math.max(0, score), issues, checks };
    console.log(`   Licensing Score: ${this.results.licensing.score}/10\n`);
  }

  calculateOverallScore() {
    const weights = {
      security: 0.3,
      documentation: 0.25,
      organization: 0.2,
      codeQuality: 0.15,
      licensing: 0.1
    };

    const weightedScore = 
      (this.results.security.score * weights.security) +
      (this.results.documentation.score * weights.documentation) +
      (this.results.organization.score * weights.organization) +
      (this.results.codeQuality.score * weights.codeQuality) +
      (this.results.licensing.score * weights.licensing);

    this.results.overall.score = Math.round(weightedScore * 10) / 10;

    // Determine status
    if (this.results.overall.score >= 9.0) {
      this.results.overall.status = '🟢 EXCELLENT - Ready for Publication';
      this.results.overall.readyForPublication = true;
    } else if (this.results.overall.score >= 8.0) {
      this.results.overall.status = '🟢 GOOD - Nearly Ready for Publication';
      this.results.overall.readyForPublication = true;
    } else if (this.results.overall.score >= 7.0) {
      this.results.overall.status = '🟡 FAIR - Minor Issues to Address';
      this.results.overall.readyForPublication = false;
    } else if (this.results.overall.score >= 5.0) {
      this.results.overall.status = '🟡 NEEDS WORK - Several Issues to Fix';
      this.results.overall.readyForPublication = false;
    } else {
      this.results.overall.status = '🔴 NOT READY - Major Issues Present';
      this.results.overall.readyForPublication = false;
    }
  }

  generateReport() {
    console.log('📊 REPOSITORY PUBLICATION READINESS REPORT');
    console.log('='.repeat(50));
    console.log(`Overall Score: ${this.results.overall.score}/10.0`);
    console.log(`Status: ${this.results.overall.status}`);
    console.log(`Ready for Publication: ${this.results.overall.readyForPublication ? '✅ YES' : '❌ NO'}\n`);

    // Individual scores
    console.log('CATEGORY SCORES:');
    console.log(`🔒 Security:      ${this.results.security.score}/10`);
    console.log(`📖 Documentation: ${this.results.documentation.score}/10`);
    console.log(`🗂️ Organization:  ${this.results.organization.score}/10`);
    console.log(`⚡ Code Quality:  ${this.results.codeQuality.score}/10`);
    console.log(`⚖️ Licensing:     ${this.results.licensing.score}/10\n`);

    // Issues summary
    const allIssues = [
      ...this.results.security.issues,
      ...this.results.documentation.issues,
      ...this.results.organization.issues,
      ...this.results.codeQuality.issues,
      ...this.results.licensing.issues
    ];

    if (allIssues.length > 0) {
      console.log('ISSUES TO ADDRESS:');
      allIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Recommendations
    console.log('RECOMMENDATIONS:');
    if (this.results.overall.readyForPublication) {
      console.log('✅ Repository is ready for publication!');
      console.log('- Consider addressing any minor issues listed above');
      console.log('- Run final security scan before making public');
      console.log('- Prepare community engagement strategy');
    } else {
      console.log('❌ Address the issues above before publication');
      console.log('- Focus on security and documentation issues first');
      console.log('- Re-run this review after making fixes');
      console.log('- Target score of 8.0+ for publication readiness');
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Review completed: ${new Date().toISOString()}`);
  }

  findFiles(pattern) {
    const results = [];
    
    function searchDir(dir) {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
            searchDir(fullPath);
          } else if (stat.isFile()) {
            if (pattern.includes('*')) {
              const regex = new RegExp(pattern.replace('*', '.*'));
              if (regex.test(item)) {
                results.push(fullPath);
              }
            } else if (item === pattern) {
              results.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }

    searchDir(this.rootDir);
    return results;
  }
}

// CLI Interface
if (require.main === module) {
  const reviewer = new RepositoryReviewer();
  
  async function main() {
    try {
      const results = await reviewer.runFullReview();
      
      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(reviewer.rootDir, 'reports', `repo-review-${timestamp}.json`);
      
      // Ensure reports directory exists
      const reportsDir = path.join(reviewer.rootDir, 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      console.log(`\n📄 Detailed results saved to: ${reportPath}`);
      
      // Exit with appropriate code
      process.exit(results.overall.readyForPublication ? 0 : 1);
    } catch (error) {
      console.error('❌ Review failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = RepositoryReviewer;
