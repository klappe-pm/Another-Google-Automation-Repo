const fs = require('fs');
const path = require('path');

/**
 * Google Apps Script Security Scanner
 * Scans .gs files for security vulnerabilities and best practice violations
 */
class GASSecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.scannedFiles = 0;
    this.startTime = Date.now();
    
    // Define comprehensive security patterns
    this.securityPatterns = {
      // Critical security issues
      hardcodedSecrets: {
        severity: 'CRITICAL',
        patterns: [
          {
            regex: /(?i)(password|passwd|pwd|secret|key|token|api_key)\s*=\s*['"][^'"]{8,}['"]/,
            description: 'Hardcoded credential detected'
          },
          {
            regex: /(?i)(client_secret|client_id|auth_token)\s*=\s*['"][^'"]{20,}['"]/,
            description: 'OAuth credential hardcoded'
          },
          {
            regex: /(?i)Bearer\s+[A-Za-z0-9\-_]{20,}/,
            description: 'Bearer token in code'
          },
          {
            regex: /(?i)(sk-|pk_)[a-zA-Z0-9]{20,}/,
            description: 'API key pattern detected'
          }
        ]
      },
      
      // Google API key exposure
      apiKeyExposure: {
        severity: 'CRITICAL',
        patterns: [
          {
            regex: /AIza[0-9A-Za-z\-_]{35}/,
            description: 'Google API key exposed'
          },
          {
            regex: /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/,
            description: 'OAuth client ID exposed'
          },
          {
            regex: /ya29\.[0-9A-Za-z\-_]+/,
            description: 'OAuth access token exposed'
          }
        ]
      },
      
      // High severity security issues
      insecurePatterns: {
        severity: 'HIGH',
        patterns: [
          {
            regex: /eval\s*\(/,
            description: 'Use of eval() function - potential code injection'
          },
          {
            regex: /innerHTML\s*=/,
            description: 'Use of innerHTML - potential XSS vulnerability'
          },
          {
            regex: /document\.write\s*\(/,
            description: 'Use of document.write - potential XSS'
          },
          {
            regex: /new\s+Function\s*\(/,
            description: 'Dynamic function creation - code injection risk'
          },
          {
            regex: /JSON\.parse\([^)]*user[^)]*\)/i,
            description: 'Parsing user input as JSON without validation'
          }
        ]
      },
      
      // Medium severity issues
      dataValidation: {
        severity: 'MEDIUM',
        patterns: [
          {
            regex: /DriveApp\.getFileById\([^)]*\)(?!.*try)/,
            description: 'File access without error handling'
          },
          {
            regex: /GmailApp\.search\([^)]*user[^)]*\)/i,
            description: 'Gmail search with user input - needs validation'
          },
          {
            regex: /SpreadsheetApp\.openById\([^)]*\)(?!.*try)/,
            description: 'Spreadsheet access without error handling'
          },
          {
            regex: /\.getRange\([^)]*\)\.setValue\([^)]*user/i,
            description: 'Setting cell values with user input - needs validation'
          }
        ]
      },
      
      // Low severity / best practice issues
      bestPractices: {
        severity: 'LOW',
        patterns: [
          {
            regex: /console\.log\(/,
            description: 'Use Logger.log() instead of console.log() in Apps Script'
          },
          {
            regex: /var\s+/,
            description: 'Consider using const/let instead of var'
          },
          {
            regex: /==\s*['"]/,
            description: 'Consider using strict equality (===)'
          }
        ]
      }
    };
  }

  /**
   * Scan a single Google Apps Script file
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      this.scannedFiles++;
      
      console.log(`📄 Scanning: ${path.relative(process.cwd(), filePath)}`);
      
      lines.forEach((line, index) => {
        this.checkLine(line, index + 1, filePath);
      });
      
      // Check for missing security headers
      this.checkSecurityHeaders(content, filePath);
      
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message);
    }
  }

  /**
   * Check a single line for security patterns
   */
  checkLine(line, lineNumber, filePath) {
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('*') || 
        trimmedLine.startsWith('/*') ||
        trimmedLine === '') {
      return;
    }

    // Check all security pattern categories
    Object.entries(this.securityPatterns).forEach(([category, config]) => {
      config.patterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          this.addVulnerability({
            type: config.severity,
            category: category,
            file: path.relative(process.cwd(), filePath),
            line: lineNumber,
            description: pattern.description,
            snippet: this.sanitizeSnippet(line.trim()),
            rule: pattern.regex.source
          });
        }
      });
    });
  }

  /**
   * Check for required security headers and documentation
   */
  checkSecurityHeaders(content, filePath) {
    const requiredHeaders = [
      { pattern: /Title:/i, name: 'Title' },
      { pattern: /Service:/i, name: 'Service' },
      { pattern: /Purpose:/i, name: 'Purpose' },
      { pattern: /Author:/i, name: 'Author' }
    ];

    const missingHeaders = requiredHeaders.filter(header => 
      !header.pattern.test(content)
    );

    if (missingHeaders.length > 0) {
      this.addVulnerability({
        type: 'LOW',
        category: 'documentation',
        file: path.relative(process.cwd(), filePath),
        line: 1,
        description: `Missing required headers: ${missingHeaders.map(h => h.name).join(', ')}`,
        snippet: '/* Missing documentation headers */',
        rule: 'documentation-headers'
      });
    }

    // Check for security considerations documentation
    if (!/security/i.test(content) && !/scope/i.test(content)) {
      this.addVulnerability({
        type: 'LOW',
        category: 'documentation',
        file: path.relative(process.cwd(), filePath),
        line: 1,
        description: 'Missing security considerations documentation',
        snippet: '/* No security documentation found */',
        rule: 'security-documentation'
      });
    }
  }

  /**
   * Add a vulnerability to the collection
   */
  addVulnerability(vulnerability) {
    // Avoid duplicate vulnerabilities
    const isDuplicate = this.vulnerabilities.some(v => 
      v.file === vulnerability.file &&
      v.line === vulnerability.line &&
      v.rule === vulnerability.rule
    );

    if (!isDuplicate) {
      this.vulnerabilities.push({
        ...vulnerability,
        id: `${vulnerability.category}-${vulnerability.file}-${vulnerability.line}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Sanitize code snippet for reporting
   */
  sanitizeSnippet(snippet) {
    // Redact potential sensitive information
    return snippet
      .replace(/(['"'])[A-Za-z0-9+/=]{20,}\1/g, '$1[REDACTED]$1')
      .replace(/AIza[0-9A-Za-z\-_]{35}/g, 'AIza[REDACTED]')
      .replace(/Bearer\s+[A-Za-z0-9\-_]+/g, 'Bearer [REDACTED]')
      .substring(0, 150); // Limit length
  }

  /**
   * Generate comprehensive security report
   */
  generateReport() {
    const endTime = Date.now();
    const scanDuration = (endTime - this.startTime) / 1000;

    const summary = {
      critical: this.vulnerabilities.filter(v => v.type === 'CRITICAL').length,
      high: this.vulnerabilities.filter(v => v.type === 'HIGH').length,
      medium: this.vulnerabilities.filter(v => v.type === 'MEDIUM').length,
      low: this.vulnerabilities.filter(v => v.type === 'LOW').length
    };

    const categoryBreakdown = {};
    this.vulnerabilities.forEach(vuln => {
      categoryBreakdown[vuln.category] = (categoryBreakdown[vuln.category] || 0) + 1;
    });

    return {
      metadata: {
        scanner: 'GAS Security Scanner',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        scanDuration: `${scanDuration.toFixed(2)}s`,
        repository: 'Another-Google-Automation-Repo'
      },
      statistics: {
        totalFiles: this.scannedFiles,
        totalVulnerabilities: this.vulnerabilities.length,
        scanDuration: scanDuration
      },
      summary: summary,
      categoryBreakdown: categoryBreakdown,
      vulnerabilities: this.vulnerabilities,
      status: this.getOverallStatus(summary),
      recommendations: this.generateRecommendations(summary, categoryBreakdown)
    };
  }

  /**
   * Determine overall security status
   */
  getOverallStatus(summary) {
    if (summary.critical > 0) return 'CRITICAL';
    if (summary.high > 0) return 'HIGH';
    if (summary.medium > 0) return 'MEDIUM';
    if (summary.low > 0) return 'LOW';
    return 'PASS';
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(summary, categoryBreakdown) {
    const recommendations = [];

    if (summary.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Immediately remove hardcoded credentials and API keys',
        description: 'Use PropertiesService.getScriptProperties() to store sensitive data'
      });
    }

    if (summary.high > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Address insecure coding patterns',
        description: 'Replace eval(), innerHTML, and other dangerous functions with safer alternatives'
      });
    }

    if (categoryBreakdown.dataValidation > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Implement input validation and error handling',
        description: 'Validate user inputs and add try-catch blocks for API calls'
      });
    }

    if (categoryBreakdown.documentation > 0) {
      recommendations.push({
        priority: 'LOW',
        action: 'Improve code documentation',
        description: 'Add security headers and document security considerations'
      });
    }

    return recommendations;
  }
}

/**
 * Main scanning function
 */
function scanRepository() {
  console.log('🔍 Starting Google Apps Script Security Scan...');
  console.log('📊 Repository: Another-Google-Automation-Repo');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('');

  const scanner = new GASSecurityScanner();
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  
  if (!fs.existsSync(scriptsDir)) {
    console.error('❌ Scripts directory not found at:', scriptsDir);
    process.exit(1);
  }

  // Recursively scan all .gs files
  scanDirectory(scriptsDir, scanner);

  // Generate and save report
  const report = scanner.generateReport();
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '..', 'security', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Write detailed report
  const reportPath = path.join(reportsDir, 'gas-security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Write summary report
  const summaryPath = path.join(reportsDir, 'security-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: report.metadata.timestamp,
    status: report.status,
    summary: report.summary,
    totalFiles: report.statistics.totalFiles,
    recommendations: report.recommendations
  }, null, 2));

  // Console output
  console.log('');
  console.log('📋 SCAN RESULTS');
  console.log('===============');
  console.log(`📁 Files scanned: ${report.statistics.totalFiles}`);
  console.log(`⏱️  Scan duration: ${report.metadata.scanDuration}`);
  console.log(`🎯 Overall status: ${report.status}`);
  console.log('');
  console.log('🔢 VULNERABILITY BREAKDOWN');
  console.log('===========================');
  console.log(`🚨 Critical: ${report.summary.critical}`);
  console.log(`⚠️  High: ${report.summary.high}`);
  console.log(`📋 Medium: ${report.summary.medium}`);
  console.log(`ℹ️  Low: ${report.summary.low}`);
  console.log('');

  if (report.vulnerabilities.length > 0) {
    console.log('🔍 DETAILED FINDINGS');
    console.log('====================');
    
    report.vulnerabilities.forEach((vuln, index) => {
      console.log(`${index + 1}. [${vuln.type}] ${vuln.description}`);
      console.log(`   📁 File: ${vuln.file}:${vuln.line}`);
      console.log(`   📝 Code: ${vuln.snippet}`);
      console.log('');
    });
  }

  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');
    
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
      console.log(`   ${rec.description}`);
      console.log('');
    });
  }

  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log(`📊 Summary report saved to: ${summaryPath}`);

  // Exit with appropriate code
  if (report.summary.critical > 0) {
    console.log('');
    console.error('❌ CRITICAL SECURITY ISSUES FOUND!');
    console.error('Please address critical vulnerabilities before deploying.');
    process.exit(1);
  } else if (report.summary.high > 0) {
    console.log('');
    console.warn('⚠️  HIGH SEVERITY ISSUES FOUND!');
    console.warn('Please review and address high priority vulnerabilities.');
    process.exit(0); // Don't fail build for high severity in development
  } else {
    console.log('');
    console.log('✅ SECURITY SCAN PASSED!');
    console.log('No critical or high severity vulnerabilities found.');
    process.exit(0);
  }
}

/**
 * Recursively scan directory for .gs files
 */
function scanDirectory(dir, scanner) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!file.startsWith('.') && 
          file !== 'node_modules' && 
          file !== 'Legacy Files' &&
          file !== 'legacy') {
        scanDirectory(filePath, scanner);
      }
    } else if (file.endsWith('.gs')) {
      scanner.scanFile(filePath);
    }
  });
}

// Export for use in other modules
module.exports = { GASSecurityScanner, scanRepository };

// Run scan if called directly
if (require.main === module) {
  scanRepository();
}
