#!/usr/bin/env node

/**
 * Apply smart formatting to all Google Apps Script files
 */

const fs = require('fs').promises;
const path = require('path');

async function applySmartFormatting() {
  console.log('✨ Applying smart formatting to all Google Apps Script files...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  let totalFiles = 0;
  let formattedFiles = 0;
  const changes = [];
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    totalFiles++;
    const originalContent = await fs.readFile(filePath, 'utf8');
    const formattedContent = formatGoogleAppsScript(originalContent, filePath);
    
    if (originalContent !== formattedContent) {
      formattedFiles++;
      await fs.writeFile(filePath, formattedContent);
      
      const fileChanges = getChangeSummary(originalContent, formattedContent);
      changes.push({
        file: filePath.replace(path.join(__dirname, '../../'), ''),
        changes: fileChanges
      });
      console.log(`✅ ${path.basename(filePath)} - formatted`);
    } else {
      console.log(`⏭️  ${path.basename(filePath)} - no changes needed`);
    }
  }
  
  // Generate report
  const report = generateFormattingReport(changes, totalFiles, formattedFiles);
  await fs.writeFile(
    path.join(__dirname, '../../docs/SMART_FORMATTING_REPORT.md'),
    report
  );
  
  console.log(`\n✨ Formatting complete: ${totalFiles} files checked, ${formattedFiles} files formatted`);
  console.log('📄 Report saved to: docs/SMART_FORMATTING_REPORT.md');
  
  return changes;
}

