#!/usr/bin/env node

/**
 * Analyze Google Apps Scripts to verify naming and folder placement
 * Combines linting with content analysis
 */

const fs = require('fs').promises;
const path = require('path');

async function analyzeAndVerifyScripts() {
  console.log('🔍 Analyzing all Google Apps Script files...\n');
  
  const appsDir = path.join(__dirname, '../../apps');
  const issues = [];
  const renamesSuggested = [];
  const movesSuggested = [];
  let totalFiles = 0;
  
  // Find all .gs files
  const allFiles = await findAllGsFiles(appsDir);
  
  for (const filePath of allFiles) {
    totalFiles++;
    const content = await fs.readFile(filePath, 'utf8');
    const filename = path.basename(filePath, '.gs');
    const currentFolder = path.dirname(filePath).split('/').pop();
    
    // Analyze script content
    const analysis = analyzeScriptContent(content, filename);
    
    // Check naming convention
    const namingIssues = checkNamingConvention(filename, analysis);
    
    // Check folder placement
    const folderIssue = checkFolderPlacement(currentFolder, analysis);
    
    // Process temp scripts
    if (filename.startsWith('temp-script') || filename === 'untitled' || filename === 'code') {
      const suggestedName = generateNameFromAnalysis(analysis);
      const suggestedFolder = determineBestFolder(analysis);
      
      renamesSuggested.push({
        file: filePath,
        currentName: filename,
        suggestedName: suggestedName,
        reason: analysis.purpose
      });
      
      if (suggestedFolder !== currentFolder) {
        movesSuggested.push({
          file: filePath,
          currentFolder: currentFolder,
          suggestedFolder: suggestedFolder,
          reason: analysis.mainService
        });
      }
    }
    
    // Collect all issues
    if (namingIssues.length > 0 || folderIssue || analysis.lintIssues.length > 0) {
      issues.push({
        file: filePath.replace(path.join(__dirname, '../../'), ''),
        currentName: filename,
        currentFolder: currentFolder,
        analysis: analysis,
        namingIssues: namingIssues,
        folderIssue: folderIssue,
        lintIssues: analysis.lintIssues
      });
    }
    
    // Display progress
    const status = (namingIssues.length > 0 || folderIssue) ? '❌' : '✅';
    console.log(`${status} ${filename} (${currentFolder})`);
    if (namingIssues.length > 0) {
      namingIssues.forEach(issue => console.log(`   - Naming: ${issue}`));
    }
    if (folderIssue) {
      console.log(`   - Folder: ${folderIssue}`);
    }
    if (analysis.purpose) {
      console.log(`   - Purpose: ${analysis.purpose}`);
    }
  }
  
  // Generate comprehensive report
  const report = generateAnalysisReport(issues, renamesSuggested, movesSuggested, totalFiles);
  await fs.writeFile(
    path.join(__dirname, '../../docs/SCRIPT_ANALYSIS_REPORT.md'),
    report
  );
  
  console.log(`\n📊 Analysis complete: ${totalFiles} files analyzed`);
  console.log(`📄 Report saved to: docs/SCRIPT_ANALYSIS_REPORT.md`);
  
  // Generate rename script if needed
  if (renamesSuggested.length > 0 || movesSuggested.length > 0) {
    await generateFixScript(renamesSuggested, movesSuggested);
    console.log(`🔧 Fix script generated: automation/dev-tools/fix-script-issues.js`);
  }
  
  return { issues, renamesSuggested, movesSuggested };
}

