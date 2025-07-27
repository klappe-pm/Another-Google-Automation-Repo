#!/usr/bin/env node

/**
 * Shell Script Catalog Generator
 * Automatically generates and maintains a catalog of all shell scripts
 * 
 * Usage:
 *   node shell-catalog.js              # Generate catalog
 *   node shell-catalog.js --watch      # Watch for changes
 *   node shell-catalog.js --json       # Output as JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ShellCatalog {
  constructor(options = {}) {
    this.options = {
      output: options.output || 'docs/SHELL_SCRIPT_CATALOG.md',
      jsonOutput: options.jsonOutput || 'docs/shell-script-catalog.json',
      watch: options.watch || false,
      format: options.format || 'markdown',
      ...options
    };
    
    this.scripts = [];
    this.categoryGroups = {};
    this.stats = {
      total: 0,
      withShebang: 0,
      withDescription: 0,
      executable: 0,
      byCategory: {},
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate the catalog
   */
  async generate() {
    console.log('🔍 Scanning for shell scripts...');
    
    // Find all scripts
    this.findScripts();
    
    // Group by category
    this.groupByCategory();
    
    // Calculate statistics
    this.calculateStats();
    
    // Generate output
    if (this.options.format === 'json') {
      this.generateJSON();
    } else {
      this.generateMarkdown();
    }
    
    console.log(`✅ Catalog generated: ${this.scripts.length} shell scripts found`);
    
    // Set up watch mode if requested
    if (this.options.watch) {
      this.watchForChanges();
    }
  }

  /**
   * Find all shell scripts in the repository
   */
  findScripts() {
    const rootDir = process.cwd();
    const ignoreDirs = ['node_modules', '.git', 'logs', '.DS_Store'];
    
    this.scanDirectory(rootDir, ignoreDirs);
    
    // Sort scripts by category and name
    this.scripts.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Recursively scan directory for shell scripts
   */
  scanDirectory(dir, ignoreDirs) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !file.startsWith('.') && !ignoreDirs.includes(file)) {
            this.scanDirectory(fullPath, ignoreDirs);
          } else if (stat.isFile() && this.isShellScript(fullPath)) {
            const scriptInfo = this.extractScriptInfo(fullPath);
            if (scriptInfo) {
              this.scripts.push(scriptInfo);
            }
          }
        } catch (err) {
          // Skip files we can't access
          continue;
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  /**
   * Check if file is a shell script
   */
  isShellScript(filePath) {
    const ext = path.extname(filePath);
    
    // Check by extension
    if (ext === '.sh') {
      return true;
    }
    
    // Check by shebang for extensionless files
    if (!ext || ext === '') {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const firstLine = content.split('\n')[0];
        return firstLine.startsWith('#!/') && 
               (firstLine.includes('bash') || firstLine.includes('sh') || firstLine.includes('zsh'));
      } catch (err) {
        return false;
      }
    }
    
    return false;
  }

  /**
   * Extract metadata from shell script
   */
  extractScriptInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      const stat = fs.statSync(filePath);
      const lines = content.split('\n');
      
      const info = {
        path: relativePath,
        name: path.basename(filePath),
        category: this.detectCategory(filePath),
        description: this.extractDescription(lines),
        purpose: this.extractPurpose(lines),
        usage: this.extractUsage(lines),
        author: this.extractAuthor(lines),
        hasShebang: lines[0].startsWith('#!/'),
        shebang: lines[0].startsWith('#!/') ? lines[0] : null,
        hasSetOptions: content.includes('set -'),
        setOptions: this.extractSetOptions(content),
        functions: this.extractFunctions(content),
        dependencies: this.extractDependencies(content),
        isExecutable: this.isExecutable(filePath),
        fileSize: stat.size,
        lineCount: lines.length,
        lastModified: stat.mtime.toISOString().split('T')[0]
      };
      
      // Calculate quality score
      info.qualityScore = this.calculateQualityScore(info);
      
      return info;
      
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract description from comments
   */
  extractDescription(lines) {
    // Look for description in first 20 lines
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      
      // Check for various description patterns
      if (line.match(/^#\s*(Description|PURPOSE|Summary):/i)) {
        return line.replace(/^#\s*(Description|PURPOSE|Summary):\s*/i, '').trim();
      }
      
      // Check for general descriptive comment after shebang
      if (i > 0 && i < 5 && line.match(/^#\s+\w/) && !line.match(/^#\s*(set|export|source)/)) {
        return line.replace(/^#\s*/, '').trim();
      }
    }
    
    return 'No description found';
  }

  /**
   * Extract purpose from script
   */
  extractPurpose(lines) {
    for (const line of lines.slice(0, 30)) {
      if (line.match(/^#\s*Purpose:/i)) {
        return line.replace(/^#\s*Purpose:\s*/i, '').trim();
      }
    }
    return null;
  }

  /**
   * Extract usage information
   */
  extractUsage(lines) {
    const usage = [];
    let inUsageBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/^#\s*Usage:/i)) {
        inUsageBlock = true;
        continue;
      }
      
      if (inUsageBlock) {
        if (line.startsWith('#') && line.trim() !== '#') {
          usage.push(line.replace(/^#\s?/, '').trim());
        } else if (!line.startsWith('#')) {
          break;
        }
      }
    }
    
    return usage;
  }

  /**
   * Extract author information
   */
  extractAuthor(lines) {
    for (const line of lines.slice(0, 30)) {
      if (line.match(/^#\s*Author:/i)) {
        return line.replace(/^#\s*Author:\s*/i, '').trim();
      }
    }
    return null;
  }

  /**
   * Extract set options
   */
  extractSetOptions(content) {
    const setMatch = content.match(/set\s+(-[a-zA-Z]+|\+[a-zA-Z]+)/g);
    return setMatch ? setMatch.join(' ') : null;
  }

  /**
   * Extract function names
   */
  extractFunctions(content) {
    const functions = [];
    const functionRegex = /^(?:function\s+)?(\w+)\s*\(\)\s*{/gm;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      if (!match[1].startsWith('_')) { // Skip private functions
        functions.push(match[1]);
      }
    }
    
    return functions;
  }

  /**
   * Extract dependencies (commands used)
   */
  extractDependencies(content) {
    const deps = new Set();
    
    // Common commands to check for
    const commands = [
      'git', 'npm', 'node', 'docker', 'kubectl', 'aws', 'gcloud',
      'curl', 'wget', 'jq', 'sed', 'awk', 'grep', 'find', 'rsync',
      'python', 'ruby', 'go', 'java', 'mvn', 'gradle'
    ];
    
    for (const cmd of commands) {
      // Check if command is used (not in comments)
      const regex = new RegExp(`\\b${cmd}\\b(?![^#]*#)`, 'm');
      if (regex.test(content)) {
        deps.add(cmd);
      }
    }
    
    return Array.from(deps);
  }

  /**
   * Check if file is executable
   */
  isExecutable(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect category from file path
   */
  detectCategory(filePath) {
    const pathParts = filePath.toLowerCase().split(path.sep);
    
    // Category mappings
    const categoryMap = {
      'automation': 'Automation',
      'deployment': 'Deployment',
      'setup': 'Setup & Configuration',
      'test': 'Testing',
      'build': 'Build & CI/CD',
      'security': 'Security',
      'utility': 'Utilities',
      'git': 'Git Operations',
      'docker': 'Docker',
      'cloud': 'Cloud Operations'
    };
    
    // Check path parts for category keywords
    for (const part of pathParts) {
      for (const [keyword, category] of Object.entries(categoryMap)) {
        if (part.includes(keyword)) {
          return category;
        }
      }
    }
    
    // Check filename
    const filename = path.basename(filePath).toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (filename.includes(keyword)) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Calculate quality score for script
   */
  calculateQualityScore(info) {
    let score = 0;
    const checks = [
      { condition: info.hasShebang, points: 15 },
      { condition: info.description !== 'No description found', points: 20 },
      { condition: info.hasSetOptions, points: 10 },
      { condition: info.setOptions && info.setOptions.includes('-e'), points: 5 },
      { condition: info.setOptions && info.setOptions.includes('-u'), points: 5 },
      { condition: info.usage.length > 0, points: 15 },
      { condition: info.author !== null, points: 10 },
      { condition: info.isExecutable, points: 10 },
      { condition: info.functions.length > 0, points: 10 }
    ];
    
    checks.forEach(check => {
      if (check.condition) score += check.points;
    });
    
    return score;
  }

  /**
   * Group scripts by category
   */
  groupByCategory() {
    this.categoryGroups = {};
    
    this.scripts.forEach(script => {
      if (!this.categoryGroups[script.category]) {
        this.categoryGroups[script.category] = [];
      }
      this.categoryGroups[script.category].push(script);
    });
  }

  /**
   * Calculate statistics
   */
  calculateStats() {
    this.stats.total = this.scripts.length;
    this.stats.withShebang = this.scripts.filter(s => s.hasShebang).length;
    this.stats.withDescription = this.scripts.filter(s => s.description !== 'No description found').length;
    this.stats.executable = this.scripts.filter(s => s.isExecutable).length;
    
    // Count by category
    Object.keys(this.categoryGroups).forEach(category => {
      this.stats.byCategory[category] = this.categoryGroups[category].length;
    });
    
    // Calculate average quality score
    const totalScore = this.scripts.reduce((sum, s) => sum + s.qualityScore, 0);
    this.stats.averageQualityScore = Math.round(totalScore / this.scripts.length);
    
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
    output.push('# Shell Script Catalog');
    output.push('');
    output.push(`Last Updated: ${new Date().toLocaleString()}`);
    output.push('');
    
    // Summary section
    output.push('## Summary');
    output.push(`- **Total Scripts**: ${this.stats.total}`);
    output.push(`- **With Shebang**: ${this.stats.withShebang} (${Math.round(this.stats.withShebang / this.stats.total * 100)}%)`);
    output.push(`- **With Description**: ${this.stats.withDescription} (${Math.round(this.stats.withDescription / this.stats.total * 100)}%)`);
    output.push(`- **Executable**: ${this.stats.executable} (${Math.round(this.stats.executable / this.stats.total * 100)}%)`);
    output.push(`- **Average Quality Score**: ${this.stats.averageQualityScore}%`);
    output.push('');
    
    // Category breakdown
    output.push('### Scripts by Category');
    Object.entries(this.stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        output.push(`- ${category}: ${count} scripts`);
      });
    output.push('');
    
    // Recently updated
    output.push('### Recently Updated');
    this.stats.recentlyUpdated.forEach(script => {
      output.push(`- ${script.name} (${script.date})`);
    });
    output.push('');
    
    // Scripts by category
    output.push('## Scripts by Category');
    output.push('');
    
    Object.entries(this.categoryGroups).forEach(([category, scripts]) => {
      output.push(`### ${category} (${scripts.length} scripts)`);
      output.push('');
      output.push('| Script | Description | Quality | Executable | Lines |');
      output.push('|--------|-------------|---------|------------|-------|');
      
      scripts.forEach(script => {
        const name = `[${script.name}](${script.path})`;
        const qualityScore = `${script.qualityScore}%`;
        const executable = script.isExecutable ? '✅' : '❌';
        
        output.push(`| ${name} | ${script.description} | ${qualityScore} | ${executable} | ${script.lineCount} |`);
      });
      
      output.push('');
    });
    
    // High quality scripts
    output.push('## High Quality Scripts');
    output.push('');
    output.push('Scripts with quality score >= 80%:');
    output.push('');
    
    this.scripts
      .filter(s => s.qualityScore >= 80)
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 10)
      .forEach(script => {
        output.push(`### ${script.name}`);
        output.push(`- **Path**: ${script.path}`);
        output.push(`- **Description**: ${script.description}`);
        output.push(`- **Quality Score**: ${script.qualityScore}%`);
        if (script.usage.length > 0) {
          output.push(`- **Usage**:`);
          script.usage.slice(0, 3).forEach(line => {
            output.push(`  - ${line}`);
          });
        }
        if (script.functions.length > 0) {
          output.push(`- **Functions**: ${script.functions.slice(0, 5).join(', ')}`);
        }
        if (script.dependencies.length > 0) {
          output.push(`- **Dependencies**: ${script.dependencies.join(', ')}`);
        }
        output.push('');
      });
    
    // Scripts needing improvement
    output.push('## Scripts Needing Improvement');
    output.push('');
    output.push('Scripts with quality score < 50%:');
    output.push('');
    output.push('| Script | Score | Missing |');
    output.push('|--------|-------|---------|');
    
    this.scripts
      .filter(s => s.qualityScore < 50)
      .sort((a, b) => a.qualityScore - b.qualityScore)
      .slice(0, 15)
      .forEach(script => {
        const missing = [];
        if (!script.hasShebang) missing.push('Shebang');
        if (script.description === 'No description found') missing.push('Description');
        if (!script.hasSetOptions) missing.push('Set options');
        if (!script.isExecutable) missing.push('Executable');
        if (script.usage.length === 0) missing.push('Usage docs');
        
        output.push(`| ${script.name} | ${script.qualityScore}% | ${missing.join(', ')} |`);
      });
    
    output.push('');
    
    // Shell script best practices
    output.push('## Shell Script Best Practices');
    output.push('');
    output.push('### Required Elements');
    output.push('1. **Shebang**: `#!/usr/bin/env bash` or `#!/bin/bash`');
    output.push('2. **Set Options**: `set -euo pipefail` for error handling');
    output.push('3. **Description**: Clear description at the top of the script');
    output.push('4. **Usage**: Document how to use the script');
    output.push('5. **Error Handling**: Proper error messages and exit codes');
    output.push('');
    output.push('### Template');
    output.push('```bash');
    output.push('#!/usr/bin/env bash');
    output.push('set -euo pipefail');
    output.push('');
    output.push('# Description: Brief description of what this script does');
    output.push('# Author: Your Name');
    output.push('# Usage: ./script.sh [options] [arguments]');
    output.push('#   -h, --help    Show this help message');
    output.push('#   -v, --verbose Enable verbose output');
    output.push('```');
    output.push('');
    output.push('---');
    output.push('');
    output.push('*This catalog is automatically generated. To update, run: `npm run shell:catalog`*');
    
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
      byCategory: this.categoryGroups
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
    
    // Simple file watcher
    setInterval(() => {
      const currentScripts = [...this.scripts];
      this.scripts = [];
      this.findScripts();
      
      // Check if anything changed
      if (JSON.stringify(this.scripts) !== JSON.stringify(currentScripts)) {
        console.log('📝 Changes detected, regenerating catalog...');
        this.groupByCategory();
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

const catalog = new ShellCatalog(options);

if (args.includes('--help')) {
  console.log('Usage: node shell-catalog.js [options]');
  console.log('\nOptions:');
  console.log('  --watch      Watch for changes and auto-update');
  console.log('  --json       Output as JSON instead of Markdown');
  console.log('\nExamples:');
  console.log('  node shell-catalog.js');
  console.log('  node shell-catalog.js --watch');
  console.log('  node shell-catalog.js --json');
  process.exit(0);
}

catalog.generate();