function formatGoogleAppsScript(content, filePath) {
  let formatted = content;
  
  // Add file header if missing
  if (!formatted.startsWith('/**') && !formatted.startsWith('//')) {
    const filename = path.basename(filePath, '.gs');
    const serviceName = getServiceName(filePath);
    formatted = `/**\n * Google Apps Script: ${formatTitle(filename)}\n * Service: ${serviceName}\n */\n\n${formatted}`;
  }
  
  // Fix line endings
  formatted = formatted.replace(/\r\n/g, '\n');
  
  // Trim trailing whitespace
  formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n');
  
  // Fix spacing around operators
  formatted = formatted.replace(/([=!<>+\-*/%&|^])\s*=\s*/g, '$1 = ');
  formatted = formatted.replace(/\s*([+\-*/%])\s*/g, ' $1 ');
  formatted = formatted.replace(/\s*([<>]=?)\s*/g, ' $1 ');
  formatted = formatted.replace(/\s*([&|]{2})\s*/g, ' $1 ');
  
  // Fix function spacing
  formatted = formatted.replace(/function\s*\(/g, 'function (');
  formatted = formatted.replace(/\)\s*{/g, ') {');
  formatted = formatted.replace(/}\s*else\s*{/g, '} else {');
  formatted = formatted.replace(/}\s*else\s+if\s*\(/g, '} else if (');
  formatted = formatted.replace(/if\s*\(/g, 'if (');
  formatted = formatted.replace(/for\s*\(/g, 'for (');
  formatted = formatted.replace(/while\s*\(/g, 'while (');
  formatted = formatted.replace(/catch\s*\(/g, 'catch (');
  
  // Add semicolons where missing (basic)
  const lines = formatted.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip if line is comment, empty, or ends with proper characters
    if (!trimmed || 
        trimmed.startsWith('//') || 
        trimmed.startsWith('*') ||
        trimmed.endsWith(';') ||
        trimmed.endsWith('{') ||
        trimmed.endsWith('}') ||
        trimmed.endsWith(',')) {
      continue;
    }
    
    // Check if it's a statement that needs semicolon
    if ((trimmed.includes('=') && !trimmed.includes('function') && !trimmed.includes('=>')) ||
        trimmed.startsWith('return') ||
        trimmed.startsWith('const ') ||
        trimmed.startsWith('let ') ||
        trimmed.startsWith('var ') ||
        trimmed.startsWith('throw ') ||
        trimmed.startsWith('break') ||
        trimmed.startsWith('continue') ||
        (trimmed.includes('.') && trimmed.includes('(') && trimmed.includes(')'))) {
      lines[i] = line + ';';
    }
  }
  formatted = lines.join('\n');
  
  // Fix multiple consecutive blank lines
  formatted = formatted.replace(/\n\n\n+/g, '\n\n');
  
  // Ensure file ends with newline
  if (!formatted.endsWith('\n')) {
    formatted += '\n';
  }
  
  // Replace console.log with Logger.log
  formatted = formatted.replace(/console\.log/g, 'Logger.log');
  
  // Format common GAS patterns
  formatted = formatted.replace(/SpreadsheetApp\.getActive\(\)/g, 'SpreadsheetApp.getActiveSpreadsheet()');
  formatted = formatted.replace(/DocumentApp\.getActive\(\)/g, 'DocumentApp.getActiveDocument()');
  
  return formatted;
}

function getServiceName(filePath) {
  const parts = filePath.split(path.sep);
  const appsIndex = parts.indexOf('apps');
  if (appsIndex !== -1 && appsIndex + 1 < parts.length) {
    return parts[appsIndex + 1].charAt(0).toUpperCase() + parts[appsIndex + 1].slice(1);
  }
  return 'Unknown';
}

function formatTitle(filename) {
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getChangeSummary(original, formatted) {
  const changes = [];
  
  if (!original.startsWith('/**') && !original.startsWith('//') && formatted.startsWith('/**')) {
    changes.push('Added file header');
  }
  
  if (original.includes('console.log') && !formatted.includes('console.log')) {
    changes.push('Replaced console.log with Logger.log');
  }
  
  const originalLines = original.split('\n');
  const formattedLines = formatted.split('\n');
  
  // Count trimmed lines
  let trimmedLines = 0;
  for (let i = 0; i < originalLines.length && i < formattedLines.length; i++) {
    if (originalLines[i].length > formattedLines[i].length && 
        originalLines[i].trimEnd() === formattedLines[i]) {
      trimmedLines++;
    }
  }
  if (trimmedLines > 0) {
    changes.push(`Trimmed whitespace from ${trimmedLines} lines`);
  }
  
  // Count added semicolons
  const originalSemicolons = (original.match(/;/g) || []).length;
  const formattedSemicolons = (formatted.match(/;/g) || []).length;
  if (formattedSemicolons > originalSemicolons) {
    changes.push(`Added ${formattedSemicolons - originalSemicolons} semicolons`);
  }
  
  if (original.includes('\r\n')) {
    changes.push('Fixed line endings');
  }
  
  return changes;
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

function generateFormattingReport(changes, totalFiles, formattedFiles) {
  let report = '# Smart Formatting Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files checked: ${totalFiles}\n`;
  report += `- Files formatted: ${formattedFiles}\n`;
  report += `- Files unchanged: ${totalFiles - formattedFiles}\n\n`;
  
  if (changes.length === 0) {
    report += '✅ **All files are already properly formatted!**\n';
    return report;
  }
  
  // Change type summary
  const changeCounts = {};
  changes.forEach(file => {
    file.changes.forEach(change => {
      const changeType = change.split(' ')[0];
      changeCounts[changeType] = (changeCounts[changeType] || 0) + 1;
    });
  });
  
  report += '## Changes by Type\n\n';
  report += '| Change Type | Count |\n';
  report += '|-------------|-------|\n';
  Object.entries(changeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      report += `| ${type} | ${count} |\n`;
    });
  
  report += '\n## Files Formatted\n\n';
  
  changes.forEach(file => {
    report += `### ${file.file}\n\n`;
    file.changes.forEach(change => {
      report += `- ${change}\n`;
    });
    report += '\n';
  });
  
  report += '## Formatting Rules Applied\n\n';
  report += '1. **File Headers**: Added descriptive headers to files missing them\n';
  report += '2. **Line Endings**: Normalized to Unix-style (LF)\n';
  report += '3. **Whitespace**: Removed trailing whitespace from all lines\n';
  report += '4. **Semicolons**: Added missing semicolons to statements\n';
  report += '5. **Spacing**: Fixed spacing around operators and keywords\n';
  report += '6. **Logger**: Replaced console.log with Logger.log (GAS standard)\n';
  report += '7. **Blank Lines**: Reduced multiple consecutive blank lines to maximum 2\n';
  report += '8. **EOF**: Ensured files end with a newline\n';
  
  return report;
}

// Run if called directly
if (require.main === module) {
  applySmartFormatting().catch(console.error);
}

module.exports = { applySmartFormatting };