function analyzeScriptContent(content, filename) {
  const analysis = {
    purpose: '',
    actions: [],
    nouns: [],
    mainService: '',
    usesMarkdown: false,
    lintIssues: [],
    functions: [],
    imports: []
  };
  
  // Extract functions
  const functionMatches = content.matchAll(/function\s+(\w+)\s*\(/g);
  for (const match of functionMatches) {
    analysis.functions.push(match[1]);
  }
  
  // Detect main service
  const servicePatterns = {
    gmail: /GmailApp|Gmail|getThreads|getMessages|getLabels/i,
    drive: /DriveApp|Drive|getFolders|getFiles|createFile|createFolder/i,
    sheets: /SpreadsheetApp|getActiveSheet|getRange|setValue|getValues/i,
    docs: /DocumentApp|getBody|getParagraphs|setText/i,
    calendar: /CalendarApp|getEvents|createEvent|getCalendars/i,
    tasks: /Tasks\.Tasklists|Tasks\.Tasks|tasklist/i,
    photos: /Photos|Albums|MediaItems/i
  };
  
  for (const [service, pattern] of Object.entries(servicePatterns)) {
    if (pattern.test(content)) {
      analysis.mainService = service;
      break;
    }
  }
  
  // Detect markdown usage
  analysis.usesMarkdown = /\.md['"]/i.test(content) || 
                         /markdown/i.test(content) || 
                         /\[.*\]\(.*\)/.test(content) ||
                         /^#+\s/m.test(content);
  
  // Extract actions
  const actionPatterns = [
    { pattern: /export/i, action: 'export' },
    { pattern: /import/i, action: 'import' },
    { pattern: /create/i, action: 'create' },
    { pattern: /update/i, action: 'update' },
    { pattern: /delete|remove/i, action: 'delete' },
    { pattern: /process/i, action: 'process' },
    { pattern: /analyze|analysis/i, action: 'analyze' },
    { pattern: /format/i, action: 'format' },
    { pattern: /index/i, action: 'index' },
    { pattern: /generate/i, action: 'generate' },
    { pattern: /send/i, action: 'send' },
    { pattern: /fetch|get|retrieve/i, action: 'fetch' },
    { pattern: /extract/i, action: 'extract' },
    { pattern: /convert/i, action: 'convert' },
    { pattern: /sync/i, action: 'sync' },
    { pattern: /merge/i, action: 'merge' },
    { pattern: /lint/i, action: 'lint' },
    { pattern: /style/i, action: 'style' },
    { pattern: /sort/i, action: 'sort' },
    { pattern: /dedupe|dedup/i, action: 'dedupe' },
    { pattern: /list/i, action: 'list' },
    { pattern: /check|validate/i, action: 'check' },
    { pattern: /search|find/i, action: 'search' },
    { pattern: /mark/i, action: 'mark' },
    { pattern: /count/i, action: 'count' },
    { pattern: /clean/i, action: 'clean' }
  ];
  
  actionPatterns.forEach(({ pattern, action }) => {
    if (pattern.test(content) || pattern.test(filename)) {
      analysis.actions.push(action);
    }
  });
  
  // Extract nouns
  const nounPatterns = [
    { pattern: /label/i, noun: 'labels' },
    { pattern: /folder/i, noun: 'folders' },
    { pattern: /file/i, noun: 'files' },
    { pattern: /email|message|thread/i, noun: 'emails' },
    { pattern: /sheet|spreadsheet/i, noun: 'sheets' },
    { pattern: /doc|document/i, noun: 'docs' },
    { pattern: /event|meeting|calendar/i, noun: 'events' },
    { pattern: /task|todo/i, noun: 'tasks' },
    { pattern: /photo|album|image/i, noun: 'photos' },
    { pattern: /row/i, noun: 'rows' },
    { pattern: /column/i, noun: 'columns' },
    { pattern: /tab/i, noun: 'tabs' },
    { pattern: /tree/i, noun: 'tree' },
    { pattern: /snippet/i, noun: 'snippets' },
    { pattern: /comment/i, noun: 'comments' },
    { pattern: /metadata/i, noun: 'metadata' },
    { pattern: /stats|statistics/i, noun: 'stats' },
    { pattern: /pdf/i, noun: 'pdf' },
    { pattern: /yaml|frontmatter/i, noun: 'yaml' },
    { pattern: /header/i, noun: 'headers' },
    { pattern: /subject/i, noun: 'subject' },
    { pattern: /sender/i, noun: 'sender' },
    { pattern: /date|time/i, noun: 'dates' },
    { pattern: /distance/i, noun: 'distance' },
    { pattern: /duration/i, noun: 'duration' }
  ];
  
  nounPatterns.forEach(({ pattern, noun }) => {
    if (pattern.test(content) || pattern.test(filename)) {
      analysis.nouns.push(noun);
    }
  });
  
  // Basic lint checks
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line !== line.trimEnd()) {
      analysis.lintIssues.push({ line: index + 1, issue: 'trailing-whitespace' });
    }
    if (line.includes('console.log')) {
      analysis.lintIssues.push({ line: index + 1, issue: 'console-log' });
    }
  });
  
  // Determine purpose based on content
  if (analysis.actions.length > 0 && analysis.nouns.length > 0) {
    const primaryAction = analysis.actions[0];
    const primaryNoun = analysis.nouns[0];
    analysis.purpose = `${primaryAction} ${primaryNoun}`;
  } else if (filename.includes('untitled') || filename.includes('temp-script')) {
    // Try to infer from function names
    if (analysis.functions.length > 0) {
      const mainFunction = analysis.functions.find(f => !f.startsWith('helper') && !f.startsWith('util'));
      if (mainFunction) {
        analysis.purpose = `based on function: ${mainFunction}`;
      }
    }
  }
  
  return analysis;
}

