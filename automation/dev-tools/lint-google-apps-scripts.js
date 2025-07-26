#!/usr/bin/env node

/**
 * Lint all Google Apps Script files
 */

const fs = require('fs').promises;
const path = require('path');

async function lintGoogleAppsScripts() {
  console.log('🔍 Linting all Google Apps Script files...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  let totalFiles = 0;
  let filesWithIssues = 0;
  const issues = [];
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    totalFiles++;
    const fileIssues = await lintFile(filePath);
    
    if (fileIssues.length > 0) {
      filesWithIssues++;
      issues.push({
        file: filePath.replace(path.join(__dirname, '../../'), ''),
        issues: fileIssues
      });
      console.log(`❌ ${path.basename(filePath)} - ${fileIssues.length} issues`);
    } else {
      console.log(`✅ ${path.basename(filePath)}`);
    }
  }
  
  // Generate report
  const report = generateLintReport(issues, totalFiles, filesWithIssues);
  await fs.writeFile(
    path.join(__dirname, '../../docs/LINT_REPORT.md'),
    report
  );
  
  console.log(`\n📊 Linting complete: ${totalFiles} files checked, ${filesWithIssues} files with issues`);
  console.log('📄 Report saved to: docs/LINT_REPORT.md');
  
  return issues;
}

async function lintFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Trailing whitespace
    if (line !== line.trimEnd()) {
      issues.push({
        line: lineNum,
        type: 'trailing-whitespace',
        message: 'Trailing whitespace'
      });
    }
    
    // Line length (max 120 characters)
    if (line.length > 120) {
      issues.push({
        line: lineNum,
        type: 'line-too-long',
        message: `Line too long (${line.length} > 120)`
      });
    }
    
    // TODO comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        line: lineNum,
        type: 'todo-comment',
        message: 'TODO/FIXME comment found'
      });
    }
    
    // console.log statements
    if (line.includes('console.log')) {
      issues.push({
        line: lineNum,
        type: 'console-log',
        message: 'console.log statement (use Logger.log for GAS)'
      });
    }
    
    // Missing semicolons (basic check)
    const trimmed = line.trim();
    if (trimmed && 
        !trimmed.endsWith(';') && 
        !trimmed.endsWith('{') && 
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*') &&
        !trimmed.includes('function') &&
        !trimmed.includes('if') &&
        !trimmed.includes('else') &&
        !trimmed.includes('for') &&
        !trimmed.includes('while') &&
        !trimmed.includes('try') &&
        !trimmed.includes('catch') &&
        index < lines.length - 1) {
      // More specific check for actual statements
      if (trimmed.includes('=') || trimmed.includes('return') || trimmed.includes('const') || trimmed.includes('let') || trimmed.includes('var')) {
        issues.push({
          line: lineNum,
          type: 'missing-semicolon',
          message: 'Possible missing semicolon'
        });
      }
    }
  });
  
  // File-level checks
  
  // Missing file header comment
  if (!content.startsWith('/**') && !content.startsWith('//')) {
    issues.push({
      line: 1,
      type: 'missing-header',
      message: 'Missing file header comment'
    });
  }
  
  // Empty file
  if (content.trim() === '') {
    issues.push({
      line: 1,
      type: 'empty-file',
      message: 'File is empty'
    });
  }
  
  // Multiple consecutive blank lines
  let consecutiveBlankLines = 0;
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      consecutiveBlankLines++;
      if (consecutiveBlankLines > 2) {
        issues.push({
          line: index + 1,
          type: 'excessive-blank-lines',
          message: 'More than 2 consecutive blank lines'
        });
      }
    } else {
      consecutiveBlankLines = 0;
    }
  });
  
  return issues;
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

function generateLintReport(issues, totalFiles, filesWithIssues) {
  let report = '# Google Apps Script Lint Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files checked: ${totalFiles}\n`;
  report += `- Files with issues: ${filesWithIssues}\n`;
  report += `- Total issues found: ${issues.reduce((sum, file) => sum + file.issues.length, 0)}\n\n`;
  
  if (issues.length === 0) {
    report += '✅ **No issues found!**\n';
    return report;
  }
  
  // Issue type summary
  const issueCounts = {};
  issues.forEach(file => {
    file.issues.forEach(issue => {
      issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
    });
  });
  
  report += '## Issues by Type\n\n';
  report += '| Issue Type | Count |\n';
  report += '|------------|-------|\n';
  Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      report += `| ${type} | ${count} |\n`;
    });
  
  report += '\n## Files with Issues\n\n';
  
  issues.forEach(file => {
    report += `### ${file.file}\n\n`;
    report += `**Issues: ${file.issues.length}**\n\n`;
    
    file.issues.forEach(issue => {
      report += `- Line ${issue.line}: [${issue.type}] ${issue.message}\n`;
    });
    report += '\n';
  });
  
  report += '## Lint Rules\n\n';
  report += '1. **trailing-whitespace**: No trailing whitespace at end of lines\n';
  report += '2. **line-too-long**: Lines should not exceed 120 characters\n';
  report += '3. **todo-comment**: TODO/FIXME comments should be resolved\n';
  report += '4. **console-log**: Use Logger.log instead of console.log in GAS\n';
  report += '5. **missing-semicolon**: Statements should end with semicolons\n';
  report += '6. **missing-header**: Files should have header comments\n';
  report += '7. **empty-file**: Files should not be empty\n';
  report += '8. **excessive-blank-lines**: No more than 2 consecutive blank lines\n';
  
  return report;
}

// Run if called directly
if (require.main === module) {
  lintGoogleAppsScripts().catch(console.error);
}

module.exports = { lintGoogleAppsScripts };