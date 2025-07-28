#!/usr/bin/env node

/**
 * Catalog Report Generator
 * Generates comprehensive catalog of all scripts and services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CatalogGenerator {
  constructor() {
    this.repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();
    this.catalog = {
      services: {},
      scripts: {},
      totals: {
        services: 0,
        scripts: 0,
        totalLines: 0
      }
    };
  }

  scanDirectory(dir, relativePath = '') {
    const items = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subItems = this.scanDirectory(fullPath, relPath);
          if (subItems.length > 0) {
            items.push({
              type: 'directory',
              name: entry.name,
              path: relPath,
              items: subItems
            });
          }
        } else if (entry.isFile() && entry.name.endsWith('.gs')) {
          const stats = this.analyzeScript(fullPath);
          items.push({
            type: 'script',
            name: entry.name,
            path: relPath,
            ...stats
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
    
    return items;
  }

  analyzeScript(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const functions = (content.match(/function\s+\w+/g) || []).length;
      
      // Extract script metadata from comments
      const summary = this.extractSummary(content);
      const purpose = this.extractPurpose(content);
      
      return {
        lines,
        functions,
        summary,
        purpose
      };
    } catch (error) {
      console.warn(`Warning: Could not analyze script ${filePath}: ${error.message}`);
      return {
        lines: 0,
        functions: 0,
        summary: 'Unable to analyze',
        purpose: []
      };
    }
  }

  extractSummary(content) {
    const summaryMatch = content.match(/\*\s*Script Summary:\s*\n\s*\*\s*(.+)/);
    return summaryMatch ? summaryMatch[1].trim() : 'No summary available';
  }

  extractPurpose(content) {
    const purposes = [];
    const lines = content.split('\n');
    let inPurposeSection = false;
    
    for (const line of lines) {
      if (line.includes('Script Purpose:')) {
        inPurposeSection = true;
        continue;
      }
      
      if (inPurposeSection) {
        if (line.includes('Script Steps:') || line.includes('Script Functions:')) {
          break;
        }
        
        const purposeMatch = line.match(/\*\s*-\s*(.+)/);
        if (purposeMatch) {
          purposes.push(purposeMatch[1].trim());
        }
      }
    }
    
    return purposes;
  }

  generateCatalog() {
    console.log('Generating script catalog...\n');

    // Scan apps directory
    const appsDir = path.join(this.repoRoot, 'apps');
    if (fs.existsSync(appsDir)) {
      const services = fs.readdirSync(appsDir).filter(f => {
        const fullPath = path.join(appsDir, f);
        return fs.statSync(fullPath).isDirectory();
      });

      services.forEach(service => {
        const servicePath = path.join(appsDir, service);
        this.catalog.services[service] = this.scanDirectory(servicePath, service);
        this.catalog.totals.services++;
      });
    }

    // Generate catalog report
    const report = this.formatCatalog();
    
    // Save catalog
    const catalogPath = path.join(this.repoRoot, 'docs/catalogs', `SCRIPT_CATALOG.md`);
    fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
    fs.writeFileSync(catalogPath, report);
    
    console.log(report);
    console.log(`\nCatalog saved to: ${catalogPath}`);
  }

  formatCatalog() {
    const date = new Date().toISOString().split('T')[0];
    
    let catalog = `# Google Apps Script Catalog\n\n`;
    catalog += `**Generated:** ${date}\n`;
    catalog += `**Last Updated:** ${new Date().toISOString()}\n\n`;
    
    catalog += `## Overview\n\n`;
    catalog += `This catalog contains all Google Apps Script files organized by service.\n\n`;
    
    // Count totals
    let totalScripts = 0;
    let totalLines = 0;
    let totalFunctions = 0;
    
    Object.values(this.catalog.services).forEach(service => {
      const serviceStats = this.countServiceStats(service);
      totalScripts += serviceStats.scripts;
      totalLines += serviceStats.lines;
      totalFunctions += serviceStats.functions;
    });
    
    catalog += `### Statistics\n\n`;
    catalog += `- **Services:** ${Object.keys(this.catalog.services).length}\n`;
    catalog += `- **Total Scripts:** ${totalScripts}\n`;
    catalog += `- **Total Lines:** ${totalLines.toLocaleString()}\n`;
    catalog += `- **Total Functions:** ${totalFunctions.toLocaleString()}\n\n`;
    
    // Services breakdown
    catalog += `## Services\n\n`;
    
    Object.entries(this.catalog.services)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([serviceName, items]) => {
        const stats = this.countServiceStats(items);
        catalog += `### ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}\n\n`;
        catalog += `**Scripts:** ${stats.scripts} | **Lines:** ${stats.lines.toLocaleString()} | **Functions:** ${stats.functions}\n\n`;
        
        if (stats.scripts > 0) {
          catalog += this.formatServiceItems(items, 0);
        } else {
          catalog += `*No scripts found in this service.*\n\n`;
        }
      });
    
    catalog += `---\n\n`;
    catalog += `*Generated by automated catalog system*\n`;
    
    return catalog;
  }

  countServiceStats(items) {
    let scripts = 0;
    let lines = 0;
    let functions = 0;
    
    items.forEach(item => {
      if (item.type === 'script') {
        scripts++;
        lines += item.lines || 0;
        functions += item.functions || 0;
      } else if (item.type === 'directory' && item.items) {
        const subStats = this.countServiceStats(item.items);
        scripts += subStats.scripts;
        lines += subStats.lines;
        functions += subStats.functions;
      }
    });
    
    return { scripts, lines, functions };
  }

  formatServiceItems(items, depth = 0) {
    let output = '';
    const indent = '  '.repeat(depth);
    
    items.forEach(item => {
      if (item.type === 'script') {
        output += `${indent}- **${item.name}**`;
        if (item.summary && item.summary !== 'No summary available') {
          output += ` - ${item.summary}`;
        }
        output += `\n`;
        
        if (item.purpose && item.purpose.length > 0) {
          item.purpose.forEach(purpose => {
            output += `${indent}  - ${purpose}\n`;
          });
        }
        
        output += `${indent}  *${item.functions} functions, ${item.lines} lines*\n\n`;
      } else if (item.type === 'directory') {
        output += `${indent}#### ${item.name}/\n\n`;
        if (item.items && item.items.length > 0) {
          output += this.formatServiceItems(item.items, depth + 1);
        }
      }
    });
    
    return output;
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new CatalogGenerator();
  generator.generateCatalog();
}

module.exports = CatalogGenerator;