function checkNamingConvention(filename, analysis) {
  const issues = [];
  
  // Check for action-noun format
  const parts = filename.split('-');
  const verbs = ['export', 'import', 'create', 'update', 'delete', 'process', 'analyze', 
                 'format', 'index', 'generate', 'send', 'fetch', 'extract', 'convert', 
                 'sync', 'merge', 'lint', 'style', 'sort', 'dedupe', 'list', 'get', 
                 'check', 'validate', 'search', 'find', 'mark', 'count', 'clean', 'updat',
                 'formatt', 'processor'];
  
  // Special case for markdown files
  if (analysis.usesMarkdown && !filename.startsWith('markdown-')) {
    issues.push('Markdown-related script should start with "markdown-"');
  }
  
  // Check if starts with verb (action)
  const startsWithVerb = verbs.some(verb => parts[0] === verb);
  if (!startsWithVerb && !filename.startsWith('markdown-')) {
    issues.push('Should start with an action verb (export, create, process, etc.)');
  }
  
  // Check for service prefix that should be removed
  const servicePrefixes = ['gmail', 'drive', 'sheets', 'calendar', 'tasks', 'docs', 'chat', 'photos'];
  if (servicePrefixes.some(prefix => parts[0] === prefix)) {
    issues.push('Remove service prefix (already in folder structure)');
  }
  
  // Check for temp/generic names
  if (filename.startsWith('temp-script') || filename === 'untitled' || filename === 'code') {
    issues.push('Generic/temporary name needs to be replaced with descriptive action-noun name');
  }
  
  // Check for camelCase
  if (/[a-z][A-Z]/.test(filename)) {
    issues.push('Contains camelCase - should be kebab-case');
  }
  
  return issues;
}

function checkFolderPlacement(currentFolder, analysis) {
  if (!analysis.mainService) {
    return null;
  }
  
  if (currentFolder !== analysis.mainService && currentFolder !== 'utility') {
    return `Should be in '${analysis.mainService}' folder based on content`;
  }
  
  return null;
}

function generateNameFromAnalysis(analysis) {
  // If markdown-related, start with markdown
  if (analysis.usesMarkdown) {
    const action = analysis.actions[0] || 'process';
    const noun = analysis.nouns[0] || 'content';
    return `markdown-${action}-${noun}`;
  }
  
  // Standard action-noun format
  const action = analysis.actions[0] || 'process';
  const noun = analysis.nouns[0] || 'data';
  
  // Handle special cases
  if (noun === 'labels' && action === 'process') {
    return `${action}-labels-${analysis.actions[1] || 'data'}`;
  }
  
  return `${action}-${noun}`;
}

