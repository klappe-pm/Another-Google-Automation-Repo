#!/usr/bin/env node

/**
 * Google Apps Script Duplicate Detector
 * Finds and reports duplicate scripts across the entire repository
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class GASDuplicateDetector {
  constructor() {
    this.repoRoot = path.join(__dirname, '../..');
    this.scripts = [];
    this.duplicates = {
      exact: [],
      similar: [],
      nameCollisions: [],
      functional: []
    };
  }

  async detectDuplicates() {
    console.log('🔍 Starting duplicate detection across all scripts...\n');
    
    try {
      // Collect all scripts from various locations
      await this.collectScripts();
      
      console.log(`📊 Analyzing ${this.scripts.length} scripts for duplicates...\n`);
      
      // Perform various duplicate checks
      await this.findExactDuplicates();
      await this.findSimilarScripts();
      await this.findNameCollisions();
      await this.findFunctionalDuplicates();
      
      // Generate report
      await this.generateReport();
      
      // Display summary
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Error during duplicate detection:', error.message);
      throw error;
    }
  }

  async collectScripts() {
    console.log('📂 Collecting scripts from all locations...');
    
    // Collect from /apps/*/src/*.gs
    const appsDir = path.join(this.repoRoot, 'apps');
    const services = await fs.readdir(appsDir).catch(() => []);
    
    for (const service of services) {
      const srcDir = path.join(appsDir, service, 'src');
      const files = await fs.readdir(srcDir).catch(() => []);
      
      for (const file of files) {
        if (file.endsWith('.gs')) {
          await this.addScript(path.join(srcDir, file), 'repository', service);
        }
      }
    }
    
    // Collect from /txt to convert/*.txt
    const txtDir = path.join(this.repoRoot, 'txt to convert');
    const txtFiles = await fs.readdir(txtDir).catch(() => []);
    
    for (const file of txtFiles) {
      if (file.endsWith('.txt')) {
        await this.addScript(path.join(txtDir, file), 'txt', 'unknown');
      }
    }
    
    // Collect from /temp/converted-scripts/*.gs
    const convertedDir = path.join(this.repoRoot, 'temp', 'converted-scripts');
    const convertedFiles = await fs.readdir(convertedDir).catch(() => []);
    
    for (const file of convertedFiles) {
      if (file.endsWith('.gs')) {
        await this.addScript(path.join(convertedDir, file), 'converted', 'unknown');
      }
    }
    
    // Collect from /temp/external-projects/*/*.gs
    const externalDir = path.join(this.repoRoot, 'temp', 'external-projects');
    const projects = await fs.readdir(externalDir).catch(() => []);
    
    for (const project of projects) {
      const projectDir = path.join(externalDir, project);
      const stat = await fs.stat(projectDir).catch(() => null);
      
      if (stat && stat.isDirectory()) {
        const files = await fs.readdir(projectDir).catch(() => []);
        
        for (const file of files) {
          if (file.endsWith('.gs')) {
            await this.addScript(path.join(projectDir, file), 'external', 'unknown');
          }
        }
      }
    }
    
    console.log(`  ✅ Collected ${this.scripts.length} scripts\n`);
  }

  async addScript(filePath, source, service) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      
      // Calculate content hash
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      // Extract key information
      const functions = this.extractFunctions(content);
      const cleanContent = this.cleanContent(content);
      
      this.scripts.push({
        path: filePath,
        relativePath: path.relative(this.repoRoot, filePath),
        filename: path.basename(filePath),
        basename: path.basename(filePath, path.extname(filePath)),
        source: source,
        service: service,
        size: stats.size,
        hash: hash,
        content: content,
        cleanContent: cleanContent,
        functions: functions,
        functionSignatures: functions.map(f => f.signature).sort().join('|'),
        modifiedTime: stats.mtime
      });
      
    } catch (error) {
      console.error(`  ⚠️  Failed to read ${filePath}: ${error.message}`);
    }
  }

  extractFunctions(content) {
    const functions = [];
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push({
        name: match[1],
        params: match[2].trim(),
        signature: `${match[1]}(${match[2].replace(/\s+/g, '')})`
      });
    }
    
    return functions;
  }

  cleanContent(content) {
    // Remove comments, whitespace, and normalize for comparison
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove block comments
      .replace(/\/\/.*$/gm, '')          // Remove line comments
      .replace(/\s+/g, ' ')              // Normalize whitespace
      .trim();
  }

  async findExactDuplicates() {
    console.log('🔍 Finding exact duplicates...');
    
    const hashMap = {};
    
    for (const script of this.scripts) {
      if (!hashMap[script.hash]) {
        hashMap[script.hash] = [];
      }
      hashMap[script.hash].push(script);
    }
    
    for (const [hash, scripts] of Object.entries(hashMap)) {
      if (scripts.length > 1) {
        this.duplicates.exact.push({
          hash: hash,
          scripts: scripts.map(s => ({
            path: s.relativePath,
            source: s.source,
            size: s.size
          }))
        });
      }
    }
    
    console.log(`  ✅ Found ${this.duplicates.exact.length} sets of exact duplicates\n`);
  }

  async findSimilarScripts() {
    console.log('🔍 Finding similar scripts...');
    
    for (let i = 0; i < this.scripts.length; i++) {
      for (let j = i + 1; j < this.scripts.length; j++) {
        const similarity = this.calculateSimilarity(
          this.scripts[i].cleanContent,
          this.scripts[j].cleanContent
        );
        
        if (similarity > 0.9 && similarity < 1.0) {
          this.duplicates.similar.push({
            script1: this.scripts[i].relativePath,
            script2: this.scripts[j].relativePath,
            similarity: Math.round(similarity * 100) + '%'
          });
        }
      }
    }
    
    console.log(`  ✅ Found ${this.duplicates.similar.length} similar script pairs\n`);
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async findNameCollisions() {
    console.log('🔍 Finding name collisions...');
    
    const nameMap = {};
    
    for (const script of this.scripts) {
      const normalizedName = script.basename.toLowerCase();
      
      if (!nameMap[normalizedName]) {
        nameMap[normalizedName] = [];
      }
      nameMap[normalizedName].push(script);
    }
    
    for (const [name, scripts] of Object.entries(nameMap)) {
      if (scripts.length > 1) {
        this.duplicates.nameCollisions.push({
          name: name,
          scripts: scripts.map(s => ({
            path: s.relativePath,
            source: s.source,
            hash: s.hash
          }))
        });
      }
    }
    
    console.log(`  ✅ Found ${this.duplicates.nameCollisions.length} name collisions\n`);
  }

  async findFunctionalDuplicates() {
    console.log('🔍 Finding functional duplicates...');
    
    const functionMap = {};
    
    for (const script of this.scripts) {
      if (script.functionSignatures) {
        if (!functionMap[script.functionSignatures]) {
          functionMap[script.functionSignatures] = [];
        }
        functionMap[script.functionSignatures].push(script);
      }
    }
    
    for (const [signatures, scripts] of Object.entries(functionMap)) {
      if (scripts.length > 1 && signatures !== '') {
        // Check if they're not already marked as exact duplicates
        const hashes = scripts.map(s => s.hash);
        const uniqueHashes = [...new Set(hashes)];
        
        if (uniqueHashes.length > 1) {
          this.duplicates.functional.push({
            functions: signatures.split('|'),
            scripts: scripts.map(s => ({
              path: s.relativePath,
              source: s.source
            }))
          });
        }
      }
    }
    
    console.log(`  ✅ Found ${this.duplicates.functional.length} functional duplicates\n`);
  }

  async generateReport() {
    const reportPath = path.join(this.repoRoot, 'docs', 'DUPLICATE_DETECTION_REPORT.md');
    
    const report = `# Duplicate Detection Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Scripts Analyzed**: ${this.scripts.length}
- **Exact Duplicates**: ${this.duplicates.exact.length} sets
- **Similar Scripts**: ${this.duplicates.similar.length} pairs
- **Name Collisions**: ${this.duplicates.nameCollisions.length}
- **Functional Duplicates**: ${this.duplicates.functional.length}

## Exact Duplicates

${this.duplicates.exact.length > 0 ? 
  this.duplicates.exact.map(dup => `### Hash: ${dup.hash}
${dup.scripts.map(s => `- \`${s.path}\` (${s.source}, ${s.size} bytes)`).join('\n')}
`).join('\n') : 'No exact duplicates found! ✅'}

## Similar Scripts (>90% similarity)

${this.duplicates.similar.length > 0 ?
  this.duplicates.similar.map(dup => 
    `- \`${dup.script1}\` ↔ \`${dup.script2}\` (${dup.similarity})`
  ).join('\n') : 'No similar scripts found! ✅'}

