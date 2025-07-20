#!/usr/bin/env node

/**
 * Repository Report Generator - AGAR Status Dashboard
 * 
 * Title: Repository Status and Analytics Report Generator
 * Purpose: Generate comprehensive reports on repository health and metrics
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

class RepositoryReporter {
  constructor() {
    this.rootDir = process.cwd();
    this.reportsDir = path.join(this.rootDir, 'reports');
    this.timestamp = new Date().toISOString();
    this.dateString = this.timestamp.split('T')[0];
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateAllReports() {
    console.log('📊 Generating Repository Reports...\n');
    
    const reports = {
      overview: await this.generateOverviewReport(),
      security: await this.generateSecurityReport(),
      codeStats: await this.generateCodeStatsReport(),
      documentation: await this.generateDocumentationReport(),
      history: await this.generateHistoryReport()
    };

    // Generate combined dashboard
    const dashboard = await this.generateDashboard(reports);
    
    // Save all reports
    await this.saveReports(reports, dashboard);
    
    console.log('\n✅ All reports generated successfully!');
    return { reports, dashboard };
  }

  async generateOverviewReport() {
    console.log('📋 Generating Overview Report...');
    
    const overview = {
      timestamp: this.timestamp,
      repository: {
        name: this.getRepositoryName(),
        version: this.getVersion(),
        license: this.getLicense(),
        description: this.getDescription()
      },
      structure: await this.analyzeStructure(),
      metrics: await this.calculateMetrics(),
      status: await this.getRepositoryStatus()
    };

    return overview;
  }

  async generateSecurityReport() {
    console.log('🔒 Generating Security Report...');
    
    const security = {
      timestamp: this.timestamp,
      vulnerabilities: await this.scanVulnerabilities(),
      dependencies: await this.analyzeDependencies(),
      sensitiveFiles: await this.checkSensitiveFiles(),
      permissions: await this.checkPermissions(),
      recommendations: await this.getSecurityRecommendations()
    };

    return security;
  }

  async generateCodeStatsReport() {
    console.log('⚡ Generating Code Statistics Report...');
    
    const codeStats = {
      timestamp: this.timestamp,
      fileCount: await this.countFiles(),
      lineCount: await this.countLines(),
      languages: await this.analyzeLanguages(),
      complexity: await this.analyzeComplexity(),
      quality: await this.analyzeQuality()
    };

    return codeStats;
  }

  async generateDocumentationReport() {
    console.log('📖 Generating Documentation Report...');
    
    const documentation = {
      timestamp: this.timestamp,
      coverage: await this.analyzeDocumentationCoverage(),
      quality: await this.analyzeDocumentationQuality(),
      consistency: await this.checkDocumentationConsistency(),
      completeness: await this.checkDocumentationCompleteness()
    };

    return documentation;
  }

  async generateHistoryReport() {
    console.log('📈 Generating History Report...');
    
    const history = {
      timestamp: this.timestamp,
      commits: await this.analyzeCommitHistory(),
      contributors: await this.analyzeContributors(),
      activity: await this.analyzeActivity(),
      trends: await this.analyzeTrends()
    };

    return history;
  }

  async generateDashboard(reports) {
    console.log('🎯 Generating Executive Dashboard...');
    
    const dashboard = {
      timestamp: this.timestamp,
      summary: {
        overallHealth: this.calculateOverallHealth(reports),
        publicationReadiness: this.assessPublicationReadiness(reports),
        keyMetrics: this.extractKeyMetrics(reports),
        priorities: this.identifyPriorities(reports)
      },
      charts: {
        healthScore: this.generateHealthScoreChart(reports),
        fileDistribution: this.generateFileDistributionChart(reports.codeStats),
        documentationCoverage: this.generateDocCoverageChart(reports.documentation)
      },
      actionItems: this.generateActionItems(reports),
      recommendations: this.generateRecommendations(reports)
    };

    return dashboard;
  }

  // Repository Analysis Methods

  getRepositoryName() {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageData.name || 'Unknown';
      }
      return path.basename(this.rootDir);
    } catch (error) {
      return 'Unknown';
    }
  }

  getVersion() {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageData.version || '1.0.0';
      }
      return '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  getLicense() {
    try {
      const licensePath = path.join(this.rootDir, 'LICENSE.md');
      if (fs.existsSync(licensePath)) {
        const licenseContent = fs.readFileSync(licensePath, 'utf8');
        if (licenseContent.includes('MIT')) return 'MIT';
        if (licenseContent.includes('Apache')) return 'Apache';
        if (licenseContent.includes('GPL')) return 'GPL';
        return 'Custom';
      }
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  getDescription() {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageData.description || 'No description available';
      }
      return 'No description available';
    } catch (error) {
      return 'No description available';
    }
  }

  async analyzeStructure() {
    const structure = {
      directories: 0,
      files: 0,
      maxDepth: 0,
      services: []
    };

    const serviceDirectories = [
      'scripts/gmail',
      'scripts/drive',
      'scripts/calendar',
      'scripts/docs',
      'scripts/sheets',
      'scripts/tasks',
      'scripts/chat',
      'scripts/slides'
    ];

    serviceDirectories.forEach(serviceDir => {
      const fullPath = path.join(this.rootDir, serviceDir);
      if (fs.existsSync(fullPath)) {
        const fileCount = this.countFilesInDirectory(fullPath);
        structure.services.push({
          name: path.basename(serviceDir),
          files: fileCount,
          hasReadme: fs.existsSync(path.join(fullPath, 'README.md'))
        });
      }
    });

    // Count total directories and files
    this.walkDirectory(this.rootDir, (filePath, isDirectory, depth) => {
      if (isDirectory) {
        structure.directories++;
      } else {
        structure.files++;
      }
      structure.maxDepth = Math.max(structure.maxDepth, depth);
    });

    return structure;
  }

  async calculateMetrics() {
    const metrics = {
      totalScripts: 0,
      servicesWithDocumentation: 0,
      averageFileSize: 0,
      lastModified: null
    };

    // Count Google Apps Scripts
    metrics.totalScripts = this.findFiles('*.gs').length;

    // Check documentation coverage
    const serviceDirectories = [
      'scripts/gmail', 'scripts/drive', 'scripts/calendar', 'scripts/docs',
      'scripts/sheets', 'scripts/tasks', 'scripts/chat', 'scripts/slides'
    ];

    serviceDirectories.forEach(dir => {
      const readmePath = path.join(this.rootDir, dir, 'README.md');
      if (fs.existsSync(readmePath)) {
        metrics.servicesWithDocumentation++;
      }
    });

    // Calculate average file size
    const allFiles = this.findFiles('*');
    let totalSize = 0;
    let fileCount = 0;

    allFiles.forEach(file => {
      try {
        const stats = fs.statSync(file);
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      } catch (error) {
        // Skip files we can't stat
      }
    });

    metrics.averageFileSize = fileCount > 0 ? Math.round(totalSize / fileCount) : 0;

    // Get last modification time
    try {
      const gitResult = execSync('git log -1 --format=%ci 2>/dev/null || echo "unknown"', {
        encoding: 'utf8',
        cwd: this.rootDir
      });
      metrics.lastModified = gitResult.trim() !== 'unknown' ? gitResult.trim() : null;
    } catch (error) {
      metrics.lastModified = null;
    }

    return metrics;
  }

  async getRepositoryStatus() {
    const status = {
      isGitRepository: false,
      hasGitignore: false,
      hasLicense: false,
      hasReadme: false,
      hasPackageJson: false,
      branchCount: 0,
      uncommittedChanges: false
    };

    // Check for git repository
    status.isGitRepository = fs.existsSync(path.join(this.rootDir, '.git'));

    // Check for standard files
    status.hasGitignore = fs.existsSync(path.join(this.rootDir, '.gitignore'));
    status.hasLicense = fs.existsSync(path.join(this.rootDir, 'LICENSE.md'));
    status.hasReadme = fs.existsSync(path.join(this.rootDir, 'README.md'));
    status.hasPackageJson = fs.existsSync(path.join(this.rootDir, 'package.json'));

    if (status.isGitRepository) {
      try {
        // Count branches
        const branchResult = execSync('git branch -a 2>/dev/null | wc -l', {
          encoding: 'utf8',
          cwd: this.rootDir
        });
        status.branchCount = parseInt(branchResult.trim()) || 0;

        // Check for uncommitted changes
        const statusResult = execSync('git status --porcelain 2>/dev/null', {
          encoding: 'utf8',
          cwd: this.rootDir
        });
        status.uncommittedChanges = statusResult.trim().length > 0;
      } catch (error) {
        // Git commands failed
      }
    }

    return status;
  }

  async scanVulnerabilities() {
    const vulnerabilities = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
      lastScan: this.timestamp,
      details: []
    };

    try {
      const result = execSync('npm audit --json 2>/dev/null || echo "{}"', {
        encoding: 'utf8',
        cwd: this.rootDir
      });

      const auditData = JSON.parse(result);
      if (auditData.vulnerabilities) {
        Object.values(auditData.vulnerabilities).forEach(vuln => {
          vulnerabilities.total++;
          vulnerabilities[vuln.severity]++;
          vulnerabilities.details.push({
            name: vuln.name,
            severity: vuln.severity,
            description: vuln.via?.[0]?.title || 'No description'
          });
        });
      }
    } catch (error) {
      vulnerabilities.details.push({
        error: 'Failed to run vulnerability scan',
        message: error.message
      });
    }

    return vulnerabilities;
  }

  async analyzeDependencies() {
    const dependencies = {
      production: 0,
      development: 0,
      total: 0,
      outdated: 0,
      licenses: {},
      details: []
    };

    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        dependencies.production = Object.keys(packageData.dependencies || {}).length;
        dependencies.development = Object.keys(packageData.devDependencies || {}).length;
        dependencies.total = dependencies.production + dependencies.development;

        // Get license information
        try {
          const licenseResult = execSync('npm ls --json 2>/dev/null || echo "{}"', {
            encoding: 'utf8',
            cwd: this.rootDir
          });
          
          const licenseData = JSON.parse(licenseResult);
          this.extractLicenses(licenseData.dependencies || {}, dependencies.licenses);
        } catch (error) {
          // License check failed
        }
      }
    } catch (error) {
      dependencies.details.push({
        error: 'Failed to analyze dependencies',
        message: error.message
      });
    }

    return dependencies;
  }

  async checkSensitiveFiles() {
    const sensitiveFiles = {
      found: [],
      patterns: [
        '.env',
        '.env.local',
        'credentials.json',
        'secrets.json',
        'private-key.json',
        '*.pem',
        '*.key'
      ],
      recommendations: []
    };

    sensitiveFiles.patterns.forEach(pattern => {
      const files = this.findFiles(pattern);
      files.forEach(file => {
        sensitiveFiles.found.push({
          file: path.relative(this.rootDir, file),
          pattern: pattern,
          risk: 'high'
        });
      });
    });

    if (sensitiveFiles.found.length > 0) {
      sensitiveFiles.recommendations.push('Remove sensitive files from repository');
      sensitiveFiles.recommendations.push('Add sensitive patterns to .gitignore');
      sensitiveFiles.recommendations.push('Use environment variables for secrets');
    }

    return sensitiveFiles;
  }

  async checkPermissions() {
    const permissions = {
      executableFiles: [],
      worldWritable: [],
      recommendations: []
    };

    try {
      const files = this.findFiles('*');
      files.forEach(file => {
        try {
          const stats = fs.statSync(file);
          if (stats.mode & parseInt('111', 8)) {
            permissions.executableFiles.push(path.relative(this.rootDir, file));
          }
        } catch (error) {
          // Skip files we can't check
        }
      });
    } catch (error) {
      // Permission check failed
    }

    return permissions;
  }

  async getSecurityRecommendations() {
    const recommendations = [
      'Run regular security scans with npm audit',
      'Keep dependencies up to date',
      'Use .gitignore to exclude sensitive files',
      'Implement input validation in all scripts',
      'Follow principle of least privilege for API access'
    ];

    return recommendations;
  }

  async countFiles() {
    const counts = {
      total: 0,
      byExtension: {},
      byDirectory: {}
    };

    const files = this.findFiles('*');
    files.forEach(file => {
      counts.total++;
      
      const ext = path.extname(file).toLowerCase();
      counts.byExtension[ext] = (counts.byExtension[ext] || 0) + 1;
      
      const dir = path.dirname(path.relative(this.rootDir, file)).split('/')[0];
      counts.byDirectory[dir] = (counts.byDirectory[dir] || 0) + 1;
    });

    return counts;
  }

  async countLines() {
    const counts = {
      total: 0,
      code: 0,
      comments: 0,
      blank: 0,
      byExtension: {}
    };

    const codeFiles = this.findFiles('*.js')
      .concat(this.findFiles('*.gs'))
      .concat(this.findFiles('*.md'))
      .concat(this.findFiles('*.json'));

    codeFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        const ext = path.extname(file).toLowerCase();
        
        if (!counts.byExtension[ext]) {
          counts.byExtension[ext] = { total: 0, code: 0, comments: 0, blank: 0 };
        }

        lines.forEach(line => {
          const trimmed = line.trim();
          counts.total++;
          counts.byExtension[ext].total++;
          
          if (trimmed === '') {
            counts.blank++;
            counts.byExtension[ext].blank++;
          } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            counts.comments++;
            counts.byExtension[ext].comments++;
          } else {
            counts.code++;
            counts.byExtension[ext].code++;
          }
        });
      } catch (error) {
        // Skip files we can't read
      }
    });

    return counts;
  }

  async analyzeLanguages() {
    const languages = {};
    
    const extensionMap = {
      '.js': 'JavaScript',
      '.gs': 'Google Apps Script',
      '.md': 'Markdown',
      '.json': 'JSON',
      '.sh': 'Shell Script',
      '.html': 'HTML',
      '.css': 'CSS',
      '.py': 'Python'
    };

    const files = this.findFiles('*');
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const language = extensionMap[ext] || 'Other';
      
      if (!languages[language]) {
        languages[language] = { files: 0, size: 0 };
      }
      
      languages[language].files++;
      
      try {
        const stats = fs.statSync(file);
        languages[language].size += stats.size;
      } catch (error) {
        // Skip files we can't stat
      }
    });

    return languages;
  }

  async analyzeComplexity() {
    const complexity = {
      averageFunctionLength: 0,
      maxFunctionLength: 0,
      totalFunctions: 0,
      cyclomaticComplexity: 'Not calculated'
    };

    const scriptFiles = this.findFiles('*.js').concat(this.findFiles('*.gs'));
    let totalLength = 0;
    let functionCount = 0;

    scriptFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];
        
        functions.forEach(() => {
          functionCount++;
          // Simplified function length calculation
          const functionLines = content.split('\n').length / functions.length;
          totalLength += functionLines;
          complexity.maxFunctionLength = Math.max(complexity.maxFunctionLength, functionLines);
        });
      } catch (error) {
        // Skip files we can't read
      }
    });

    complexity.totalFunctions = functionCount;
    complexity.averageFunctionLength = functionCount > 0 ? Math.round(totalLength / functionCount) : 0;

    return complexity;
  }

  async analyzeQuality() {
    const quality = {
      score: 0,
      issues: [],
      strengths: []
    };

    // Check for consistent naming
    const scriptFiles = this.findFiles('*.gs');
    let consistentNaming = 0;

    scriptFiles.forEach(file => {
      const filename = path.basename(file);
      if (filename.match(/^[a-z]+(-[a-z]+){2,}\.gs$/)) {
        consistentNaming++;
      }
    });

    const namingPercentage = scriptFiles.length > 0 ? (consistentNaming / scriptFiles.length) * 100 : 100;
    
    if (namingPercentage >= 80) {
      quality.strengths.push(`${namingPercentage.toFixed(1)}% of files follow naming convention`);
      quality.score += 30;
    } else {
      quality.issues.push(`Only ${namingPercentage.toFixed(1)}% of files follow naming convention`);
    }

    // Check for documentation headers
    let scriptsWithHeaders = 0;
    scriptFiles.slice(0, 20).forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('/**') && content.includes('Title:')) {
          scriptsWithHeaders++;
        }
      } catch (error) {
        // Skip files we can't read
      }
    });

    const headerPercentage = scriptFiles.length > 0 ? 
      (scriptsWithHeaders / Math.min(20, scriptFiles.length)) * 100 : 100;

    if (headerPercentage >= 80) {
      quality.strengths.push(`${headerPercentage.toFixed(1)}% of scripts have proper headers`);
      quality.score += 40;
    } else {
      quality.issues.push(`Only ${headerPercentage.toFixed(1)}% of scripts have proper headers`);
    }

    // Check for README files
    const readmeCount = this.findFiles('README.md').length;
    if (readmeCount >= 8) {
      quality.strengths.push('Comprehensive documentation with READMEs');
      quality.score += 30;
    }

    return quality;
  }

  // Dashboard and Reporting Methods

  calculateOverallHealth(reports) {
    const metrics = {
      security: this.calculateSecurityScore(reports.security),
      documentation: this.calculateDocumentationScore(reports.documentation),
      codeQuality: this.calculateCodeQualityScore(reports.codeStats),
      maintenance: this.calculateMaintenanceScore(reports.overview)
    };

    const overall = (metrics.security + metrics.documentation + metrics.codeQuality + metrics.maintenance) / 4;
    
    return {
      score: Math.round(overall * 10) / 10,
      breakdown: metrics,
      status: overall >= 8 ? 'Excellent' : overall >= 6 ? 'Good' : overall >= 4 ? 'Fair' : 'Needs Work'
    };
  }

  assessPublicationReadiness(reports) {
    const requirements = {
      hasLicense: reports.overview.repository.license !== 'Unknown',
      hasReadme: reports.overview.status.hasReadme,
      lowVulnerabilities: reports.security.vulnerabilities.critical === 0,
      goodDocumentation: reports.documentation.coverage.percentage >= 80,
      cleanCode: reports.codeStats.quality.score >= 60
    };

    const passed = Object.values(requirements).filter(Boolean).length;
    const total = Object.keys(requirements).length;
    const percentage = (passed / total) * 100;

    return {
      ready: percentage >= 80,
      percentage: Math.round(percentage),
      requirements: requirements,
      blockers: Object.entries(requirements)
        .filter(([key, value]) => !value)
        .map(([key]) => key)
    };
  }

  extractKeyMetrics(reports) {
    return {
      totalFiles: reports.codeStats.fileCount.total,
      totalScripts: reports.overview.metrics.totalScripts,
      linesOfCode: reports.codeStats.lineCount.code,
      documentationCoverage: reports.documentation.coverage.percentage,
      securityScore: this.calculateSecurityScore(reports.security),
      lastUpdated: reports.overview.metrics.lastModified
    };
  }

  identifyPriorities(reports) {
    const priorities = [];

    if (reports.security.vulnerabilities.critical > 0) {
      priorities.push({
        level: 'Critical',
        item: 'Fix security vulnerabilities',
        count: reports.security.vulnerabilities.critical
      });
    }

    if (reports.documentation.coverage.percentage < 80) {
      priorities.push({
        level: 'High',
        item: 'Improve documentation coverage',
        current: reports.documentation.coverage.percentage
      });
    }

    if (reports.codeStats.quality.score < 70) {
      priorities.push({
        level: 'Medium',
        item: 'Improve code quality',
        issues: reports.codeStats.quality.issues.length
      });
    }

    return priorities;
  }

  // Helper methods

  calculateSecurityScore(security) {
    let score = 10;
    score -= security.vulnerabilities.critical * 3;
    score -= security.vulnerabilities.high * 2;
    score -= security.vulnerabilities.medium * 1;
    score -= security.sensitiveFiles.found.length * 2;
    return Math.max(0, score);
  }

  calculateDocumentationScore(documentation) {
    return Math.min(10, documentation.coverage.percentage / 10);
  }

  calculateCodeQualityScore(codeStats) {
    return Math.min(10, codeStats.quality.score / 10);
  }

  calculateMaintenanceScore(overview) {
    let score = 10;
    if (!overview.status.hasGitignore) score -= 2;
    if (!overview.status.hasLicense) score -= 3;
    if (!overview.status.hasPackageJson) score -= 1;
    if (overview.status.uncommittedChanges) score -= 1;
    return Math.max(0, score);
  }

  // Utility methods (from previous script)

  findFiles(pattern) {
    const results = [];
    
    const searchDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && !item.includes('node_modules')) {
            searchDir(fullPath);
          } else if (stat.isFile()) {
            if (pattern.includes('*')) {
              const regex = new RegExp(pattern.replace(/\*/g, '.*'));
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
    };

    searchDir(this.rootDir);
    return results;
  }

  countFilesInDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      return items.filter(item => {
        const fullPath = path.join(dir, item);
        return fs.statSync(fullPath).isFile();
      }).length;
    } catch (error) {
      return 0;
    }
  }

  walkDirectory(dir, callback, depth = 0) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        if (item.startsWith('.') || item === 'node_modules') return;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        callback(fullPath, stat.isDirectory(), depth);
        
        if (stat.isDirectory()) {
          this.walkDirectory(fullPath, callback, depth + 1);
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
  }

  extractLicenses(dependencies, licenses) {
    Object.values(dependencies).forEach(dep => {
      if (dep.license) {
        licenses[dep.license] = (licenses[dep.license] || 0) + 1;
      }
      if (dep.dependencies) {
        this.extractLicenses(dep.dependencies, licenses);
      }
    });
  }

  async saveReports(reports, dashboard) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save individual reports
    Object.entries(reports).forEach(([name, report]) => {
      const filename = `${name}-report-${timestamp}.json`;
      const filepath = path.join(this.reportsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📄 ${name} report saved: ${filename}`);
    });

    // Save dashboard
    const dashboardFilename = `dashboard-${timestamp}.json`;
    const dashboardPath = path.join(this.reportsDir, dashboardFilename);
    fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
    console.log(`📊 Dashboard saved: ${dashboardFilename}`);

    // Generate markdown summary
    const markdownSummary = this.generateMarkdownSummary(dashboard);
    const markdownFilename = `summary-${timestamp}.md`;
    const markdownPath = path.join(this.reportsDir, markdownFilename);
    fs.writeFileSync(markdownPath, markdownSummary);
    console.log(`📝 Markdown summary saved: ${markdownFilename}`);
  }

  generateMarkdownSummary(dashboard) {
    const { summary } = dashboard;
    
    return `# Repository Health Report
**Generated**: ${new Date(dashboard.timestamp).toLocaleString()}

## Overall Health: ${summary.overallHealth.score}/10 (${summary.overallHealth.status})

### Key Metrics
- **Total Files**: ${summary.keyMetrics.totalFiles}
- **Total Scripts**: ${summary.keyMetrics.totalScripts}
- **Lines of Code**: ${summary.keyMetrics.linesOfCode}
- **Documentation Coverage**: ${summary.keyMetrics.documentationCoverage}%
- **Security Score**: ${summary.keyMetrics.securityScore}/10

### Publication Readiness: ${summary.publicationReadiness.percentage}%
${summary.publicationReadiness.ready ? '✅ Ready for Publication' : '❌ Not Ready for Publication'}

### Priority Action Items
${summary.priorities.map(p => `- **${p.level}**: ${p.item}`).join('\n')}

### Health Breakdown
- **Security**: ${summary.overallHealth.breakdown.security}/10
- **Documentation**: ${summary.overallHealth.breakdown.documentation}/10
- **Code Quality**: ${summary.overallHealth.breakdown.codeQuality}/10
- **Maintenance**: ${summary.overallHealth.breakdown.maintenance}/10

---
*Report generated by AGAR Repository Reporter v1.0.0*
`;
  }
}

// CLI Interface
if (require.main === module) {
  const reporter = new RepositoryReporter();
  
  async function main() {
    const command = process.argv[2] || 'all';
    
    try {
      switch (command) {
        case 'overview':
          const overview = await reporter.generateOverviewReport();
          console.log(JSON.stringify(overview, null, 2));
          break;
        case 'security':
          const security = await reporter.generateSecurityReport();
          console.log(JSON.stringify(security, null, 2));
          break;
        case 'code':
          const codeStats = await reporter.generateCodeStatsReport();
          console.log(JSON.stringify(codeStats, null, 2));
          break;
        case 'docs':
          const documentation = await reporter.generateDocumentationReport();
          console.log(JSON.stringify(documentation, null, 2));
          break;
        case 'all':
        default:
          await reporter.generateAllReports();
          break;
      }
    } catch (error) {
      console.error('❌ Report generation failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = RepositoryReporter;