function determineBestFolder(analysis) {
  if (analysis.mainService) {
    return analysis.mainService;
  }
  
  // Default to utility if no clear service
  return 'utility';
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

function generateAnalysisReport(issues, renames, moves, totalFiles) {
  let report = '# Script Analysis and Verification Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n`;
  report += `- Total files analyzed: ${totalFiles}\n`;
  report += `- Files with issues: ${issues.length}\n`;
  report += `- Rename suggestions: ${renames.length}\n`;
  report += `- Move suggestions: ${moves.length}\n\n`;
  
  // Naming convention issues
  const namingIssueFiles = issues.filter(i => i.namingIssues.length > 0);
  if (namingIssueFiles.length > 0) {
    report += '## Naming Convention Issues\n\n';
    namingIssueFiles.forEach(issue => {
      report += `### ${issue.file}\n`;
      report += `Current name: **${issue.currentName}**\n\n`;
      issue.namingIssues.forEach(ni => {
        report += `- ${ni}\n`;
      });
      if (issue.analysis.purpose) {
        report += `\nDetected purpose: ${issue.analysis.purpose}\n`;
      }
      report += '\n';
    });
  }
  
  // Folder placement issues
  const folderIssueFiles = issues.filter(i => i.folderIssue);
  if (folderIssueFiles.length > 0) {
    report += '## Folder Placement Issues\n\n';
    folderIssueFiles.forEach(issue => {
      report += `- **${issue.file}**: ${issue.folderIssue}\n`;
    });
    report += '\n';
  }
  
  // Temp script suggestions
  if (renames.length > 0) {
    report += '## Temporary Script Rename Suggestions\n\n';
    report += '| Current Name | Suggested Name | Reason |\n';
    report += '|--------------|----------------|--------|\n';
    renames.forEach(r => {
      report += `| ${r.currentName} | ${r.suggestedName} | ${r.reason || 'Based on content analysis'} |\n`;
    });
    report += '\n';
  }
  
  // Move suggestions
  if (moves.length > 0) {
    report += '## Move Suggestions\n\n';
    report += '| File | Current Folder | Suggested Folder | Reason |\n';
    report += '|------|----------------|------------------|--------|\n';
    moves.forEach(m => {
      report += `| ${path.basename(m.file)} | ${m.currentFolder} | ${m.suggestedFolder} | Uses ${m.reason} |\n`;
    });
    report += '\n';
  }
  
  report += '## Naming Rules\n\n';
  report += '1. **Action-Noun Format**: Files should be named with action-noun (e.g., export-labels, create-folders)\n';
  report += '2. **Markdown Exception**: Scripts that create/modify markdown should start with "markdown-"\n';
  report += '3. **No Service Prefix**: Remove gmail-, drive-, etc. prefixes (use folder structure instead)\n';
  report += '4. **Kebab Case**: Use hyphens, not camelCase or underscores\n';
  report += '5. **Descriptive Names**: Replace generic names (temp-script, untitled, code) with descriptive ones\n';
  
  return report;
}

async function generateFixScript(renames, moves) {
  let script = `#!/usr/bin/env node

/**
 * Fix script naming and placement issues
 * Generated from analysis report
 */

const fs = require('fs').promises;
const path = require('path');

async function fixScriptIssues() {
  console.log('🔧 Fixing script naming and placement issues...\\n');
  
  const renames = ${JSON.stringify(renames, null, 2)};
  
  const moves = ${JSON.stringify(moves, null, 2)};
  
  // Process renames
  for (const rename of renames) {
    const dir = path.dirname(rename.file);
    const newPath = path.join(dir, rename.suggestedName + '.gs');
    
    try {
      await fs.rename(rename.file, newPath);
      console.log(\`✅ Renamed: \${rename.currentName}.gs → \${rename.suggestedName}.gs\`);
    } catch (error) {
      console.error(\`❌ Failed to rename \${rename.currentName}.gs: \${error.message}\`);
    }
  }
  
  // Process moves
  for (const move of moves) {
    const filename = path.basename(move.file);
    const newDir = move.file.replace(\`/\${move.currentFolder}/\`, \`/\${move.suggestedFolder}/\`);
    const newPath = path.join(path.dirname(newDir), filename);
    
    try {
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(move.file, newPath);
      console.log(\`✅ Moved: \${filename} from \${move.currentFolder} → \${move.suggestedFolder}\`);
    } catch (error) {
      console.error(\`❌ Failed to move \${filename}: \${error.message}\`);
    }
  }
  
  console.log('\\n✅ Fix script completed');
}

// Run if called directly
if (require.main === module) {
  fixScriptIssues().catch(console.error);
}
`;
  
  await fs.writeFile(
    path.join(__dirname, 'fix-script-issues.js'),
    script
  );
}

// Run if called directly
if (require.main === module) {
  analyzeAndVerifyScripts().catch(console.error);
}

module.exports = { analyzeAndVerifyScripts };