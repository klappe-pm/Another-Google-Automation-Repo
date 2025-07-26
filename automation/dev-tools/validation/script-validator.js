#!/usr/bin/env node

/**
 * Script Validation Tool
 * Validates Google Apps Scripts against repository standards
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 */

const fs = require('fs');
const path = require('path');

// Validation Rules
const VALIDATION_RULES = {
  NAMING: /^[a-z]+-[a-z]+-[a-z-]+\.gs$/,
  REQUIRED_HEADERS: [
    'Title',
    'Service', 
    'Purpose',
    'Created',
    'Updated',
    'Author',
    'Contact',
    'License'
  ],
  DIRECTORY_STRUCTURE: {
    gmail: ['Analysis Tools', 'Export Functions', 'Label Management', 'Utility Tools'],
    calendar: ['Analysis', 'Content', 'Exports', 'Utilities'],
    drive: ['File Management', 'YAML Processing', 'Content Organization'],
    docs: ['Export Tools', 'Content Processing'],
    sheets: ['Data Processing', 'Export Tools'],
    tasks: ['Export Tools', 'Analysis'],
    chat: ['Export Tools'],
    photos: ['Export Tools']
  },
  NO_LEGACY_IN_MAIN: true
};

class ScriptValidator {
  constructor(scriptsPath) {
    this.scriptsPath = scriptsPath;
    this.results = {
      totalScripts: 0,
      validScripts: 0,
      issues: [],
      summary: {}
    };
  }

  validateNaming(filename) {
    const issues = [];
    
    if (!VALIDATION_RULES.NAMING.test(filename)) {
      issues.push({
        type: 'NAMING',
        severity: 'WARNING',
        message: `File "${filename}" doesn't follow naming convention: service-function-descriptor.gs`
      });
    }
    
    return issues;
  }

  validateHeaders(content, filename) {
    const issues = [];
    const headerSection = content.substring(0, 2000); // Check first 2000 chars
    
    VALIDATION_RULES.REQUIRED_HEADERS.forEach(header => {
      const headerPattern = new RegExp(`\\* ${header}:`, 'i');
      if (!headerPattern.test(headerSection)) {
        issues.push({
          type: 'MISSING_HEADER',
          severity: 'ERROR',
          message: `Missing required header "${header}" in ${filename}`
        });
      }
    });
    
    return issues;
  }

  validateScript(filePath) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Validate naming
    issues.push(...this.validateNaming(filename));
    
    // Validate headers
    issues.push(...this.validateHeaders(content, filename));
    
    // Check for legacy indicators
    if (filename.includes('copy') || filename.includes('legacy')) {
      issues.push({
        type: 'LEGACY_FILE',
        severity: 'WARNING',
        message: `Potential legacy file in main directory: ${filename}`
      });
    }
    
    return issues;
  }

  validateDirectory(dirPath, serviceName) {
    const issues = [];
    
    if (!fs.existsSync(dirPath)) {
      issues.push({
        type: 'MISSING_DIRECTORY',
        severity: 'ERROR',
        message: `Service directory missing: ${serviceName}`
      });
      return issues;
    }
    
    // Check for README
    const readmePath = path.join(dirPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      issues.push({
        type: 'MISSING_README',
        severity: 'ERROR',
        message: `README.md missing in ${serviceName} directory`
      });
    }
    
    return issues;
  }

  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const scripts = [];
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Recursively scan subdirectories
        scripts.push(...this.scanDirectory(fullPath));
      } else if (item.name.endsWith('.gs')) {
        scripts.push(fullPath);
      }
    }
    
    return scripts;
  }

  validateRepository() {
    console.log('🔍 Starting repository validation...\n');
    
    const services = ['gmail', 'calendar', 'drive', 'docs', 'sheets', 'tasks', 'chat', 'photos', 'slides'];
    
    for (const service of services) {
      const servicePath = path.join(this.scriptsPath, service);
      console.log(`📁 Validating ${service} service...`);
      
      // Validate directory structure
      const dirIssues = this.validateDirectory(servicePath, service);
      this.results.issues.push(...dirIssues);
      
      if (fs.existsSync(servicePath)) {
        // Find and validate all scripts
        const scripts = this.scanDirectory(servicePath);
        this.results.totalScripts += scripts.length;
        
        let serviceValidScripts = 0;
        
        for (const scriptPath of scripts) {
          const scriptIssues = this.validateScript(scriptPath);
          this.results.issues.push(...scriptIssues);
          
          if (scriptIssues.length === 0) {
            serviceValidScripts++;
          }
        }
        
        this.results.validScripts += serviceValidScripts;
        this.results.summary[service] = {
          totalScripts: scripts.length,
          validScripts: serviceValidScripts,
          issues: this.results.issues.filter(issue => 
            issue.message.includes(service)
          ).length
        };
        
        console.log(`  ✅ ${serviceValidScripts}/${scripts.length} scripts valid`);
      } else {
        console.log(`  ❌ Directory not found`);
      }
    }
    
    return this.results;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validation: this.results,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(__dirname, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Validation Summary:');
    console.log(`Total Scripts: ${this.results.totalScripts}`);
    console.log(`Valid Scripts: ${this.results.validScripts}`);
    console.log(`Issues Found: ${this.results.issues.length}`);
    console.log(`\n📋 Report saved to: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze issues and generate actionable recommendations
    const issueTypes = {};
    this.results.issues.forEach(issue => {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
    });
    
    if (issueTypes['MISSING_HEADER']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Add missing script headers',
        count: issueTypes['MISSING_HEADER'],
        description: 'Update scripts to include all required header fields'
      });
    }
    
    if (issueTypes['NAMING']) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Rename files to follow convention',
        count: issueTypes['NAMING'],
        description: 'Rename files to follow service-function-descriptor.gs pattern'
      });
    }
    
    if (issueTypes['MISSING_README']) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Create missing README files',
        count: issueTypes['MISSING_README'],
        description: 'Create comprehensive README files for service directories'
      });
    }
    
    return recommendations;
  }
}

// Main execution
if (require.main === module) {
  const scriptsPath = path.resolve(__dirname, '../../scripts');
  const validator = new ScriptValidator(scriptsPath);
  
  const results = validator.validateRepository();
  validator.generateReport();
}

module.exports = ScriptValidator;
