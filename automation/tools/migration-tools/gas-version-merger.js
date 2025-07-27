#!/usr/bin/env node

/**
 * Google Apps Script Version Merger
 * Compares similar files and merges them into the best version
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class GASVersionMerger {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.comparisons = [];
  }

  async mergeVersions() {
    console.log('🔄 Starting version merge process...\n');
    
    // Find all similar files across:
    // 1. Repository (apps/*/src/*.gs)
    // 2. Converted scripts (temp/converted-scripts/*.gs)
    // 3. External projects (temp/external-projects/*/*.gs)
    
    const allFiles = await this.collectAllFiles();
    const groups = await this.groupSimilarFiles(allFiles);
    
    console.log(`\n📊 Found ${groups.length} groups of similar files\n`);
    
    // Process each group
    for (const group of groups) {
      await this.processGroup(group);
    }
    
    // Generate merge report
    await this.generateMergeReport();
  }

  async collectAllFiles() {
    console.log('📂 Collecting all script files...');
    const files = [];
    
    // Repository files
    const appsDir = path.join(this.repoRoot, 'apps');
    const services = await fs.readdir(appsDir).catch(() => []);
    
    for (const service of services) {
      const srcDir = path.join(appsDir, service, 'src');
      const serviceFiles = await fs.readdir(srcDir).catch(() => []);
      
      for (const file of serviceFiles) {
        if (file.endsWith('.gs')) {
          const filePath = path.join(srcDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          files.push({
            path: filePath,
            relativePath: path.relative(this.repoRoot, filePath),
            filename: file,
            basename: path.basename(file, '.gs'),
            service,
            source: 'repository',
            content,
            size: content.length,
            lastModified: (await fs.stat(filePath)).mtime,
            metadata: this.extractMetadata(content),
            quality: this.calculateQuality(content)
          });
        }
      }
    }
    
    // Converted scripts
    const convertedDir = path.join(this.repoRoot, 'temp', 'converted-scripts');
    const convertedFiles = await fs.readdir(convertedDir).catch(() => []);
    
    for (const file of convertedFiles) {
      if (file.endsWith('.gs')) {
        const filePath = path.join(convertedDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        files.push({
          path: filePath,
          relativePath: path.relative(this.repoRoot, filePath),
          filename: file,
          basename: path.basename(file, '.gs'),
          service: 'unknown',
          source: 'converted',
          content,
          size: content.length,
          lastModified: (await fs.stat(filePath)).mtime,
          metadata: this.extractMetadata(content),
          quality: this.calculateQuality(content)
        });
      }
    }
    
    console.log(`  ✅ Collected ${files.length} files\n`);
    return files;
  }

  extractMetadata(content) {
    const metadata = {
      hasHeader: false,
      hasDocumentation: false,
      title: '',
      purpose: '',
      updated: null,
      functions: []
    };
    
    // Check for header
    if (content.includes('/**') && content.includes('*/')) {
      metadata.hasHeader = true;
      
      // Extract title
      const titleMatch = content.match(/\* Title:\s*(.+)/);
      if (titleMatch) metadata.title = titleMatch[1].trim();
      
      // Extract purpose
      const purposeMatch = content.match(/\* Purpose:\s*(.+)/);
      if (purposeMatch) metadata.purpose = purposeMatch[1].trim();
      
      // Extract updated date
      const updatedMatch = content.match(/\* Updated:\s*(.+)/);
      if (updatedMatch) {
        const dateStr = updatedMatch[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          metadata.updated = date;
        }
      }
    }
    
    // Check for script summary
    if (content.includes('Script Summary:')) {
      metadata.hasDocumentation = true;
    }
    
    // Extract functions
    const functionRegex = /function\s+(\w+)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      metadata.functions.push(match[1]);
    }
    
    return metadata;
  }

  calculateQuality(content) {
    let score = 0;
    
    // Has header
    if (content.includes('/**')) score += 20;
    
    // Has script summary
    if (content.includes('Script Summary:')) score += 20;
    
    // Has purpose
    if (content.match(/Purpose:/i)) score += 10;
    
    // Has setup instructions
    if (content.match(/Setup:|Installation:/i)) score += 15;
    
    // Has function documentation
    const functionDocs = content.match(/\/\*\*[\s\S]*?\*\/\s*function/g);
    if (functionDocs && functionDocs.length > 0) score += 15;
    
    // Has error handling
    if (content.includes('try {') && content.includes('catch')) score += 10;
    
    // Has logging
    if (content.includes('Logger.log') || content.includes('console.log')) score += 5;
    
    // Recent update date
    const updatedMatch = content.match(/Updated:\s*(\d{4}-\d{2}-\d{2})/);
    if (updatedMatch) {
      const date = new Date(updatedMatch[1]);
      const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) score += 5;
    }
    
    return score;
  }

  async groupSimilarFiles(files) {
    const groups = {};
    
    // Group by normalized basename
    for (const file of files) {
      const normalizedName = this.normalizeFilename(file.basename);
      
      if (!groups[normalizedName]) {
        groups[normalizedName] = [];
      }
      groups[normalizedName].push(file);
    }
    
    // Filter to only groups with multiple versions
    return Object.values(groups).filter(group => group.length > 1);
  }

  normalizeFilename(filename) {
    return filename
      .toLowerCase()
      .replace(/[-_\s]+/g, '-')
      .replace(/^(gmail|email|drive|docs|sheets|calendar|tasks|chat|utility)-/, '')
      .replace(/-v\d+$/, '')
      .replace(/-copy$/, '')
      .replace(/-alt$/, '')
      .replace(/-(1|2)$/, '');
  }

  async processGroup(group) {
    console.log(`\n📁 Processing group: ${group[0].basename}`);
    console.log(`  Found ${group.length} versions:`);
    
    // Sort by quality score and date
    group.sort((a, b) => {
      // First by quality
      if (b.quality !== a.quality) return b.quality - a.quality;
      // Then by update date
      if (a.metadata.updated && b.metadata.updated) {
        return b.metadata.updated - a.metadata.updated;
      }
      // Then by file modification date
      return b.lastModified - a.lastModified;
    });
    
    // Show all versions
    for (const file of group) {
      console.log(`    - ${file.relativePath}`);
      console.log(`      Quality: ${file.quality}%, Size: ${file.size} bytes`);
      console.log(`      Source: ${file.source}, Updated: ${file.metadata.updated || file.lastModified}`);
    }
    
    // Determine best version
    const best = group[0];
    console.log(`  ✅ Best version: ${best.relativePath}`);
    
    // Record comparison
    this.comparisons.push({
      name: group[0].basename,
      bestVersion: best,
      allVersions: group,
      action: this.determineAction(group, best)
    });
  }

  determineAction(group, best) {
    // If best is already in repository, keep it there
    if (best.source === 'repository') {
      return {
        type: 'keep',
        target: best.relativePath,
        remove: group.filter(f => f !== best).map(f => f.relativePath)
      };
    }
    
    // If best is from converted/external, need to migrate it
    const repoVersion = group.find(f => f.source === 'repository');
    if (repoVersion) {
      return {
        type: 'update',
        target: repoVersion.relativePath,
        source: best.relativePath,
        remove: group.filter(f => f !== best && f !== repoVersion).map(f => f.relativePath)
      };
    }
    
    // No repo version exists, need to add
    const service = this.detectService(best.content);
    return {
      type: 'add',
      source: best.relativePath,
      target: `apps/${service}/src/${best.filename}`,
      remove: group.filter(f => f !== best).map(f => f.relativePath)
    };
  }

  detectService(content) {
    const servicePatterns = {
      gmail: /GmailApp\.|Gmail\.|getLabel|sendEmail/i,
      drive: /DriveApp\.|Drive\.|getFolderById|createFile/i,
      sheets: /SpreadsheetApp\.|Sheets\.|getActiveSpreadsheet/i,
      calendar: /CalendarApp\.|Calendar\.|getCalendarById/i,
      docs: /DocumentApp\.|Docs\.|getActiveDocument/i,
      tasks: /Tasks\.|taskslists/i,
      chat: /Chat\.|spaces\.messages/i
    };
    
    for (const [service, pattern] of Object.entries(servicePatterns)) {
      if (pattern.test(content)) return service;
    }
    
    return 'utility';
  }

  async generateMergeReport() {
    const reportPath = path.join(this.repoRoot, 'docs', 'VERSION_MERGE_REPORT.md');
    
    const report = `# Version Merge Report

Generated: ${new Date().toISOString()}

## Summary
- **Groups Analyzed**: ${this.comparisons.length}
- **Files to Keep**: ${this.comparisons.filter(c => c.action.type === 'keep').length}
- **Files to Update**: ${this.comparisons.filter(c => c.action.type === 'update').length}
- **Files to Add**: ${this.comparisons.filter(c => c.action.type === 'add').length}

## Merge Actions

${this.comparisons.map(comp => `### ${comp.name}

**Best Version**: ${comp.bestVersion.relativePath} (Quality: ${comp.bestVersion.quality}%)

**Action**: ${comp.action.type.toUpperCase()}
${comp.action.type === 'keep' ? `- Keep: ${comp.action.target}` : ''}
${comp.action.type === 'update' ? `- Update: ${comp.action.target} with content from ${comp.action.source}` : ''}
${comp.action.type === 'add' ? `- Add: ${comp.action.source} → ${comp.action.target}` : ''}

**Remove**:
${comp.action.remove.map(f => `- ${f}`).join('\n')}

**All Versions**:
${comp.allVersions.map(v => 
  `- ${v.relativePath} (Quality: ${v.quality}%, ${v.size} bytes)`
).join('\n')}
`).join('\n---\n\n')}

## Execution Script

\`\`\`bash
#!/bin/bash

# Execute merge actions

${this.generateExecutionScript()}
\`\`\`
`;

    await fs.writeFile(reportPath, report);
    console.log(`\n📄 Merge report saved to: ${reportPath}`);
  }

  generateExecutionScript() {
    const commands = [];
    
    for (const comp of this.comparisons) {
      const action = comp.action;
      
      if (action.type === 'update') {
        commands.push(`# Update ${comp.name}`);
        commands.push(`cp "${action.source}" "${action.target}"`);
      } else if (action.type === 'add') {
        commands.push(`# Add ${comp.name}`);
        commands.push(`mkdir -p "$(dirname "${action.target}")"`);
        commands.push(`cp "${action.source}" "${action.target}"`);
      }
      
      // Remove duplicates
      for (const file of action.remove) {
        if (!file.includes('apps/')) {  // Don't remove from apps yet
          commands.push(`rm -f "${file}"`);
        }
      }
      
      commands.push('');
    }
    
    return commands.join('\n');
  }
}

// Run if called directly
if (require.main === module) {
  const merger = new GASVersionMerger();
  merger.mergeVersions().catch(console.error);
}

module.exports = GASVersionMerger;