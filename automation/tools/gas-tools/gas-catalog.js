#!/usr/bin/env node

/**
 * Google Apps Script Catalog Generator
 * Automatically generates and maintains a catalog of all scripts
 * 
 * Usage:
 *   node gas-catalog.js                # Generate catalog
 *   node gas-catalog.js --watch        # Watch for changes
 *   node gas-catalog.js --json         # Output as JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GASCatalog {
  constructor(options = {}) {
    this.options = {
      output: options.output || 'docs/SCRIPT_CATALOG.md',
      jsonOutput: options.jsonOutput || 'docs/script-catalog.json',
      watch: options.watch || false,
      format: options.format || 'markdown',
      ...options
    };
    
    this.scripts = [];
    this.serviceGroups = {};
    this.stats = {
      total: 0,
      documented: 0,
      withSetup: 0,
      byService: {},
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate the catalog
   */
  async generate() {
    console.log('🔍 Scanning for Google Apps Scripts...');
    
    // Find all scripts
    this.findScripts();
    
    // Group by service
    this.groupByService();
    
    // Calculate statistics
    this.calculateStats();
    
    // Generate output
    if (this.options.format === 'json') {
      this.generateJSON();
    } else {
      this.generateMarkdown();
    }
    
    console.log(`✅ Catalog generated: ${this.scripts.length} scripts found`);
    
    // Set up watch mode if requested
    if (this.options.watch) {
      this.watchForChanges();
    }
  }

  /**
   * Find all .gs scripts in the apps directory
   */
  findScripts() {
    const appsDir = path.join(process.cwd(), 'apps');
    this.scanDirectory(appsDir);
    
    // Sort scripts by service and name
    this.scripts.sort((a, b) => {
      if (a.service !== b.service) {
        return a.service.localeCompare(b.service);
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Recursively scan directory for .gs files
   */
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        this.scanDirectory(fullPath);
      } else if (file.endsWith('.gs')) {
        const scriptInfo = this.extractScriptInfo(fullPath);
        if (scriptInfo) {
          this.scripts.push(scriptInfo);
        }
      }
    }
  }

  /**
   * Extract metadata from script file
   */
  extractScriptInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      const stat = fs.statSync(filePath);
      
      // Extract header information
      const headerMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
      const summaryMatch = content.match(/\/\*([\s\S]*?Script Summary:[\s\S]*?)\*\//);
      
      const info = {
        path: relativePath,
        name: path.basename(filePath),
        service: this.extractField(content, 'Service:') || this.detectService(filePath),
        title: this.extractField(content, 'Title:') || this.generateTitle(path.basename(filePath)),
        purpose: this.extractField(content, 'Purpose:') || 'No purpose documented',
        created: this.extractField(content, 'Created:') || 'Unknown',
        updated: this.extractField(content, 'Updated:') || 'Unknown',
        author: this.extractField(content, 'Author:') || 'Unknown',
        hasHeader: !!headerMatch,
        hasSummary: !!summaryMatch,
        features: [],
        setupSteps: [],
        servicesUsed: [],
        fileSize: stat.size,
        lastModified: stat.mtime.toISOString().split('T')[0]
      };
      
      // Extract features
      if (summaryMatch) {
        const featuresMatch = summaryMatch[1].match(/Key Features:([\s\S]*?)(?=- Services Used:|$)/);
        if (featuresMatch) {
          info.features = featuresMatch[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.trim().substring(2).trim());
        }
        
        // Extract services used
        const servicesMatch = summaryMatch[1].match(/Services Used:\s*(.+)/);
        if (servicesMatch) {
          info.servicesUsed = servicesMatch[1].split(',').map(s => s.trim());
        }
        
        // Extract setup steps
        const setupMatch = summaryMatch[1].match(/Setup:([\s\S]*?)(?=\*\/|$)/);
        if (setupMatch) {
          info.setupSteps = setupMatch[1]
            .split('\n')
            .filter(line => line.trim().match(/^\d+\./))
            .map(line => line.trim());
          info.hasSetup = info.setupSteps.length > 0;
        }
      }
      
      // Calculate documentation completeness
      info.documentationScore = this.calculateDocScore(info);
      
      return info;
      
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract field value from content
   */
  extractField(content, field) {
    const regex = new RegExp(`\\* ${field}\\s*(.+)`);
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Detect service from file path
   */
  detectService(filePath) {
    const serviceMap = {
      'gmail': 'Gmail',
      'drive': 'Google Drive',
      'sheets': 'Google Sheets',
      'docs': 'Google Docs',
      'calendar': 'Google Calendar',
      'tasks': 'Google Tasks',
      'photos': 'Google Photos',
      'chat': 'Google Chat',
      'utility': 'Utility'
    };
    
    const parts = filePath.toLowerCase().split(path.sep);
    for (const part of parts) {
      if (serviceMap[part]) {
        return serviceMap[part];
      }
    }
    
    return 'Unknown';
  }

  /**
   * Generate title from filename
   */
  generateTitle(filename) {
    return filename
      .replace('.gs', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Calculate documentation completeness score
   */
  calculateDocScore(info) {
    let score = 0;
    const checks = [
      info.hasHeader,
      info.hasSummary,
      info.purpose !== 'No purpose documented',
      info.features.length >= 3,
      info.setupSteps.length >= 3,
      info.servicesUsed.length > 0,
      info.author !== 'Unknown',
      info.created !== 'Unknown'
    ];
    
    checks.forEach(check => {
      if (check) score += 12.5;
    });
    
    return Math.round(score);
  }

  /**
   * Group scripts by service
   */
  groupByService() {
    this.serviceGroups = {};
    
    this.scripts.forEach(script => {
      if (!this.serviceGroups[script.service]) {
        this.serviceGroups[script.service] = [];
      }
      this.serviceGroups[script.service].push(script);
    });
  }

  /**
   * Calculate statistics
   */
  calculateStats() {
    this.stats.total = this.scripts.length;
    this.stats.documented = this.scripts.filter(s => s.hasHeader && s.hasSummary).length;
    this.stats.withSetup = this.scripts.filter(s => s.hasSetup).length;
    
    // Count by service
    Object.keys(this.serviceGroups).forEach(service => {
      this.stats.byService[service] = this.serviceGroups[service].length;
    });
    
    // Calculate average documentation score
    const totalScore = this.scripts.reduce((sum, s) => sum + s.documentationScore, 0);
    this.stats.averageDocScore = Math.round(totalScore / this.scripts.length);
    
    // Find recently updated
    this.stats.recentlyUpdated = this.scripts
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified))
      .slice(0, 5)
      .map(s => ({ name: s.name, date: s.lastModified }));
  }

  /**
   * Generate markdown catalog
   */
  generateMarkdown() {
    const output = [];
    
    // Header
    output.push('# Google Apps Script Catalog');
    output.push('');
    output.push(`Last Updated: ${new Date().toLocaleString()}`);
    output.push('');
    
    // Summary section
    output.push('## Summary');
    output.push(`- **Total Scripts**: ${this.stats.total}`);
    output.push(`- **Fully Documented**: ${this.stats.documented} (${Math.round(this.stats.documented / this.stats.total * 100)}%)`);
    output.push(`- **With Setup Instructions**: ${this.stats.withSetup} (${Math.round(this.stats.withSetup / this.stats.total * 100)}%)`);
    output.push(`- **Average Documentation Score**: ${this.stats.averageDocScore}%`);
    output.push('');
    
    // Service breakdown
    output.push('### Scripts by Service');
    Object.entries(this.stats.byService)
      .sort((a, b) => b[1] - a[1])
      .forEach(([service, count]) => {
        output.push(`- ${service}: ${count} scripts`);
      });
    output.push('');
    
    // Recently updated
    output.push('### Recently Updated');
    this.stats.recentlyUpdated.forEach(script => {
      output.push(`- ${script.name} (${script.date})`);
    });
    output.push('');
    
    // Scripts by service
    output.push('## Scripts by Service');
    output.push('');
    
    Object.entries(this.serviceGroups).forEach(([service, scripts]) => {
      output.push(`### ${service} (${scripts.length} scripts)`);
      output.push('');
      output.push('| Script | Purpose | Doc Score | Setup | Last Updated |');
      output.push('|--------|---------|-----------|-------|--------------|');
      
      scripts.forEach(script => {
        const name = `[${script.name}](${script.path})`;
        const docScore = `${script.documentationScore}%`;
        const hasSetup = script.hasSetup ? '✅' : '❌';
        
        output.push(`| ${name} | ${script.purpose} | ${docScore} | ${hasSetup} | ${script.lastModified} |`);
      });
      
      output.push('');
    });
    
    // Detailed script information
    output.push('## Detailed Script Information');
    output.push('');
    
    this.scripts
      .filter(s => s.documentationScore >= 75)
      .slice(0, 10)
      .forEach(script => {
        output.push(`### ${script.title}`);
        output.push(`- **File**: ${script.path}`);
        output.push(`- **Purpose**: ${script.purpose}`);
        if (script.features.length > 0) {
          output.push(`- **Features**:`);
          script.features.slice(0, 3).forEach(feature => {
            output.push(`  - ${feature}`);
          });
        }
        if (script.servicesUsed.length > 0) {
          output.push(`- **Services**: ${script.servicesUsed.join(', ')}`);
        }
        output.push('');
      });
    
    // Scripts needing attention
    output.push('## Scripts Needing Documentation');
    output.push('');
    output.push('The following scripts have low documentation scores and need attention:');
    output.push('');
    output.push('| Script | Current Score | Missing |');
    output.push('|--------|---------------|---------|');
    
    this.scripts
      .filter(s => s.documentationScore < 50)
      .sort((a, b) => a.documentationScore - b.documentationScore)
      .slice(0, 10)
      .forEach(script => {
        const missing = [];
        if (!script.hasHeader) missing.push('Header');
        if (!script.hasSummary) missing.push('Summary');
        if (!script.hasSetup) missing.push('Setup');
        if (script.features.length < 3) missing.push('Features');
        
        output.push(`| ${script.name} | ${script.documentationScore}% | ${missing.join(', ')} |`);
      });
    
    output.push('');
    output.push('---');
    output.push('');
    output.push('*This catalog is automatically generated. To update, run: `npm run catalog:update`*');
    
    // Write file
    const outputPath = path.join(process.cwd(), this.options.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output.join('\n'));
    
    console.log(`📄 Markdown catalog written to: ${this.options.output}`);
  }

  /**
   * Generate JSON catalog
   */
  generateJSON() {
    const catalog = {
      generated: new Date().toISOString(),
      stats: this.stats,
      scripts: this.scripts,
      byService: this.serviceGroups
    };
    
    const outputPath = path.join(process.cwd(), this.options.jsonOutput);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));
    
    console.log(`📄 JSON catalog written to: ${this.options.jsonOutput}`);
  }

  /**
   * Watch for changes and regenerate catalog
   */
  watchForChanges() {
    console.log('👀 Watching for changes...');
    
    const appsDir = path.join(process.cwd(), 'apps');
    
    // Simple file watcher (in production, use chokidar or similar)
    setInterval(() => {
      const currentScripts = [];
      this.scripts = [];
      this.findScripts();
      
      // Check if anything changed
      if (JSON.stringify(this.scripts) !== JSON.stringify(currentScripts)) {
        console.log('📝 Changes detected, regenerating catalog...');
        this.groupByService();
        this.calculateStats();
        this.generateMarkdown();
        if (this.options.format === 'json') {
          this.generateJSON();
        }
      }
    }, 5000); // Check every 5 seconds
  }
}

// Main execution
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  format: args.includes('--json') ? 'json' : 'markdown'
};

const catalog = new GASCatalog(options);

if (args.includes('--help')) {
  console.log('Usage: node gas-catalog.js [options]');
  console.log('\nOptions:');
  console.log('  --watch      Watch for changes and auto-update');
  console.log('  --json       Output as JSON instead of Markdown');
  console.log('\nExamples:');
  console.log('  node gas-catalog.js');
  console.log('  node gas-catalog.js --watch');
  console.log('  node gas-catalog.js --json');
  process.exit(0);
}

catalog.generate();