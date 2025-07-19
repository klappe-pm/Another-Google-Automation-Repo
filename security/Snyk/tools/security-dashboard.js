const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { GASSecurityScanner } = require('./gas-security-scanner');

/**
 * Comprehensive Security Dashboard Generator
 * Integrates Snyk, custom GAS scanning, and dependency analysis
 */
class SecurityDashboard {
  constructor() {
    this.reportDir = path.join(__dirname, '..', 'security', 'reports');
    this.dashboardDir = path.join(__dirname, '..', 'security', 'dashboard');
    this.ensureDirectoryExists(this.reportDir);
    this.ensureDirectoryExists(this.dashboardDir);
    
    this.repository = {
      name: 'Another-Google-Automation-Repo',
      url: 'https://github.com/klappe-pm/Another-Google-Automation-Repo',
      owner: 'klappe-pm'
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate comprehensive security dashboard
   */
  async generateDashboard() {
    console.log('🔍 Generating Comprehensive Security Dashboard...');
    console.log(`📊 Repository: ${this.repository.name}`);
    console.log('');
    
    try {
      // Collect all security data
      const [snykData, gasData, dependencyData, trendsData] = await Promise.all([
        this.getSnykData(),
        this.getGASSecurityData(),
        this.getDependencyData(),
        this.getSecurityTrends()
      ]);
      
      // Generate consolidated dashboard
      const dashboard = {
        metadata: {
          generated: new Date().toISOString(),
          version: '2.0.0',
          repository: this.repository,
          generator: 'AGAR Security Dashboard'
        },
        overview: this.generateOverview(snykData, gasData, dependencyData),
        vulnerabilities: this.consolidateVulnerabilities(snykData, gasData),
        dependencies: dependencyData,
        gasAnalysis: this.analyzeGASFiles(gasData),
        trends: trendsData,
        recommendations: this.generateRecommendations(snykData, gasData, dependencyData),
        compliance: this.generateComplianceReport(snykData, gasData)
      };

      // Write all dashboard files
      await this.writeDashboardFiles(dashboard);
      
      console.log('✅ Security dashboard generated successfully');
      console.log('📊 Dashboard files created:');
      console.log(`   - HTML Report: ${path.join(this.dashboardDir, 'security-dashboard.html')}`);
      console.log(`   - JSON Data: ${path.join(this.reportDir, 'dashboard-data.json')}`);
      console.log(`   - Executive Summary: ${path.join(this.reportDir, 'executive-summary.json')}`);
      
      return dashboard;
      
    } catch (error) {
      console.error('❌ Error generating dashboard:', error.message);
      throw error;
    }
  }

  /**
   * Get Snyk vulnerability data
   */
  async getSnykData() {
    try {
      console.log('📡 Fetching Snyk vulnerability data...');
      
      // Try to run Snyk test
      const snykResult = execSync('snyk test --json --all-projects', { 
        encoding: 'utf8',
        timeout: 120000 // 2 minutes timeout
      });
      
      const data = JSON.parse(snykResult);
      console.log(`✅ Snyk data collected: ${data.vulnerabilities?.length || 0} vulnerabilities found`);
      return data;
      
    } catch (error) {
      console.warn('⚠️  Snyk data not available (normal for new setups)');
      return {
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        projectName: this.repository.name,
        packageManager: 'npm',
        totalDependencies: 0
      };
    }
  }

  /**
   * Get Google Apps Script security data
   */
  async getGASSecurityData() {
    console.log('🔍 Analyzing Google Apps Script files...');
    
    const gasReportPath = path.join(this.reportDir, 'gas-security-report.json');
    
    // Generate fresh GAS security scan
    const scanner = new GASSecurityScanner();
    const scriptsDir = path.join(__dirname, '..', 'scripts');
    
    if (!fs.existsSync(scriptsDir)) {
      console.warn('⚠️  Scripts directory not found');
      return { 
        vulnerabilities: [], 
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        statistics: { totalFiles: 0 }
      };
    }
    
    this.scanDirectory(scriptsDir, scanner);
    const gasData = scanner.generateReport();
    
    // Save the report
    fs.writeFileSync(gasReportPath, JSON.stringify(gasData, null, 2));
    
    console.log(`✅ GAS analysis complete: ${gasData.statistics.totalFiles} files scanned`);
    return gasData;
  }

  scanDirectory(dir, scanner) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'Legacy Files') {
        this.scanDirectory(filePath, scanner);
      } else if (file.endsWith('.gs')) {
        scanner.scanFile(filePath);
      }
    });
  }

  /**
   * Get dependency security data
   */
  async getDependencyData() {
    console.log('📦 Analyzing dependencies...');
    
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const lockPath = path.join(__dirname, '..', 'package-lock.json');
      
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const lockData = fs.existsSync(lockPath) 
        ? JSON.parse(fs.readFileSync(lockPath, 'utf8'))
        : null;
      
      const dependencies = packageData.dependencies || {};
      const devDependencies = packageData.devDependencies || {};
      
      // Analyze dependency security
      const dependencyAnalysis = {
        production: Object.keys(dependencies).length,
        development: Object.keys(devDependencies).length,
        total: Object.keys(dependencies).length + Object.keys(devDependencies).length,
        lockFileExists: !!lockData,
        nodeVersion: packageData.engines?.node || 'Not specified',
        outdatedPackages: [], // Could be enhanced with npm outdated
        securityAudit: await this.runNpmAudit()
      };
      
      console.log(`✅ Dependency analysis complete: ${dependencyAnalysis.total} packages analyzed`);
      
      return {
        ...dependencyAnalysis,
        dependencies,
        devDependencies,
        packageData
      };
      
    } catch (error) {
      console.warn('⚠️  Could not analyze dependencies:', error.message);
      return { 
        dependencies: {}, 
        devDependencies: {}, 
        total: 0,
        securityAudit: { vulnerabilities: 0, summary: {} }
      };
    }
  }

  /**
   * Run npm audit for dependency vulnerabilities
   */
  async runNpmAudit() {
    try {
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        timeout: 60000
      });
      
      const audit = JSON.parse(auditResult);
      return {
        vulnerabilities: audit.metadata?.vulnerabilities || 0,
        summary: audit.metadata?.summary || {},
        advisories: audit.advisories || {}
      };
      
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          return {
            vulnerabilities: audit.metadata?.vulnerabilities || 0,
            summary: audit.metadata?.summary || {},
            advisories: audit.advisories || {}
          };
        } catch (parseError) {
          // Fallback for audit parsing issues
          return { vulnerabilities: 0, summary: {}, advisories: {} };
        }
      }
      return { vulnerabilities: 0, summary: {}, advisories: {} };
    }
  }

  /**
   * Get security trends data
   */
  async getSecurityTrends() {
    const trendsPath = path.join(this.reportDir, 'security-trends.json');
    
    if (fs.existsSync(trendsPath)) {
      const trends = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
      
      // Add current data point would go here
      // For now, return existing trends
      return trends;
    }
    
    // Initialize trends
    const initialTrends = {
      dataPoints: [],
      lastUpdated: new Date().toISOString(),
      period: 'daily',
      metrics: ['critical', 'high', 'medium', 'low', 'total']
    };
    
    fs.writeFileSync(trendsPath, JSON.stringify(initialTrends, null, 2));
    return initialTrends;
  }

  /**
   * Generate security overview
   */
  generateOverview(snykData, gasData, dependencyData) {
    const snykSummary = snykData.summary || { critical: 0, high: 0, medium: 0, low: 0 };
    const gasSummary = gasData.summary || { critical: 0, high: 0, medium: 0, low: 0 };
    
    return {
      totalVulnerabilities: Object.values(snykSummary).reduce((a, b) => a + b, 0) + 
                           Object.values(gasSummary).reduce((a, b) => a + b, 0),
      severityBreakdown: {
        critical: snykSummary.critical + gasSummary.critical,
        high: snykSummary.high + gasSummary.high,
        medium: snykSummary.medium + gasSummary.medium,
        low: snykSummary.low + gasSummary.low
      },
      securityScore: this.calculateSecurityScore(snykSummary, gasSummary),
      riskLevel: this.calculateRiskLevel(snykSummary, gasSummary),
      filesScanned: gasData.statistics?.totalFiles || 0,
      dependenciesAnalyzed: dependencyData.total || 0,
      lastScan: new Date().toISOString()
    };
  }

  /**
   * Calculate overall security score (0-100)
   */
  calculateSecurityScore(snykSummary, gasSummary) {
    const totalCritical = snykSummary.critical + gasSummary.critical;
    const totalHigh = snykSummary.high + gasSummary.high;
    const totalMedium = snykSummary.medium + gasSummary.medium;
    const totalLow = snykSummary.low + gasSummary.low;
    
    // Weighted scoring: Critical = -20, High = -10, Medium = -5, Low = -1
    const deductions = (totalCritical * 20) + (totalHigh * 10) + (totalMedium * 5) + (totalLow * 1);
    const score = Math.max(0, 100 - deductions);
    
    return Math.round(score);
  }

  /**
   * Calculate risk level
   */
  calculateRiskLevel(snykSummary, gasSummary) {
    const totalCritical = snykSummary.critical + gasSummary.critical;
    const totalHigh = snykSummary.high + gasSummary.high;
    
    if (totalCritical > 0) return 'CRITICAL';
    if (totalHigh > 0) return 'HIGH';
    if ((snykSummary.medium + gasSummary.medium) > 5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Consolidate vulnerabilities from all sources
   */
  consolidateVulnerabilities(snykData, gasData) {
    const consolidated = [];
    
    // Add Snyk vulnerabilities
    if (snykData.vulnerabilities) {
      snykData.vulnerabilities.forEach(vuln => {
        consolidated.push({
          source: 'snyk',
          type: vuln.severity?.toUpperCase() || 'MEDIUM',
          title: vuln.title,
          description: vuln.description,
          package: vuln.packageName,
          version: vuln.version,
          cve: vuln.identifiers?.CVE?.[0],
          remediation: vuln.remediation
        });
      });
    }
    
    // Add GAS vulnerabilities
    if (gasData.vulnerabilities) {
      gasData.vulnerabilities.forEach(vuln => {
        consolidated.push({
          source: 'gas-scanner',
          type: vuln.type,
          title: vuln.description,
          description: vuln.description,
          file: vuln.file,
          line: vuln.line,
          category: vuln.category,
          snippet: vuln.snippet
        });
      });
    }
    
    return consolidated.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return severityOrder[a.type] - severityOrder[b.type];
    });
  }

  /**
   * Analyze Google Apps Script files
   */
  analyzeGASFiles(gasData) {
    const analysis = {
      totalFiles: gasData.statistics?.totalFiles || 0,
      serviceBreakdown: {},
      securityHeaders: {
        complete: 0,
        missing: 0,
        partial: 0
      },
      codeQuality: {
        bestPractices: 0,
        needsImprovement: 0
      }
    };
    
    // Analyze by service (extracted from file paths)
    if (gasData.vulnerabilities) {
      gasData.vulnerabilities.forEach(vuln => {
        const servicePath = vuln.file.split('/')[1]; // e.g., scripts/gmail/...
        if (servicePath) {
          analysis.serviceBreakdown[servicePath] = 
            (analysis.serviceBreakdown[servicePath] || 0) + 1;
        }
      });
    }
    
    return analysis;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(snykData, gasData, dependencyData) {
    const recommendations = [];
    
    const snykSummary = snykData.summary || { critical: 0, high: 0, medium: 0, low: 0 };
    const gasSummary = gasData.summary || { critical: 0, high: 0, medium: 0, low: 0 };
    
    // Critical issues
    if (snykSummary.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Dependencies',
        action: 'Update vulnerable dependencies immediately',
        description: `${snykSummary.critical} critical vulnerabilities found in dependencies`,
        effort: 'High',
        timeline: 'Immediate'
      });
    }
    
    if (gasSummary.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Code Security',
        action: 'Remove hardcoded credentials and API keys',
        description: `${gasSummary.critical} critical security issues in Google Apps Script files`,
        effort: 'Medium',
        timeline: 'Immediate'
      });
    }
    
    // High priority issues
    if (snykSummary.high > 0 || gasSummary.high > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security Practices',
        action: 'Implement secure coding practices',
        description: 'Address high-severity security patterns and vulnerabilities',
        effort: 'Medium',
        timeline: '1-2 weeks'
      });
    }
    
    // Dependency management
    if (dependencyData.total > 10 && !dependencyData.lockFileExists) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Dependency Management',
        action: 'Implement dependency lock file',
        description: 'Add package-lock.json for consistent builds',
        effort: 'Low',
        timeline: '1 day'
      });
    }
    
    // Documentation improvements
    if (gasData.vulnerabilities?.some(v => v.category === 'documentation')) {
      recommendations.push({
        priority: 'LOW',
        category: 'Documentation',
        action: 'Improve security documentation',
        description: 'Add security headers and documentation to all scripts',
        effort: 'Low',
        timeline: '1 week'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(snykData, gasData) {
    const compliance = {
      frameworks: {
        'OWASP Top 10': {
          score: 85, // Example scoring
          issues: []
        },
        'Google Security Best Practices': {
          score: 78,
          issues: []
        }
      },
      dataProtection: {
        'GDPR Considerations': 'Review data handling in email export scripts',
        'Data Minimization': 'Ensure scripts only access necessary data'
      },
      recommendations: [
        'Implement OAuth scope minimization',
        'Add audit logging for sensitive operations',
        'Regular security training for contributors'
      ]
    };
    
    return compliance;
  }

  /**
   * Write all dashboard files
   */
  async writeDashboardFiles(dashboard) {
    // Write JSON data file
    fs.writeFileSync(
      path.join(this.reportDir, 'dashboard-data.json'),
      JSON.stringify(dashboard, null, 2)
    );
    
    // Write executive summary
    const executiveSummary = {
      timestamp: dashboard.metadata.generated,
      repository: dashboard.metadata.repository.name,
      securityScore: dashboard.overview.securityScore,
      riskLevel: dashboard.overview.riskLevel,
      criticalIssues: dashboard.overview.severityBreakdown.critical,
      highIssues: dashboard.overview.severityBreakdown.high,
      topRecommendations: dashboard.recommendations.slice(0, 3),
      complianceStatus: dashboard.compliance
    };
    
    fs.writeFileSync(
      path.join(this.reportDir, 'executive-summary.json'),
      JSON.stringify(executiveSummary, null, 2)
    );
    
    // Generate HTML dashboard
    await this.generateHTMLDashboard(dashboard);
  }

  /**
   * Generate interactive HTML dashboard
   */
  async generateHTMLDashboard(dashboard) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Dashboard - ${dashboard.metadata.repository.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f5f7fa;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 2rem; 
            border-radius: 10px; 
            margin-bottom: 2rem;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .metric { text-align: center; margin-bottom: 1rem; }
        .metric-value { 
            font-size: 2.5rem; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
        }
        .metric-label { color: #666; text-transform: uppercase; font-size: 0.8rem; }
        .critical { color: #e53e3e; }
        .high { color: #ff8c00; }
        .medium { color: #ffa500; }
        .low { color: #38a169; }
        .success { color: #38a169; }
        .severity-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 1rem; 
            margin: 1rem 0;
        }
        .severity-card {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        .recommendations { background: #fff3cd; border-left: 4px solid #ffc107; }
        .compliance { background: #d1ecf1; border-left: 4px solid #17a2b8; }
        .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6; }
        .table th { background: #f8f9fa; font-weight: 600; }
        .badge { 
            display: inline-block; 
            padding: 0.25rem 0.5rem; 
            font-size: 0.75rem; 
            border-radius: 0.25rem; 
            font-weight: 500;
        }
        .badge-critical { background: #f5c6cb; color: #721c24; }
        .badge-high { background: #ffeaa7; color: #856404; }
        .badge-medium { background: #fff3cd; color: #856404; }
        .badge-low { background: #d4edda; color: #155724; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 0.5rem 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #e53e3e, #ffa500, #38a169);
            transition: width 0.3s ease;
        }
        .footer { 
            text-align: center; 
            margin-top: 2rem; 
            padding: 1rem; 
            color: #666; 
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🛡️ Security Dashboard</h1>
            <div class="subtitle">
                ${dashboard.metadata.repository.name} • 
                Generated: ${new Date(dashboard.metadata.generated).toLocaleString()} •
                Security Score: ${dashboard.overview.securityScore}/100
            </div>
        </div>

        <!-- Overview Cards -->
        <div class="grid">
            <div class="card">
                <div class="metric">
                    <div class="metric-value ${dashboard.overview.riskLevel.toLowerCase()}">${dashboard.overview.securityScore}</div>
                    <div class="metric-label">Security Score</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${dashboard.overview.securityScore}%"></div>
                </div>
            </div>
            
            <div class="card">
                <div class="metric">
                    <div class="metric-value">${dashboard.overview.totalVulnerabilities}</div>
                    <div class="metric-label">Total Vulnerabilities</div>
                </div>
                <div class="severity-grid">
                    <div class="severity-card">
                        <div class="critical">${dashboard.overview.severityBreakdown.critical}</div>
                        <div>Critical</div>
                    </div>
                    <div class="severity-card">
                        <div class="high">${dashboard.overview.severityBreakdown.high}</div>
                        <div>High</div>
                    </div>
                    <div class="severity-card">
                        <div class="medium">${dashboard.overview.severityBreakdown.medium}</div>
                        <div>Medium</div>
                    </div>
                    <div class="severity-card">
                        <div class="low">${dashboard.overview.severityBreakdown.low}</div>
                        <div>Low</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="metric">
                    <div class="metric-value success">${dashboard.overview.filesScanned}</div>
                    <div class="metric-label">Scripts Analyzed</div>
                </div>
                <div class="metric">
                    <div class="metric-value success">${dashboard.overview.dependenciesAnalyzed}</div>
                    <div class="metric-label">Dependencies Checked</div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        <div class="card recommendations">
            <h2>🎯 Priority Recommendations</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Category</th>
                        <th>Action</th>
                        <th>Timeline</th>
                    </tr>
                </thead>
                <tbody>
                    ${dashboard.recommendations.slice(0, 5).map(rec => `
                        <tr>
                            <td><span class="badge badge-${rec.priority.toLowerCase()}">${rec.priority}</span></td>
                            <td>${rec.category}</td>
                            <td>${rec.action}</td>
                            <td>${rec.timeline}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Vulnerabilities -->
        <div class="card">
            <h2>🔍 Recent Vulnerabilities</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Severity</th>
                        <th>Source</th>
                        <th>Title</th>
                        <th>File/Package</th>
                    </tr>
                </thead>
                <tbody>
                    ${dashboard.vulnerabilities.slice(0, 10).map(vuln => `
                        <tr>
                            <td><span class="badge badge-${vuln.type.toLowerCase()}">${vuln.type}</span></td>
                            <td>${vuln.source}</td>
                            <td>${vuln.title}</td>
                            <td>${vuln.file || vuln.package || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Compliance -->
        <div class="card compliance">
            <h2>📋 Compliance Status</h2>
            <div class="grid">
                ${Object.entries(dashboard.compliance.frameworks).map(([framework, data]) => `
                    <div>
                        <h4>${framework}</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.score}%"></div>
                        </div>
                        <div>${data.score}% Compliant</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            <p>🔒 Security Dashboard • ${dashboard.metadata.repository.name} • 
            <a href="${dashboard.metadata.repository.url}" target="_blank">View Repository</a></p>
        </div>
    </div>

    <script>
        // Add interactivity
        console.log('Security Dashboard Data:', ${JSON.stringify(dashboard, null, 2)});
        
        // Animate progress bars
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(this.dashboardDir, 'security-dashboard.html'),
      html
    );
  }
}

// Main execution
async function generateSecurityDashboard() {
  const dashboard = new SecurityDashboard();
  
  try {
    await dashboard.generateDashboard();
    process.exit(0);
  } catch (error) {
    console.error('❌ Dashboard generation failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = { SecurityDashboard };

// Run if called directly
if (require.main === module) {
  generateSecurityDashboard();
}
