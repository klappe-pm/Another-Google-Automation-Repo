#!/usr/bin/env node

/**
 * Standardize all Google Apps Script filenames
 */

const fs = require('fs').promises;
const path = require('path');

async function standardizeFilenames() {
  console.log('📝 Standardizing all Google Apps Script filenames...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  const renames = [];
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    const dir = path.dirname(filePath);
    const oldName = path.basename(filePath);
    const newName = standardizeName(oldName);
    
    if (oldName !== newName) {
      const oldPath = filePath;
      const newPath = path.join(dir, newName);
      
      // Check if target already exists
      if (await fileExists(newPath)) {
        console.log(`⚠️  Cannot rename ${oldName} → ${newName} (file already exists)`);
        continue;
      }
      
      // Rename file
      await fs.rename(oldPath, newPath);
      renames.push({ oldName, newName, path: dir.replace(path.join(__dirname, '../../'), '') });
      console.log(`✅ ${oldName} → ${newName}`);
    }
  }
  
  console.log(`\n✅ Renamed ${renames.length} files`);
  
  // Generate report
  if (renames.length > 0) {
    const report = generateRenameReport(renames);
    await fs.writeFile(
      path.join(__dirname, '../../docs/FILENAME_STANDARDIZATION.md'),
      report
    );
    console.log('📄 Report saved to: docs/FILENAME_STANDARDIZATION.md');
  }
  
  return renames;
}

function standardizeName(filename, filePath) {
  // Remove .gs extension for processing
  let name = filename.replace('.gs', '');
  
  // Remove version prefixes (v1-, v2-, etc.)
  name = name.replace(/^v\d+[\.-]/i, '');
  
  // Convert camelCase to kebab-case
  name = name.replace(/([a-z])([A-Z])/g, '$1-$2');
  
  // Replace spaces and special characters with hyphens
  name = name
    .replace(/\s+/g, '-')
    .replace(/[_]/g, '-')
    .replace(/[()]/g, '')
    .replace(/\?+/g, '')
    .replace(/[&]/g, 'and')
    .replace(/[@]/g, 'at')
    .replace(/[+]/g, 'plus')
    .replace(/[=]/g, 'equals')
    .replace(/[,]/g, '-')
    .replace(/[.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Convert to lowercase
  name = name.toLowerCase();
  
  // Remove service prefixes if in correct folder
  const servicePrefixes = ['gmail', 'drive', 'sheets', 'calendar', 'tasks', 'docs', 'chat', 'photos'];
  const folder = filePath ? path.dirname(filePath).split('/').pop() : '';
  
  servicePrefixes.forEach(service => {
    if (folder === service && name.startsWith(service + '-')) {
      name = name.substring(service.length + 1);
    }
  });
  
  // Convert to action-noun format
  name = convertToActionNoun(name);
  
  // Handle special cases
  if (name === 'code' || name === 'main-code') {
    name = 'process-main';
  }
  if (name.match(/^(untitled|temp-script)(-\d+)?$/)) {
    // Will be handled by analyzeUntitledScript
    name = name.replace('untitled', 'temp-script');
  }
  
  // Special markdown rule - if it creates/modifies markdown, lead with markdown
  if (name.includes('markdown') && !name.startsWith('markdown-')) {
    const parts = name.split('-');
    const mdIndex = parts.indexOf('markdown');
    if (mdIndex > 0) {
      parts.splice(mdIndex, 1);
      name = 'markdown-' + parts.join('-');
    }
  }
  
  // Ensure it ends with .gs
  return name + '.gs';
}

function convertToActionNoun(name) {
  // Common patterns to convert
  const patterns = [
    // Pattern: noun-verb → verb-noun
    { from: /^(.+)-(export|import|create|update|delete|process|analyze|format|index|generate|send|fetch|extract|convert|sync|merge|lint|style|sort|dedupe)$/, 
      to: (match, p1, p2) => `${p2}-${p1}` },
    
    // Pattern: noun-verber → verb-noun
    { from: /^(.+)-(exporter|importer|creator|updater|processor|analyzer|formatter|indexer|generator|sender|fetcher|extractor|converter|merger|linter|styler|sorter)$/, 
      to: (match, p1, p2) => `${p2.replace(/er$/, '')}-${p1}` },
    
    // Specific patterns
    { from: /^labels-(.+)$/, to: (match, p1) => `process-labels-${p1}` },
    { from: /^folder-tree$/, to: () => 'generate-folder-tree' },
    { from: /^file-dedupe$/, to: () => 'dedupe-files' },
    { from: /^api-key-checker$/, to: () => 'check-api-key' },
    { from: /^event-assistant$/, to: () => 'assist-events' },
  ];
  
  for (const pattern of patterns) {
    if (pattern.from.test(name)) {
      return name.replace(pattern.from, pattern.to);
    }
  }
  
  // If no pattern matches, try to identify verb at the beginning
  const verbs = ['export', 'import', 'create', 'update', 'delete', 'process', 'analyze', 
                 'format', 'index', 'generate', 'send', 'fetch', 'extract', 'convert', 
                 'sync', 'merge', 'lint', 'style', 'sort', 'dedupe', 'list', 'get', 
                 'set', 'check', 'validate', 'search', 'find'];
  
  const parts = name.split('-');
  if (!verbs.includes(parts[0]) && parts.length > 1) {
    // Try to find a verb in the name and move it to front
    for (let i = 1; i < parts.length; i++) {
      if (verbs.includes(parts[i])) {
        const verb = parts.splice(i, 1)[0];
        return verb + '-' + parts.join('-');
      }
    }
  }
  
  return name;
}

async function findAllGsFiles(dir, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      await findAllGsFiles(fullPath, files);
    } else if (item.endsWith('.gs')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

function generateRenameReport(renames) {
  let report = '# Filename Standardization Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files renamed: ${renames.length}\n\n`;
  
  report += '## Renamed Files\n\n';
  report += '| Old Name | New Name | Location |\n';
  report += '|----------|----------|----------|\n';
  
  renames.forEach(r => {
    report += `| ${r.oldName} | ${r.newName} | ${r.path} |\n`;
  });
  
  report += '\n## Naming Standards Applied\n\n';
  report += '1. Removed version prefixes (v1-, v2-, etc.)\n';
  report += '2. Replaced spaces with hyphens\n';
  report += '3. Removed special characters\n';
  report += '4. Converted to lowercase\n';
  report += '5. Renamed generic files (code.gs → main-code.gs)\n';
  report += '6. Renamed untitled files (untitled.gs → temp-script.gs)\n';
  
  return report;
}

// Run if called directly
if (require.main === module) {
  standardizeFilenames().catch(console.error);
}

module.exports = { standardizeFilenames };