## Name Collisions

${this.duplicates.nameCollisions.length > 0 ?
  this.duplicates.nameCollisions.map(collision => `### ${collision.name}
${collision.scripts.map(s => 
  `- \`${s.path}\` (${s.source}${s.hash ? ', hash: ' + s.hash.substring(0, 8) : ''})`
).join('\n')}
`).join('\n') : 'No name collisions found! ✅'}

## Functional Duplicates

${this.duplicates.functional.length > 0 ?
  this.duplicates.functional.map(dup => `### Functions: ${dup.functions.join(', ')}
${dup.scripts.map(s => `- \`${s.path}\` (${s.source})`).join('\n')}
`).join('\n') : 'No functional duplicates found! ✅'}

## Recommendations

${this.generateRecommendations()}

## Space Savings

${this.calculateSpaceSavings()}

## Next Steps

1. Review exact duplicates and decide which versions to keep
2. Examine similar scripts for potential consolidation
3. Resolve name collisions by renaming files
4. Consider merging functional duplicates
5. Run \`npm run gas:dedupe\` to automatically resolve duplicates (with confirmation)
`;

    await fs.writeFile(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.duplicates.exact.length > 0) {
      recommendations.push('- **Exact Duplicates**: Keep the version with the best documentation and most recent updates');
    }
    
    if (this.duplicates.similar.length > 0) {
      recommendations.push('- **Similar Scripts**: Review for consolidation opportunities, merge unique features');
    }
    
    if (this.duplicates.nameCollisions.length > 0) {
      recommendations.push('- **Name Collisions**: Rename files to reflect their specific functionality');
    }
    
    if (this.duplicates.functional.length > 0) {
      recommendations.push('- **Functional Duplicates**: Consider creating a shared utility module');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'No issues found - your scripts are well organized! ✅';
  }

  calculateSpaceSavings() {
    let totalSize = 0;
    let duplicateSize = 0;
    
    for (const dup of this.duplicates.exact) {
      const sizes = dup.scripts.map(s => s.size);
      const maxSize = Math.max(...sizes);
      const totalDupSize = sizes.reduce((a, b) => a + b, 0);
      duplicateSize += totalDupSize - maxSize;
    }
    
    for (const script of this.scripts) {
      totalSize += script.size;
    }
    
    const savings = duplicateSize;
    const percentage = totalSize > 0 ? (savings / totalSize * 100).toFixed(1) : 0;
    
    return `- Total size of all scripts: ${this.formatBytes(totalSize)}
- Potential space savings: ${this.formatBytes(savings)} (${percentage}%)
- Scripts after deduplication: ${this.scripts.length - this.countTotalDuplicates()}`;
  }

  countTotalDuplicates() {
    let count = 0;
    
    for (const dup of this.duplicates.exact) {
      count += dup.scripts.length - 1;
    }
    
    return count;
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DUPLICATE DETECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Scripts: ${this.scripts.length}`);
    console.log(`Exact Duplicates: ${this.duplicates.exact.length} sets`);
    console.log(`Similar Scripts: ${this.duplicates.similar.length} pairs`);
    console.log(`Name Collisions: ${this.duplicates.nameCollisions.length}`);
    console.log(`Functional Duplicates: ${this.duplicates.functional.length}`);
    console.log('='.repeat(60) + '\n');
  }
}

// Run if called directly
if (require.main === module) {
  const detector = new GASDuplicateDetector();
  detector.detectDuplicates().catch(console.error);
}

module.exports = GASDuplicateDetector;